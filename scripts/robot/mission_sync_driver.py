#!/usr/bin/env python3
"""
Mission Sync Driver for TurtleBot 4 — with obstacle avoidance & trash detection.

Reads the shared mission timeline JSON and drives the robot through keyframes
using /cmd_vel.  Layers on:
  1. LIDAR-based obstacle avoidance  (chairs, tables, walls, people)
  2. YOLOv8 camera-based trash detection  (bottles, cups, wrappers, cans …)

Requires:
    pip install ultralytics opencv-python-headless "numpy<2"
    (plus the standard ros-humble-* turtlebot4 stack)
"""

import argparse
import json
import math
import threading
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np
import rclpy
from cv_bridge import CvBridge
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry
from rclpy.callback_groups import MutuallyExclusiveCallbackGroup, ReentrantCallbackGroup
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node
from sensor_msgs.msg import Image, LaserScan
from ultralytics import YOLO

# ─── helpers ────────────────────────────────────────────────────────────────


def normalize_angle(angle: float) -> float:
    return math.atan2(math.sin(angle), math.cos(angle))


def normalize_angle_array(angles: np.ndarray) -> np.ndarray:
    """Vectorized version for use on LaserScan angle arrays."""
    return np.arctan2(np.sin(angles), np.cos(angles))


def yaw_from_quaternion(x: float, y: float, z: float, w: float) -> float:
    siny_cosp = 2.0 * (w * z + x * y)
    cosy_cosp = 1.0 - 2.0 * (y * y + z * z)
    return math.atan2(siny_cosp, cosy_cosp)


# COCO class IDs that count as "trash" — extend as needed
TRASH_CLASS_IDS: set = {
    39,  # bottle
    41,  # cup
    46,  # banana (peel)
}
TRASH_LABELS: Dict[int, str] = {
    39: "bottle",
    41: "cup",
    46: "banana",
}


# ─── node ───────────────────────────────────────────────────────────────────


class MissionSyncDriver(Node):
    """Drive through mission keyframes while avoiding obstacles and spotting trash."""

    def __init__(
        self,
        mission_file: Path,
        map_width_m: float,
        map_height_m: float,
        yolo_model: str,
        detection_conf: float,
        obstacle_front_m: float,
        obstacle_side_m: float,
        camera_topic: str,
    ) -> None:
        super().__init__("mission_sync_driver")

        # ── mission ──────────────────────────────────────────────────────
        self.mission = self._load_mission(mission_file)
        self.keyframes = self.mission["keyframes"]
        self.duration_sec = float(self.mission["durationSec"])
        self.map_width_m = map_width_m
        self.map_height_m = map_height_m

        # ── motion tuning ────────────────────────────────────────────────
        self.max_linear = 0.24
        self.max_angular = 1.1
        self.goal_tolerance_m = 0.09
        self.heading_tolerance_rad = 0.18

        # ── obstacle avoidance ───────────────────────────────────────────
        self.obstacle_front_m = obstacle_front_m
        self.obstacle_side_m = obstacle_side_m
        self.front_arc_deg = 60.0
        self.side_arc_deg = 90.0
        self.latest_scan: Optional[LaserScan] = None

        # Fix #5: hysteresis — commit to a steer direction until front clears
        self.committed_steer: Optional[str] = None  # "steer_left" | "steer_right" | None
        self.steer_clear_front_m = obstacle_front_m * 1.4  # need extra clearance to release

        # Fix #1: manual log throttle
        self._last_block_log = 0.0

        # ── trash detection ──────────────────────────────────────────────
        self.yolo = YOLO(yolo_model)
        self.detection_conf = detection_conf
        self.bridge = CvBridge()
        self.detect_interval_sec = 1.0
        self.pause_after_detect_sec = 2.0
        self.pause_until: Optional[float] = None
        self.detections_log: List[Dict[str, Any]] = []
        self._detections_dumped = False

        # Fix #8: run YOLO in a background worker thread, not in the callback.
        # The callback just hands off the latest frame; the worker picks it up.
        self._frame_lock = threading.Lock()
        self._latest_frame: Optional[np.ndarray] = None
        self._frame_stamp: float = 0.0
        self._last_processed_stamp: float = 0.0
        self._worker_stop = threading.Event()
        self._worker = threading.Thread(target=self._yolo_worker, daemon=True)

        # ── pose ─────────────────────────────────────────────────────────
        self.pose_x = 0.0
        self.pose_y = 0.0
        self.pose_yaw = 0.0
        self.have_odom = False
        self.started_at = self.get_clock().now()

        # ── ROS wiring ──────────────────────────────────────────────────
        # Fix #8: put the image sub in its own callback group so a slow
        # imgmsg_to_cv2 call can't block /scan or /odom under a
        # MultiThreadedExecutor.
        sensor_group = MutuallyExclusiveCallbackGroup()
        image_group = MutuallyExclusiveCallbackGroup()
        timer_group = MutuallyExclusiveCallbackGroup()

        self.cmd_pub = self.create_publisher(Twist, "/cmd_vel", 10)
        self.create_subscription(
            Odometry, "/odom", self._on_odom, 20, callback_group=sensor_group
        )
        self.create_subscription(
            LaserScan, "/scan", self._on_scan, 10, callback_group=sensor_group
        )
        self.create_subscription(
            Image, camera_topic, self._on_image, 5, callback_group=image_group
        )
        self.timer = self.create_timer(
            0.1, self._tick, callback_group=timer_group
        )

        self._worker.start()

        self.get_logger().info(
            f"Mission '{self.mission['name']}' loaded "
            f"({self.duration_sec:.1f}s, {len(self.keyframes)} keyframes). "
            f"YOLO model: {yolo_model}, obstacle front: {obstacle_front_m}m"
        )

    # ── mission file ────────────────────────────────────────────────────

    def _load_mission(self, path: Path) -> Dict[str, Any]:
        with path.open("r", encoding="utf-8") as f:
            mission = json.load(f)
        if "keyframes" not in mission or len(mission["keyframes"]) < 2:
            raise ValueError("Mission must include at least 2 keyframes.")
        return mission

    # ── callbacks ───────────────────────────────────────────────────────

    def _on_odom(self, msg: Odometry) -> None:
        self.pose_x = msg.pose.pose.position.x
        self.pose_y = msg.pose.pose.position.y
        q = msg.pose.pose.orientation
        self.pose_yaw = yaw_from_quaternion(q.x, q.y, q.z, q.w)
        self.have_odom = True

    def _on_scan(self, msg: LaserScan) -> None:
        self.latest_scan = msg

    def _on_image(self, msg: Image) -> None:
        """Fast path: just stash the frame. Worker thread does the heavy lifting."""
        try:
            frame = self.bridge.imgmsg_to_cv2(msg, desired_encoding="bgr8")
        except Exception as e:
            self.get_logger().warn(f"cv_bridge error: {e}")
            return

        with self._frame_lock:
            self._latest_frame = frame
            self._frame_stamp = time.monotonic()

    # ── YOLO worker thread (fix #8) ─────────────────────────────────────

    def _yolo_worker(self) -> None:
        """Pull the latest frame and run inference at the throttled rate."""
        while not self._worker_stop.is_set():
            with self._frame_lock:
                frame = self._latest_frame
                stamp = self._frame_stamp

            # No new frame, or we've already processed this one, or throttle not elapsed
            if (
                frame is None
                or stamp == self._last_processed_stamp
                or (time.monotonic() - self._last_processed_stamp) < self.detect_interval_sec
            ):
                time.sleep(0.05)
                continue

            self._last_processed_stamp = stamp

            try:
                results = self.yolo(frame, conf=self.detection_conf, verbose=False)
            except Exception as e:
                self.get_logger().warn(f"YOLO inference error: {e}")
                continue

            if not results or results[0].boxes is None:
                continue

            found_any = False
            for box in results[0].boxes:
                cls_id = int(box.cls[0])
                if cls_id not in TRASH_CLASS_IDS:
                    continue

                conf = float(box.conf[0])
                label = TRASH_LABELS.get(cls_id, f"class_{cls_id}")
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detection = {
                    "label": label,
                    "confidence": round(conf, 3),
                    "bbox": [round(v, 1) for v in (x1, y1, x2, y2)],
                    "robot_x": round(self.pose_x, 3),
                    "robot_y": round(self.pose_y, 3),
                    "timestamp": self._mission_elapsed(),
                }
                self.detections_log.append(detection)
                self.get_logger().info(
                    f"TRASH DETECTED: {label} ({conf:.0%}) @ robot pos "
                    f"({self.pose_x:.2f}, {self.pose_y:.2f})"
                )
                found_any = True

            if found_any:
                self.pause_until = time.monotonic() + self.pause_after_detect_sec

    # ── obstacle avoidance (fixes #2 + #5) ──────────────────────────────

    def _evaluate_obstacles(self) -> str:
        """
        Partition the LIDAR scan into a front arc and side arcs.
        Returns one of: 'clear', 'steer_left', 'steer_right', 'blocked'.

        Fix #2: use vectorized normalize_angle_array instead of scalar math.atan2.
        Fix #5: once committed to a steer direction, hold it until the front is
        clearly open, to prevent left/right oscillation at the arc edge.
        """
        scan = self.latest_scan
        if scan is None:
            return "clear"

        ranges = np.asarray(scan.ranges, dtype=np.float32)
        n = ranges.size
        if n == 0:
            return "clear"

        angles = np.linspace(scan.angle_min, scan.angle_max, n, dtype=np.float32)
        ranges = np.where(np.isfinite(ranges), ranges, 100.0)

        front_half = math.radians(self.front_arc_deg / 2.0)
        side_half = math.radians(self.side_arc_deg / 2.0)

        norm_angles = normalize_angle_array(angles)
        front_mask = np.abs(norm_angles) < front_half
        left_mask = (norm_angles >= front_half) & (norm_angles < side_half)
        right_mask = (norm_angles <= -front_half) & (norm_angles > -side_half)

        front_min = float(np.min(ranges[front_mask])) if np.any(front_mask) else 100.0
        left_min = float(np.min(ranges[left_mask])) if np.any(left_mask) else 100.0
        right_min = float(np.min(ranges[right_mask])) if np.any(right_mask) else 100.0

        # Hysteresis: if we're already committed to a turn, only release it
        # once the front is open past a higher threshold.
        if self.committed_steer is not None:
            if front_min > self.steer_clear_front_m:
                self.committed_steer = None
                return "clear"
            return self.committed_steer

        if front_min > self.obstacle_front_m:
            return "clear"

        # Front blocked — pick a direction and commit.
        if left_min > self.obstacle_side_m and right_min > self.obstacle_side_m:
            choice = "steer_left" if left_min >= right_min else "steer_right"
        elif left_min > self.obstacle_side_m:
            choice = "steer_left"
        elif right_min > self.obstacle_side_m:
            choice = "steer_right"
        else:
            return "blocked"

        self.committed_steer = choice
        return choice

    # ── mission interpolation ───────────────────────────────────────────

    def _mission_elapsed(self) -> float:
        now = self.get_clock().now()
        return (now - self.started_at).nanoseconds / 1e9

    def _to_meters(self, kf: Dict[str, Any]) -> Tuple[float, float]:
        return (
            float(kf["x"]) * self.map_width_m,
            float(kf["y"]) * self.map_height_m,
        )

    def _target_for_time(self, elapsed_sec: float) -> Tuple[float, float]:
        if elapsed_sec >= self.duration_sec:
            return self._to_meters(self.keyframes[-1])

        next_idx = next(
            (i for i, kf in enumerate(self.keyframes) if float(kf["tSec"]) > elapsed_sec),
            1,
        )
        prev_kf = self.keyframes[next_idx - 1]
        next_kf = self.keyframes[next_idx]
        t0 = float(prev_kf["tSec"])
        t1 = float(next_kf["tSec"])
        ratio = 0.0 if t1 <= t0 else max(0.0, min(1.0, (elapsed_sec - t0) / (t1 - t0)))

        x0, y0 = self._to_meters(prev_kf)
        x1, y1 = self._to_meters(next_kf)
        return (x0 + (x1 - x0) * ratio, y0 + (y1 - y0) * ratio)

    # ── main control loop ───────────────────────────────────────────────

    def _tick(self) -> None:
        if not self.have_odom:
            return

        if self.pause_until is not None:
            if time.monotonic() < self.pause_until:
                self.cmd_pub.publish(Twist())
                return
            self.pause_until = None

        elapsed = self._mission_elapsed()
        target_x, target_y = self._target_for_time(elapsed)
        dx = target_x - self.pose_x
        dy = target_y - self.pose_y
        dist = math.hypot(dx, dy)

        if elapsed >= self.duration_sec and dist < self.goal_tolerance_m:
            self.cmd_pub.publish(Twist())
            self.get_logger().info("Mission complete.")
            # Let main's finally{} handle shutdown + dump cleanly
            self._worker_stop.set()
            rclpy.shutdown()
            return

        obstacle_state = self._evaluate_obstacles()
        cmd = Twist()

        if obstacle_state == "blocked":
            self.cmd_pub.publish(Twist())
            # Fix #1: manual throttle
            now = time.monotonic()
            if now - self._last_block_log > 2.0:
                self.get_logger().info("Path blocked — waiting…")
                self._last_block_log = now
            return

        if obstacle_state.startswith("steer_"):
            direction = 1.0 if obstacle_state == "steer_left" else -1.0
            cmd.angular.z = direction * 0.6 * self.max_angular
            self.cmd_pub.publish(cmd)
            return

        desired_yaw = math.atan2(dy, dx)
        yaw_error = normalize_angle(desired_yaw - self.pose_yaw)

        if abs(yaw_error) > self.heading_tolerance_rad:
            cmd.angular.z = max(-self.max_angular, min(self.max_angular, 1.9 * yaw_error))
        else:
            cmd.linear.x = max(0.0, min(self.max_linear, 0.8 * dist))
            cmd.angular.z = max(-self.max_angular, min(self.max_angular, 1.4 * yaw_error))

        self.cmd_pub.publish(cmd)

    # ── output ──────────────────────────────────────────────────────────

    def _dump_detections(self) -> None:
        if self._detections_dumped:
            return
        self._detections_dumped = True

        if not self.detections_log:
            self.get_logger().info("No trash detected during mission.")
            return

        out_path = Path("detections.json")
        with out_path.open("w", encoding="utf-8") as f:
            json.dump(self.detections_log, f, indent=2)
        self.get_logger().info(
            f"Wrote {len(self.detections_log)} detection(s) → {out_path.resolve()}"
        )

    def stop_worker(self) -> None:
        self._worker_stop.set()
        if self._worker.is_alive():
            self._worker.join(timeout=2.0)


# ─── CLI ────────────────────────────────────────────────────────────────────


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="TurtleBot 4 mission driver with obstacle avoidance & trash detection."
    )
    p.add_argument("--mission", default="demo-mission.json")
    p.add_argument("--map-width-m", type=float, default=4.2)
    p.add_argument("--map-height-m", type=float, default=3.0)
    p.add_argument("--yolo-model", default="yolov8n.pt")
    p.add_argument("--detection-conf", type=float, default=0.45)
    p.add_argument("--obstacle-front-m", type=float, default=0.45)
    p.add_argument("--obstacle-side-m", type=float, default=0.30)
    p.add_argument("--camera-topic", default="/oakd/rgb/preview/image_raw")
    return p.parse_args()


def main() -> None:
    args = parse_args()
    mission_path = Path(args.mission).expanduser().resolve()
    if not mission_path.exists():
        raise FileNotFoundError(f"Mission file not found: {mission_path}")

    rclpy.init()
    node = MissionSyncDriver(
        mission_file=mission_path,
        map_width_m=args.map_width_m,
        map_height_m=args.map_height_m,
        yolo_model=args.yolo_model,
        detection_conf=args.detection_conf,
        obstacle_front_m=args.obstacle_front_m,
        obstacle_side_m=args.obstacle_side_m,
        camera_topic=args.camera_topic,
    )

    # Fix #8: use a MultiThreadedExecutor so the image callback can run
    # concurrently with /scan, /odom, and the control timer.
    executor = MultiThreadedExecutor(num_threads=4)
    executor.add_node(node)

    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        try:
            node.cmd_pub.publish(Twist())
        except Exception:
            pass
        node.stop_worker()
        node._dump_detections()
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == "__main__":
    main()

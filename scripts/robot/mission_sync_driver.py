#!/usr/bin/env python3
"""
Mission Sync Driver for TurtleBot 4 — with obstacle avoidance & trash detection.

Reads the shared mission timeline JSON and drives the robot through keyframes
using /cmd_vel.  Layers on:
  1. LIDAR-based obstacle avoidance  (chairs, tables, walls, people)
  2. YOLOv8 camera-based trash detection  (bottles, cups, wrappers, cans …)

Requires:
    pip install ultralytics opencv-python-headless
    (plus the standard ros-humble-* turtlebot4 stack)
"""

import argparse
import json
import math
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np
import rclpy
from cv_bridge import CvBridge
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry
from rclpy.node import Node
from sensor_msgs.msg import Image, LaserScan
from ultralytics import YOLO

# ─── helpers ────────────────────────────────────────────────────────────────


def normalize_angle(angle: float) -> float:
    return math.atan2(math.sin(angle), math.cos(angle))


def yaw_from_quaternion(x: float, y: float, z: float, w: float) -> float:
    siny_cosp = 2.0 * (w * z + x * y)
    cosy_cosp = 1.0 - 2.0 * (y * y + z * z)
    return math.atan2(siny_cosp, cosy_cosp)


# COCO class IDs that count as "trash" — extend as needed
TRASH_CLASS_IDS: set = {
    39,  # bottle
    41,  # cup
    44,  # spoon
    45,  # bowl
    46,  # banana (peel)
    76,  # scissors  (debris)
}
# Human-readable labels for logging
TRASH_LABELS: Dict[int, str] = {
    39: "bottle",
    41: "cup",
    44: "spoon",
    45: "bowl",
    46: "banana",
    76: "scissors",
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
        self.max_linear = 0.24  # m/s  (TurtleBot 4 safe indoor speed)
        self.max_angular = 1.1  # rad/s
        self.goal_tolerance_m = 0.09
        self.heading_tolerance_rad = 0.18

        # ── obstacle avoidance ───────────────────────────────────────────
        self.obstacle_front_m = obstacle_front_m  # stop if anything closer
        self.obstacle_side_m = obstacle_side_m    # side clearance for steer
        self.front_arc_deg = 60.0                 # ±30° in front of heading
        self.side_arc_deg = 90.0                  # ±45° for side awareness
        self.obstacle_state = "clear"             # clear | steer_left | steer_right | blocked
        self.latest_scan: Optional[LaserScan] = None

        # ── trash detection ──────────────────────────────────────────────
        self.yolo = YOLO(yolo_model)
        self.detection_conf = detection_conf
        self.bridge = CvBridge()
        self.last_detect_time = 0.0
        self.detect_interval_sec = 1.0       # run YOLO at ~1 Hz (save CPU)
        self.pause_after_detect_sec = 2.0    # pause briefly when trash found
        self.pause_until: Optional[float] = None
        self.detections_log: List[Dict[str, Any]] = []

        # ── pose ─────────────────────────────────────────────────────────
        self.pose_x = 0.0
        self.pose_y = 0.0
        self.pose_yaw = 0.0
        self.have_odom = False
        self.started_at = self.get_clock().now()

        # ── ROS wiring ──────────────────────────────────────────────────
        self.cmd_pub = self.create_publisher(Twist, "/cmd_vel", 10)
        self.create_subscription(Odometry, "/odom", self._on_odom, 20)
        self.create_subscription(LaserScan, "/scan", self._on_scan, 10)
        self.create_subscription(Image, camera_topic, self._on_image, 5)
        self.timer = self.create_timer(0.1, self._tick)

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
        """Run YOLO inference at a throttled rate."""
        now = time.monotonic()
        if now - self.last_detect_time < self.detect_interval_sec:
            return
        self.last_detect_time = now

        try:
            frame = self.bridge.imgmsg_to_cv2(msg, desired_encoding="bgr8")
        except Exception as e:
            self.get_logger().warn(f"cv_bridge error: {e}")
            return

        results = self.yolo(frame, conf=self.detection_conf, verbose=False)
        if not results or results[0].boxes is None:
            return

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

            # pause so the dashboard can highlight the find
            self.pause_until = time.monotonic() + self.pause_after_detect_sec

    # ── obstacle avoidance ──────────────────────────────────────────────

    def _evaluate_obstacles(self) -> str:
        """
        Partition the LIDAR scan into a front arc and side arcs.
        Returns one of: 'clear', 'steer_left', 'steer_right', 'blocked'.
        """
        scan = self.latest_scan
        if scan is None:
            return "clear"

        ranges = np.array(scan.ranges, dtype=np.float32)
        n = len(ranges)
        if n == 0:
            return "clear"

        angles = np.linspace(scan.angle_min, scan.angle_max, n)

        # Replace inf / nan with a safe large value
        ranges = np.where(np.isfinite(ranges), ranges, 100.0)

        front_half = math.radians(self.front_arc_deg / 2.0)
        side_half = math.radians(self.side_arc_deg / 2.0)

        # front arc: angles near 0
        front_mask = np.abs(normalize_angle(angles)) < front_half
        # left arc: angles between front_half and side_half
        left_mask = (angles > front_half) & (angles < side_half)
        # right arc: angles between -side_half and -front_half
        right_mask = (angles < -front_half) & (angles > -side_half)

        front_min = float(np.min(ranges[front_mask])) if np.any(front_mask) else 100.0
        left_min = float(np.min(ranges[left_mask])) if np.any(left_mask) else 100.0
        right_min = float(np.min(ranges[right_mask])) if np.any(right_mask) else 100.0

        if front_min > self.obstacle_front_m:
            return "clear"

        # Something in front — decide which way to steer
        if left_min > self.obstacle_side_m and right_min > self.obstacle_side_m:
            # Both sides open — pick the more open side
            return "steer_left" if left_min >= right_min else "steer_right"
        if left_min > self.obstacle_side_m:
            return "steer_left"
        if right_min > self.obstacle_side_m:
            return "steer_right"

        # Hemmed in on all sides
        return "blocked"

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

        # If paused for a detection, just stop and wait
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

        # Mission complete?
        if elapsed >= self.duration_sec and dist < self.goal_tolerance_m:
            self.cmd_pub.publish(Twist())
            self._dump_detections()
            self.get_logger().info("Mission complete.")
            rclpy.shutdown()
            return

        # ── obstacle check ──────────────────────────────────────────
        self.obstacle_state = self._evaluate_obstacles()
        cmd = Twist()

        if self.obstacle_state == "blocked":
            # Full stop — wait for the path to clear
            self.cmd_pub.publish(Twist())
            self.get_logger().throttle(
                2000, self.get_logger().info, "Path blocked — waiting…"
            )
            return

        if self.obstacle_state.startswith("steer_"):
            # Rotate in place to dodge, then resume on next tick
            direction = 1.0 if self.obstacle_state == "steer_left" else -1.0
            cmd.angular.z = direction * 0.6 * self.max_angular
            self.cmd_pub.publish(cmd)
            return

        # ── normal waypoint tracking ────────────────────────────────
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
        """Write all trash detections to a JSON file at mission end."""
        if not self.detections_log:
            self.get_logger().info("No trash detected during mission.")
            return

        out_path = Path("detections.json")
        with out_path.open("w", encoding="utf-8") as f:
            json.dump(self.detections_log, f, indent=2)
        self.get_logger().info(
            f"Wrote {len(self.detections_log)} detection(s) → {out_path.resolve()}"
        )


# ─── CLI ────────────────────────────────────────────────────────────────────


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="TurtleBot 4 mission driver with obstacle avoidance & trash detection."
    )
    p.add_argument("--mission", default="demo-mission.json",
                    help="Path to mission JSON file.")
    p.add_argument("--map-width-m", type=float, default=4.2,
                    help="Physical floor width (m) for normalized x=1.0")
    p.add_argument("--map-height-m", type=float, default=3.0,
                    help="Physical floor height (m) for normalized y=1.0")
    p.add_argument("--yolo-model", default="yolov8n.pt",
                    help="YOLO model weights (yolov8n.pt is fast, yolov8s.pt more accurate)")
    p.add_argument("--detection-conf", type=float, default=0.45,
                    help="Minimum YOLO confidence for a trash detection")
    p.add_argument("--obstacle-front-m", type=float, default=0.45,
                    help="Stop if obstacle closer than this (meters)")
    p.add_argument("--obstacle-side-m", type=float, default=0.30,
                    help="Side clearance for steer decisions (meters)")
    p.add_argument("--camera-topic", default="/oakd/rgb/preview/image_raw",
                    help="ROS image topic from the depth camera")
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
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.cmd_pub.publish(Twist())
        node._dump_detections()
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == "__main__":
    main()

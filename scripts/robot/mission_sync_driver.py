#!/usr/bin/env python3
"""
Mission Sync Driver for TurtleBot 4.

Reads the shared mission timeline JSON and drives the robot through keyframes
using /cmd_vel so the physical robot appears in sync with the dashboard script mode.
"""

import argparse
import json
import math
from pathlib import Path
from typing import List, Dict, Any, Tuple

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry


def normalize_angle(angle: float) -> float:
    return math.atan2(math.sin(angle), math.cos(angle))


def yaw_from_quaternion(x: float, y: float, z: float, w: float) -> float:
    siny_cosp = 2.0 * (w * z + x * y)
    cosy_cosp = 1.0 - 2.0 * (y * y + z * z)
    return math.atan2(siny_cosp, cosy_cosp)


class MissionSyncDriver(Node):
    def __init__(self, mission_file: Path, map_width_m: float, map_height_m: float) -> None:
        super().__init__("mission_sync_driver")
        self.mission = self._load_mission(mission_file)
        self.keyframes = self.mission["keyframes"]
        self.duration_sec = float(self.mission["durationSec"])

        self.map_width_m = map_width_m
        self.map_height_m = map_height_m

        self.max_linear = 0.24
        self.max_angular = 1.1
        self.goal_tolerance_m = 0.09
        self.heading_tolerance_rad = 0.18

        self.pose_x = 0.0
        self.pose_y = 0.0
        self.pose_yaw = 0.0
        self.have_odom = False
        self.started_at = self.get_clock().now()

        self.cmd_pub = self.create_publisher(Twist, "/cmd_vel", 10)
        self.create_subscription(Odometry, "/odom", self._on_odom, 20)
        self.timer = self.create_timer(0.1, self._tick)

        self.get_logger().info(
            f"Mission '{self.mission['name']}' loaded ({self.duration_sec:.1f}s)."
        )

    def _load_mission(self, path: Path) -> Dict[str, Any]:
        with path.open("r", encoding="utf-8") as f:
            mission = json.load(f)
        if "keyframes" not in mission or len(mission["keyframes"]) < 2:
            raise ValueError("Mission must include at least 2 keyframes.")
        return mission

    def _on_odom(self, msg: Odometry) -> None:
        self.pose_x = msg.pose.pose.position.x
        self.pose_y = msg.pose.pose.position.y
        q = msg.pose.pose.orientation
        self.pose_yaw = yaw_from_quaternion(q.x, q.y, q.z, q.w)
        self.have_odom = True

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

        next_idx = next((i for i, kf in enumerate(self.keyframes) if float(kf["tSec"]) > elapsed_sec), 1)
        prev_kf = self.keyframes[next_idx - 1]
        next_kf = self.keyframes[next_idx]
        t0 = float(prev_kf["tSec"])
        t1 = float(next_kf["tSec"])
        ratio = 0.0 if t1 <= t0 else max(0.0, min(1.0, (elapsed_sec - t0) / (t1 - t0)))

        x0, y0 = self._to_meters(prev_kf)
        x1, y1 = self._to_meters(next_kf)
        return (x0 + (x1 - x0) * ratio, y0 + (y1 - y0) * ratio)

    def _tick(self) -> None:
        if not self.have_odom:
            return

        elapsed = self._mission_elapsed()
        target_x, target_y = self._target_for_time(elapsed)
        dx = target_x - self.pose_x
        dy = target_y - self.pose_y
        dist = math.hypot(dx, dy)

        cmd = Twist()
        desired_yaw = math.atan2(dy, dx)
        yaw_error = normalize_angle(desired_yaw - self.pose_yaw)

        if elapsed >= self.duration_sec and dist < self.goal_tolerance_m:
            self.cmd_pub.publish(Twist())
            self.get_logger().info("Mission complete.")
            rclpy.shutdown()
            return

        if abs(yaw_error) > self.heading_tolerance_rad:
            cmd.angular.z = max(-self.max_angular, min(self.max_angular, 1.9 * yaw_error))
        else:
            cmd.linear.x = max(0.0, min(self.max_linear, 0.8 * dist))
            cmd.angular.z = max(-self.max_angular, min(self.max_angular, 1.4 * yaw_error))

        self.cmd_pub.publish(cmd)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run shared mission sync script on TurtleBot.")
    parser.add_argument(
        "--mission",
        default="demo-mission.json",
        help="Path to mission JSON file.",
    )
    parser.add_argument(
        "--map-width-m",
        type=float,
        default=4.2,
        help="Physical floor width in meters corresponding to normalized x=1.0",
    )
    parser.add_argument(
        "--map-height-m",
        type=float,
        default=3.0,
        help="Physical floor height in meters corresponding to normalized y=1.0",
    )
    return parser.parse_args()


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
    )
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.cmd_pub.publish(Twist())
        node.destroy_node()
        if rclpy.ok():
            rclpy.shutdown()


if __name__ == "__main__":
    main()

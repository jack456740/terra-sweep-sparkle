#!/usr/bin/env python3
"""
TrashBot — modified FollowBot that drives toward detected trash objects
instead of following people.

Based on Clearpath Robotics' FollowBot example.
Uses the OAK-D onboard MobileNet-SSD (runs on the camera's neural accelerator,
not the Pi CPU) so no extra pip installs needed.

MobileNet-SSD VOC class IDs:
    0  background      5  bottle        10 cow           15 person
    1  aeroplane       6  bus           11 diningtable   16 pottedplant
    2  bicycle         7  car           12 dog           17 sheep
    3  bird            8  cat           13 horse         18 sofa
    4  boat            9  chair         14 motorbike     19 train
                                                         20 tvmonitor
"""

import math
import threading
import time
from enum import Enum
from typing import List, Tuple

import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data, qos_profile_system_default

from depthai_ros_msgs.msg import SpatialDetectionArray
from turtlebot4_msgs.msg import UserLed
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry

from irobot_create_msgs.action import Undock
from irobot_create_msgs.msg import Dock


# ─── target classes ─────────────────────────────────────────────────────────
# MobileNet-SSD VOC class IDs to treat as trash.
# Bottle is the main one.  Add '9' (chair) etc. if you want to test on
# bigger objects, but remove it before a real run or the robot will
# charge at your furniture.
TARGET_CLASS_IDS = {'5'}   # {'5', '16'} to add potted-plant, etc.

TARGET_LABELS = {
    '5': 'bottle',
}


class State(Enum):
    SEARCHING = 0
    APPROACHING = 1
    ARRIVED = 2


class Direction(Enum):
    FORWARD = 0
    FORWARD_LEFT = 1
    FORWARD_RIGHT = 2
    LEFT = 3
    RIGHT = 4
    UNKNOWN = 5


def yaw_from_quaternion(x, y, z, w):
    siny_cosp = 2.0 * (w * z + x * y)
    cosy_cosp = 1.0 - 2.0 * (y * y + z * z)
    return math.atan2(siny_cosp, cosy_cosp)


class TrashBot(Node):
    image_width = 300
    image_height = 300
    fps = 15
    confidence = 0.55          # lower than person-following (trash is harder)

    is_docked = False

    target = None
    target_direction = Direction.UNKNOWN
    target_distance = 0.0
    last_target_direction = Direction.UNKNOWN
    state = State.SEARCHING

    forward_margin_px = 25
    forward_turn_margin_px = 80

    # ── distance thresholds (meters) ────────────────────────────────────
    arrive_thresh = 0.45       # close enough — "found it"
    approach_thresh = 0.60     # start approaching when farther than this
    thresh_hysteresis = 0.05

    def __init__(self):
        super().__init__('trashbot')

        # ── subs / pubs ─────────────────────────────────────────────────
        self.create_subscription(
            SpatialDetectionArray,
            '/color/mobilenet_spatial_detections',
            self._on_detection,
            qos_profile_sensor_data,
        )
        self.create_subscription(Dock, '/dock', self._on_dock, qos_profile_sensor_data)
        self.create_subscription(Odometry, '/odom', self._on_odom, 20)

        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', qos_profile_system_default)
        self.user_led_pub = self.create_publisher(UserLed, '/hmi/led', qos_profile_sensor_data)
        self.undock_action_client = ActionClient(self, Undock, '/undock')

        # ── pose (for logging where trash was found) ────────────────────
        self.pose_x = 0.0
        self.pose_y = 0.0
        self.pose_yaw = 0.0

        # ── dedup ───────────────────────────────────────────────────────
        self.known_trash: List[Tuple[float, float, str]] = []
        self.dedup_radius_m = 0.5
        self.found_log: list = []

        self.get_logger().info(
            f"TrashBot ready — targeting classes {TARGET_CLASS_IDS}"
        )

    # ── callbacks ───────────────────────────────────────────────────────

    def _on_dock(self, msg: Dock):
        self.is_docked = msg.is_docked

    def _on_odom(self, msg: Odometry):
        self.pose_x = msg.pose.pose.position.x
        self.pose_y = msg.pose.pose.position.y
        q = msg.pose.pose.orientation
        self.pose_yaw = yaw_from_quaternion(q.x, q.y, q.z, q.w)

    def _on_detection(self, msg: SpatialDetectionArray):
        """Pick the closest trash object from the spatial detections."""
        closest_dist = float('inf')
        target = None
        target_cls = None

        for detection in msg.detections:
            cls_id = detection.results[0].class_id
            score = detection.results[0].score
            if cls_id not in TARGET_CLASS_IDS or score < self.confidence:
                continue

            dist = detection.position.z
            if dist < closest_dist:
                closest_dist = dist
                target = detection
                target_cls = cls_id

        if target is not None:
            self.target_distance = target.position.z
        self.target = target
        self._set_target_direction()

    # ── direction logic (same idea as FollowBot) ────────────────────────

    def _set_target_direction(self):
        if self.target is None:
            self.target_direction = Direction.UNKNOWN
            return

        if self.target_direction is not Direction.UNKNOWN:
            self.last_target_direction = self.target_direction

        center_dist = self.target.bbox.center.x - self.image_width / 2

        if abs(center_dist) < self.forward_margin_px:
            self.target_direction = Direction.FORWARD
        elif abs(center_dist) < self.forward_turn_margin_px:
            self.target_direction = (
                Direction.FORWARD_RIGHT if center_dist >= 0 else Direction.FORWARD_LEFT
            )
        else:
            self.target_direction = (
                Direction.RIGHT if center_dist >= 0 else Direction.LEFT
            )

    # ── LED helpers ─────────────────────────────────────────────────────

    def _set_led(self, led, color, period, duty):
        msg = UserLed()
        msg.led = led
        msg.color = color
        msg.blink_period = period
        msg.duty_cycle = duty
        self.user_led_pub.publish(msg)

    def _drive(self, linear_x, angular_z):
        msg = Twist()
        msg.linear.x = linear_x
        msg.angular.z = angular_z
        self.cmd_vel_pub.publish(msg)

    def undock(self):
        self.undock_action_client.wait_for_server()
        result = self.undock_action_client.send_goal(Undock.Goal())
        if result.result.is_docked:
            print('Undocking failed')

    # ── dedup ───────────────────────────────────────────────────────────

    def _is_known(self, label: str) -> bool:
        for kx, ky, klabel in self.known_trash:
            if klabel == label and math.hypot(self.pose_x - kx, self.pose_y - ky) < self.dedup_radius_m:
                return True
        return False

    def _log_trash(self, label: str):
        self.known_trash.append((self.pose_x, self.pose_y, label))
        entry = {
            'label': label,
            'robot_x': round(self.pose_x, 3),
            'robot_y': round(self.pose_y, 3),
            'distance_m': round(self.target_distance, 3),
        }
        self.found_log.append(entry)
        self.get_logger().info(
            f"TRASH FOUND: {label} @ ({self.pose_x:.2f}, {self.pose_y:.2f}), "
            f"depth {self.target_distance:.2f}m"
        )

    # ── state machine ───────────────────────────────────────────────────

    def state_machine(self):

        # ── SEARCHING ───────────────────────────────────────────────
        if self.state == State.SEARCHING:
            if self.target_direction == Direction.UNKNOWN:
                # Spin slowly looking for trash
                if self.last_target_direction in (
                    Direction.UNKNOWN, Direction.RIGHT,
                    Direction.FORWARD_RIGHT, Direction.FORWARD,
                ):
                    self._drive(0.0, -0.5)
                    self._set_led(0, 1, 500, 0.5)
                    self._set_led(1, 0, 500, 0.5)
                else:
                    self._drive(0.0, 0.5)
                    self._set_led(0, 0, 500, 0.5)
                    self._set_led(1, 1, 500, 0.5)
            else:
                if self.target_distance < self.arrive_thresh:
                    self.state = State.ARRIVED
                else:
                    self.state = State.APPROACHING

        # ── APPROACHING ─────────────────────────────────────────────
        elif self.state == State.APPROACHING:
            if self.target_direction == Direction.UNKNOWN:
                self.state = State.SEARCHING
            elif self.target_distance < self.arrive_thresh - self.thresh_hysteresis:
                self.state = State.ARRIVED
            else:
                # Drive toward the object
                if self.target_direction == Direction.FORWARD:
                    self._drive(0.2, 0.0)
                    self._set_led(0, 1, 1000, 1.0)
                    self._set_led(1, 1, 1000, 1.0)
                elif self.target_direction == Direction.FORWARD_LEFT:
                    self._drive(0.15, 0.2)
                    self._set_led(0, 1, 1000, 1.0)
                    self._set_led(1, 1, 1000, 0.5)
                elif self.target_direction == Direction.FORWARD_RIGHT:
                    self._drive(0.15, -0.2)
                    self._set_led(0, 1, 1000, 0.5)
                    self._set_led(1, 1, 1000, 1.0)
                elif self.target_direction == Direction.LEFT:
                    self._drive(0.0, 0.3)
                    self._set_led(0, 0, 1000, 0.5)
                    self._set_led(1, 1, 1000, 0.5)
                else:  # RIGHT
                    self._drive(0.0, -0.3)
                    self._set_led(0, 1, 1000, 0.5)
                    self._set_led(1, 0, 1000, 0.5)

        # ── ARRIVED ─────────────────────────────────────────────────
        elif self.state == State.ARRIVED:
            self._drive(0.0, 0.0)

            # Figure out which class we reached
            if self.target is not None:
                cls_id = self.target.results[0].class_id
                label = TARGET_LABELS.get(cls_id, f'class_{cls_id}')

                if not self._is_known(label):
                    self._log_trash(label)
                    # Flash green to signal found
                    self._set_led(0, 2, 250, 1.0)
                    self._set_led(1, 2, 250, 1.0)
                    # Pause so dashboard / human can see
                    time.sleep(3.0)

            # Done with this one — go look for more
            self.target = None
            self.target_direction = Direction.UNKNOWN
            self.state = State.SEARCHING

    # ── main loop ───────────────────────────────────────────────────────

    def run(self):
        if self.is_docked:
            print('Undocking')
            self.undock()

        while True:
            self.state_machine()
            state_label = f'{self.state}'
            if self.target is not None:
                state_label += f'  d={self.target_distance:.2f}m'
            print(f'{state_label: <40}', end='\r')
            time.sleep(1 / self.fps)


def main(args=None):
    rclpy.init(args=args)
    node = TrashBot()

    thread = threading.Thread(target=rclpy.spin, args=(node,), daemon=True)
    thread.start()

    time.sleep(5)
    print('Running TrashBot...\n')

    try:
        node.run()
    except KeyboardInterrupt:
        pass

    if node.found_log:
        import json
        from pathlib import Path
        out = Path('trash_found.json')
        with out.open('w') as f:
            json.dump(node.found_log, f, indent=2)
        print(f'\nWrote {len(node.found_log)} find(s) → {out.resolve()}')

    node.destroy_node()
    rclpy.shutdown()
    thread.join()


if __name__ == '__main__':
    main()

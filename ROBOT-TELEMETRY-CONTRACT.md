# Robot Telemetry Contract (ROS 2 Bridge -> Dashboard)

Use this payload format over WebSocket at `/robot/updates`.

## Message Envelope

```json
{
  "type": "telemetry_update",
  "timestamp": "2026-04-14T19:12:00.000Z",
  "payload": {
    "robotStatus": "cleaning",
    "deployState": "deployed",
    "batteryLevel": 76,
    "currentLocation": "Main Area",
    "cleaningProgress": 44,
    "telemetrySource": "live",
    "pose": {
      "x": 0.42,
      "y": 0.31,
      "headingDeg": 93
    }
  }
}
```

## Field Notes

- `pose.x` and `pose.y` are normalized floor coordinates in range `[0..1]`.
- `(0,0)` is top-left and `(1,1)` is bottom-right of the dashboard main floor area.
- `telemetrySource` should be `"live"` when values come from the robot/ROS.
- `cleaningProgress` should be `0..100` and represent mission completion percentage.

## ROS 2 Bridge Mapping (Recommended)

- `/odom` -> `pose` (`x`, `y`, `headingDeg`)
- battery topic -> `batteryLevel`
- state machine/nav state -> `robotStatus`, `deployState`, `currentLocation`
- waypoint index / route completion -> `cleaningProgress`

If WebSocket is unavailable, the dashboard automatically falls back to simulation mode.

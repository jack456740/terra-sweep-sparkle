# Script Sync Demo (No Direct Robot Telemetry)

This mode keeps robot + dashboard visually aligned by running the same mission timeline on both sides.

## 1) Dashboard (Windows)

- Mission file: `public/missions/demo-mission.json`
- Run app: `npm run dev`
- Open `http://localhost:8080`
- Click **Start Script Sync Demo**

## 2) TurtleBot (Linux / ROS 2)

Copy these files to the robot:

- `scripts/robot/mission_sync_driver.py`
- `scripts/robot/demo-mission.json`

Run:

```bash
source /opt/ros/humble/setup.bash
python3 mission_sync_driver.py --mission demo-mission.json --map-width-m 4.2 --map-height-m 3.0
```

## Notes

- Keep mission JSON identical on both robot and dashboard.
- Tune `--map-width-m` and `--map-height-m` to match the real area.
- This is choreography sync (no live feedback), so small drift over time is expected.

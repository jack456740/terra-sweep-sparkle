import { useMemo } from "react";
import { ROBOT_STATUS, type RobotStatus } from "@/lib/constants";

interface Params {
  robotStatus: RobotStatus;
  cleaningProgress: number;
  maxProgress: number;
}

export function useDashboardRobotViewState({
  robotStatus,
  cleaningProgress,
  maxProgress,
}: Params) {
  return useMemo(
    () => ({
      cleaningProgress: Math.min(cleaningProgress, maxProgress),
      isCharging: robotStatus === ROBOT_STATUS.CHARGING,
      isCleaning: robotStatus === ROBOT_STATUS.CLEANING,
      isControlDisabled:
        robotStatus === ROBOT_STATUS.RETURNING || robotStatus === ROBOT_STATUS.CHARGING,
    }),
    [cleaningProgress, maxProgress, robotStatus],
  );
}

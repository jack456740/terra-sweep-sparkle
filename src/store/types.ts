import type { RobotStatus, DeployState } from "@/lib/constants";

export interface RobotState {
  robotStatus: RobotStatus;
  deployState: DeployState;
  batteryLevel: number;
  currentLocation: string;
  cleaningProgress: number;
}

export interface RobotActions {
  deployRobot: () => void;
  stopRobot: () => void;
  updateStatus: (patch: Partial<RobotState>) => void;
}

export type RobotStore = RobotState & RobotActions;
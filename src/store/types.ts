import type { RobotStatus, DeployState } from "@/lib/constants";

export type TelemetrySource = "simulation" | "live" | "script";

export interface RobotPose {
  /**
   * X and Y are normalized floor coordinates in range [0..1].
   * (0,0) is top-left of the main floor area and (1,1) is bottom-right.
   */
  x: number;
  y: number;
  headingDeg?: number;
}

export interface RobotState {
  robotStatus: RobotStatus;
  deployState: DeployState;
  batteryLevel: number;
  currentLocation: string;
  cleaningProgress: number;
  telemetrySource: TelemetrySource;
  pose: RobotPose | null;
  lastTelemetryAt: string | null;
}

export interface RobotActions {
  deployRobot: () => void;
  stopRobot: () => void;
  updateStatus: (patch: Partial<RobotState>) => void;
  setTelemetrySource: (source: TelemetrySource) => void;
}

export type RobotStore = RobotState & RobotActions;
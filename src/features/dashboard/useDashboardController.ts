import { useCallback } from "react";
import { useRobotSimulation } from "@/hooks/useRobotSimulation";
import { useRobotTelemetry } from "@/hooks/useRobotTelemetry";
import { useMissionScriptSync } from "@/hooks/useMissionScriptSync";
import { getConfig } from "@/lib/config";
import { useRobotStore } from "@/store/robotStore";
import { useDashboardTaskManagement } from "@/features/dashboard/useDashboardTaskManagement";
import { useDashboardRobotViewState } from "@/features/dashboard/hooks/useDashboardRobotViewState";
import type { DeployState, RobotStatus } from "@/lib/constants";
import type { RobotPose, TelemetrySource } from "@/store/types";

interface DashboardController {
  deployState: DeployState;
  robotStatus: RobotStatus;
  batteryLevel: number;
  currentLocation: string;
  cleaningProgress: number;
  telemetrySource: TelemetrySource;
  pose: RobotPose | null;
  isCharging: boolean;
  isCleaning: boolean;
  isControlDisabled: boolean;
  handleDeploy: () => Promise<void>;
  handleStop: () => Promise<void>;
}

const config = getConfig();

export function useDashboardController(): DashboardController {
  const {
    deployState,
    robotStatus,
    batteryLevel,
    currentLocation,
    cleaningProgress,
    telemetrySource,
    pose,
    updateStatus,
  } = useRobotStore();

  useRobotTelemetry();
  useRobotSimulation();

  const { handleDeploy, handleStop } = useDashboardTaskManagement({
    updateStatus,
  });
  const {
    isMissionRunning,
    startScriptMission,
    stopScriptMission,
  } = useMissionScriptSync();

  const handleDeployWithMode = useCallback(async () => {
    if (telemetrySource === "live") {
      await handleDeploy();
      return;
    }

    await startScriptMission();
  }, [handleDeploy, startScriptMission, telemetrySource]);

  const handleStopWithMode = useCallback(async () => {
    if (isMissionRunning) {
      stopScriptMission();
      return;
    }

    await handleStop();
  }, [handleStop, isMissionRunning, stopScriptMission]);

  const dashboardViewState = useDashboardRobotViewState({
    robotStatus,
    cleaningProgress,
    maxProgress: config.cleaning.maxProgress,
  });

  return {
    deployState,
    robotStatus,
    batteryLevel,
    currentLocation,
    telemetrySource,
    pose,
    ...dashboardViewState,
    handleDeploy: handleDeployWithMode,
    handleStop: handleStopWithMode,
  };
}

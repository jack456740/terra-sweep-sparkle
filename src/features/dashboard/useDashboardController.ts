import { useRobotSimulation } from "@/hooks/useRobotSimulation";
import { getConfig } from "@/lib/config";
import { useRobotStore } from "@/store/robotStore";
import { useDashboardTaskManagement } from "@/features/dashboard/useDashboardTaskManagement";
import { useDashboardRobotViewState } from "@/features/dashboard/hooks/useDashboardRobotViewState";
import type { DeployState, RobotStatus } from "@/lib/constants";

interface DashboardController {
  deployState: DeployState;
  robotStatus: RobotStatus;
  batteryLevel: number;
  currentLocation: string;
  cleaningProgress: number;
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
    updateStatus,
  } = useRobotStore();

  useRobotSimulation();

  const { handleDeploy, handleStop } = useDashboardTaskManagement({
    updateStatus,
  });

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
    ...dashboardViewState,
    handleDeploy,
    handleStop,
  };
}

import { useRobotSimulation } from "@/hooks/useRobotSimulation";
import { getConfig } from "@/lib/config";
import { useRobotStore } from "@/store/robotStore";
import { useDashboardTaskManagement } from "@/features/dashboard/useDashboardTaskManagement";
import { useDashboardRobotViewState } from "@/features/dashboard/hooks/useDashboardRobotViewState";

const config = getConfig();

export function useDashboardController() {
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

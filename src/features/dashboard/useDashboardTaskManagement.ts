import { useCallback } from "react";
import { getConfig } from "@/lib/config";
import { TaskService } from "@/features/dashboard/services/taskService";

const config = getConfig();

interface UseDashboardTaskManagementParams {
  deployRobot: () => void;
  stopRobot: () => void;
}

export function useDashboardTaskManagement({
  deployRobot,
  stopRobot,
}: UseDashboardTaskManagementParams) {
  const handleDeploy = useCallback(() => {
    TaskService.startDeployTask(deployRobot, config.timing.deployTimeoutMs);
  }, [deployRobot]);

  const handleStop = useCallback(() => {
    TaskService.startStopTask(stopRobot, config.timing.returnTimeoutMs);
  }, [stopRobot]);

  return {
    handleDeploy,
    handleStop,
  };
}

import { useCallback } from "react";
import { toast } from "sonner";
import { DEPLOY_STATE, LOCATIONS, ROBOT_STATUS } from "@/lib/constants";
import { robotService } from "@/services/robotService";
import type { RobotState } from "@/store/types";

interface UseDashboardTaskManagementParams {
  updateStatus: (patch: Partial<RobotState>) => void;
}

export function useDashboardTaskManagement({
  updateStatus,
}: UseDashboardTaskManagementParams) {
  const handleDeploy = useCallback(async () => {
    toast.info("Initializing robot systems...");
    updateStatus({
      deployState: DEPLOY_STATE.DEPLOYING,
      cleaningProgress: 0,
    });

    try {
      await robotService.deployRobot();
      const status = await robotService.getRobotStatus();
      updateStatus(status);
      toast.success("Robot deployed successfully!");
    } catch {
      updateStatus({
        deployState: DEPLOY_STATE.IDLE,
        robotStatus: ROBOT_STATUS.IDLE,
        currentLocation: LOCATIONS.HOME_BASE,
      });
      toast.error("Unable to deploy robot. Please try again.");
    }
  }, [updateStatus]);

  const handleStop = useCallback(async () => {
    toast.info("Robot returning to base...");
    updateStatus({
      robotStatus: ROBOT_STATUS.RETURNING,
      currentLocation: LOCATIONS.RETURNING,
    });

    try {
      await robotService.stopRobot();
      const status = await robotService.getRobotStatus();
      updateStatus(status);
      toast.success("Robot returned to base");
    } catch {
      toast.error("Unable to stop robot right now. Please try again.");
    }
  }, [updateStatus]);

  return {
    handleDeploy,
    handleStop,
  };
}

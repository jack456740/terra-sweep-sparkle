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
        deployState: DEPLOY_STATE.DEPLOYED,
        robotStatus: ROBOT_STATUS.CLEANING,
        currentLocation: LOCATIONS.ZONE_A_NORTH,
      });
      toast.warning("Backend unavailable. Running local simulation mode.");
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
      updateStatus({
        deployState: DEPLOY_STATE.IDLE,
        robotStatus: ROBOT_STATUS.IDLE,
        currentLocation: LOCATIONS.HOME_BASE,
      });
      toast.warning("Backend unavailable. Robot returned in local simulation mode.");
    }
  }, [updateStatus]);

  return {
    handleDeploy,
    handleStop,
  };
}

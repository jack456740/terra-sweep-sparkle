import { LOCATIONS, ROBOT_STATUS } from "@/lib/constants";
import { getConfig } from "@/lib/config";

const config = getConfig();

interface SimulationStepInput {
  batteryLevel: number;
  cleaningProgress: number;
}

type SimulationEvent = "low_battery" | "cleaning_complete" | "progress_updated";

interface SimulationStepResult {
  event: SimulationEvent;
  patch: {
    batteryLevel?: number;
    cleaningProgress?: number;
    robotStatus?: (typeof ROBOT_STATUS)[keyof typeof ROBOT_STATUS];
    currentLocation?: (typeof LOCATIONS)[keyof typeof LOCATIONS];
  };
}

export function getRobotSimulationStep({
  batteryLevel,
  cleaningProgress,
}: SimulationStepInput): SimulationStepResult {
  const currentBattery = Math.max(
    config.battery.minPercentage,
    Math.min(config.battery.maxPercentage, batteryLevel),
  );

  if (currentBattery <= config.battery.lowThreshold) {
    return {
      event: "low_battery",
      patch: {
        robotStatus: ROBOT_STATUS.RETURNING,
        currentLocation: LOCATIONS.RETURNING_LOW_BATTERY,
      },
    };
  }

  const currentProgress = Math.max(
    config.cleaning.initialProgress,
    Math.min(config.cleaning.maxProgress, cleaningProgress),
  );

  if (currentProgress >= config.cleaning.maxProgress) {
    return {
      event: "cleaning_complete",
      patch: {
        robotStatus: ROBOT_STATUS.RETURNING,
        currentLocation: LOCATIONS.RETURNING,
      },
    };
  }

  return {
    event: "progress_updated",
    patch: {
      batteryLevel: Math.max(
        config.battery.minPercentage,
        currentBattery - config.battery.decrementPerInterval,
      ),
      cleaningProgress: Math.min(
        config.cleaning.maxProgress,
        currentProgress + config.cleaning.progressIncrement,
      ),
    },
  };
}

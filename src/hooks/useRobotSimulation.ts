import { useEffect } from 'react';
import { useRobotStore } from '../store/robotStore';
import { ROBOT_STATUS, LOCATIONS } from '@/lib/constants';
import { getConfig } from '@/lib/config';
import { toast } from 'sonner';

const config = getConfig();

export function useRobotSimulation() {
  const { robotStatus, batteryLevel, currentLocation, cleaningProgress, updateStatus } = useRobotStore();

  useEffect(() => {
    if (robotStatus !== ROBOT_STATUS.CLEANING) return;

    const interval = setInterval(() => {
      const currentBattery = Math.max(config.battery.minPercentage, Math.min(config.battery.maxPercentage, batteryLevel));

      if (currentBattery <= config.battery.lowThreshold) {
        updateStatus({ robotStatus: ROBOT_STATUS.RETURNING, currentLocation: LOCATIONS.RETURNING_LOW_BATTERY });
        toast.warning('Low battery! Returning to base for recharge...');
        return;
      }

      const currentProgress = Math.max(config.cleaning.initialProgress, Math.min(config.cleaning.maxProgress, cleaningProgress));

      if (currentProgress >= config.cleaning.maxProgress) {
        updateStatus({ robotStatus: ROBOT_STATUS.RETURNING, currentLocation: LOCATIONS.RETURNING });
        toast.success('Cleaning complete! Returning to base...');
        return;
      }

      updateStatus({
        batteryLevel: Math.max(config.battery.minPercentage, currentBattery - config.battery.decrementPerInterval),
        cleaningProgress: Math.min(config.cleaning.maxProgress, currentProgress + config.cleaning.progressIncrement)
      });
    }, config.timing.cleaningIntervalMs);

    return () => clearInterval(interval);
  }, [robotStatus, batteryLevel, cleaningProgress]);  
}

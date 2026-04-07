import { useEffect } from 'react';
import { useRobotStore } from '../store/robotStore';
import { ROBOT_STATUS } from '@/lib/constants';
import { getConfig } from '@/lib/config';
import { toast } from 'sonner';
import { getRobotSimulationStep } from '@/features/robot/robotSimulationStep';

const config = getConfig();

export function useRobotSimulation() {
  const { robotStatus, batteryLevel, currentLocation, cleaningProgress, updateStatus } = useRobotStore();

  useEffect(() => {
    if (robotStatus !== ROBOT_STATUS.CLEANING) return;

    const interval = setInterval(() => {
      const nextStep = getRobotSimulationStep({ batteryLevel, cleaningProgress });
      updateStatus(nextStep.patch);

      if (nextStep.event === 'low_battery') {
        toast.warning('Low battery! Returning to base for recharge...');
        return;
      }

      if (nextStep.event === 'cleaning_complete') {
        toast.success('Cleaning complete! Returning to base...');
      }
    }, config.timing.cleaningIntervalMs);

    return () => clearInterval(interval);
  }, [robotStatus, batteryLevel, cleaningProgress]);  
}

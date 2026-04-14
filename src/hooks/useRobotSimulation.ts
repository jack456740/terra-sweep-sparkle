import { useEffect, useRef } from "react";
import { useRobotStore } from '../store/robotStore';
import { ROBOT_STATUS } from '@/lib/constants';
import { getConfig } from '@/lib/config';
import { toast } from 'sonner';
import { getRobotSimulationStep } from '@/features/robot/robotSimulationStep';

const config = getConfig();

export function useRobotSimulation(): void {
  const { robotStatus, batteryLevel, cleaningProgress, telemetrySource, updateStatus } = useRobotStore();
  const batteryLevelRef = useRef<number>(batteryLevel);
  const cleaningProgressRef = useRef<number>(cleaningProgress);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    batteryLevelRef.current = batteryLevel;
  }, [batteryLevel]);

  useEffect(() => {
    cleaningProgressRef.current = cleaningProgress;
  }, [cleaningProgress]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (telemetrySource === "live") return;
    if (robotStatus !== ROBOT_STATUS.CLEANING) return;

    const interval = setInterval(() => {
      if (!isMountedRef.current) return;

      const nextStep = getRobotSimulationStep({
        batteryLevel: batteryLevelRef.current,
        cleaningProgress: cleaningProgressRef.current,
      });
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
  }, [robotStatus, telemetrySource, updateStatus]);
}

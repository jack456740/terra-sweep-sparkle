import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROBOT_STATUS, DEPLOY_STATE, LOCATIONS } from '@/lib/constants';
import { getConfig } from '@/lib/config';
import type { RobotStore } from './types';

const config = getConfig();

export const useRobotStore = create<RobotStore>()(
  persist(
    (set) => ({
      deployState: DEPLOY_STATE.IDLE,
      robotStatus: ROBOT_STATUS.IDLE,
      batteryLevel: config.battery.initialPercentage,
      currentLocation: LOCATIONS.HOME_BASE,
      cleaningProgress: config.cleaning.initialProgress,
      telemetrySource: "simulation",
      pose: null,
      lastTelemetryAt: null,

      deployRobot: () => {
        set({ deployState: DEPLOY_STATE.DEPLOYING, cleaningProgress: config.cleaning.initialProgress });
        setTimeout(() => {
          set({ deployState: DEPLOY_STATE.DEPLOYED, robotStatus: ROBOT_STATUS.CLEANING, currentLocation: LOCATIONS.MAIN_AREA });
        }, config.timing.deployTimeoutMs);
      },

      stopRobot: () => {
        set({ robotStatus: ROBOT_STATUS.RETURNING, currentLocation: LOCATIONS.RETURNING });
        setTimeout(() => {
          set({ deployState: DEPLOY_STATE.IDLE, robotStatus: ROBOT_STATUS.IDLE, currentLocation: LOCATIONS.HOME_BASE });
        }, config.timing.returnTimeoutMs);
      },

      updateStatus: (patch) => set(patch),
      setTelemetrySource: (source) => set({ telemetrySource: source }),
    }),
    {
      name: 'robot-store',
      onRehydrateStorage: () => (state) => {
        if (
          state &&
          (state.deployState === DEPLOY_STATE.DEPLOYING ||
            state.robotStatus === ROBOT_STATUS.RETURNING)
        ) {
          state.deployState = DEPLOY_STATE.IDLE;
          state.robotStatus = ROBOT_STATUS.IDLE;
          state.currentLocation = LOCATIONS.HOME_BASE;
        }
      },
    }
  )
);
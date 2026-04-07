import { create } from 'zustand';
import { ROBOT_STATUS, DEPLOY_STATE, LOCATIONS } from '@/lib/constants';
import { getConfig } from '@/lib/config';
import type { RobotStore } from './types';

const config = getConfig();

export const useRobotStore = create<RobotStore>((set) => ({
  deployState: DEPLOY_STATE.IDLE,
  robotStatus: ROBOT_STATUS.IDLE,
  batteryLevel: config.battery.initialPercentage,
  currentLocation: LOCATIONS.HOME_BASE,
  cleaningProgress: config.cleaning.initialProgress,

  deployRobot: () => {
    set({ deployState: DEPLOY_STATE.DEPLOYING, cleaningProgress: config.cleaning.initialProgress });
    setTimeout(() => {
      set({ deployState: DEPLOY_STATE.DEPLOYED, robotStatus: ROBOT_STATUS.CLEANING, currentLocation: LOCATIONS.ZONE_A_NORTH });
    }, config.timing.deployTimeoutMs);
  },
  
  stopRobot: () => {
    set({ robotStatus: ROBOT_STATUS.RETURNING, currentLocation: LOCATIONS.RETURNING });
    setTimeout(() => {
      set({ deployState: DEPLOY_STATE.IDLE, robotStatus: ROBOT_STATUS.IDLE, currentLocation: LOCATIONS.HOME_BASE });
    }, config.timing.returnTimeoutMs);
  },

  updateStatus: (patch) => set(patch),
}));
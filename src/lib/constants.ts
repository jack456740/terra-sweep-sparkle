/**
 * Robot Status Constants
 * 
 * Defines all possible states for the autonomous cleaning robot.
 * These values are used throughout the application to track robot operational status.
 * 
 * @see AC 1.4 - Auto-return on low power
 * @see AC 2.3 - Real-time location and activity updates
 * @see SR-UI-01 - Status notifications
 * @see SR-UI-02 - Real-time operational data
 */
export const ROBOT_STATUS = {
  IDLE: "idle",
  CLEANING: "cleaning",
  RETURNING: "returning",
  CHARGING: "charging",
  OFFLINE: "offline",
} as const;

/**
 * Deploy State Constants
 * 
 * Defines the states for robot deployment operations.
 * Used to track the deployment lifecycle from idle to deployed.
 */
export const DEPLOY_STATE = {
  IDLE: "idle",
  DEPLOYING: "deploying",
  DEPLOYED: "deployed",
} as const;

/**
 * Location Constants
 * 
 * Standard location strings used throughout the application.
 * These represent physical locations where the robot operates.
 * 
 * @see AC 2.2 - Geo-fencing boundaries
 * @see AC 2.3 - Real-time location updates
 */
export const LOCATIONS = {
  HOME_BASE: "Home Base",
  ZONE_A_NORTH: "Zone A - North Side",
  RETURNING: "Returning...",
  RETURNING_LOW_BATTERY: "Returning (Low Battery)",
} as const;

/**
 * Robot Status Type
 * 
 * Type-safe union type for robot status values.
 * Ensures only valid status values can be used.
 */
export type RobotStatus = typeof ROBOT_STATUS[keyof typeof ROBOT_STATUS];

/**
 * Deploy State Type
 * 
 * Type-safe union type for deploy state values.
 * Ensures only valid deploy states can be used.
 */
export type DeployState = typeof DEPLOY_STATE[keyof typeof DEPLOY_STATE];

/**
 * Location Type
 * 
 * Type-safe union type for location values.
 * Note: This is a union of known locations, but the robot may report
 * other locations dynamically. Consider making this more flexible if needed.
 */
export type Location = typeof LOCATIONS[keyof typeof LOCATIONS] | string;

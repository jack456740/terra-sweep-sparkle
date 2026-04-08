/**
 * Robot Configuration Constants
 * 
 * Centralized configuration values for robot behavior and thresholds.
 * These values can be overridden via environment variables for different environments.
 * 
 * @see SR-PWR-01 - Auto-return to dock on low power (AC 1.4)
 * @see DC-HW-01 - Battery Management System specifications
 */

/**
 * Battery Configuration
 * 
 * Battery-related thresholds and values.
 * These values should match the actual robot hardware specifications.
 */
export const BATTERY_CONFIG = {
  /** Initial battery percentage when robot starts */
  INITIAL_PERCENTAGE: 78,
  
  /** 
   * Low battery threshold percentage.
   * When battery reaches this level, robot automatically returns to base.
   * 
   * @see SR-PWR-01 - Auto-return on low power
   * @see AC 1.4 - Automatic return when battery is low
   * @see DC-HW-01 - Battery Management System
   */
  LOW_THRESHOLD: 20,
  
  /** Battery percentage decrement per cleaning interval (simulated) */
  DECREMENT_PER_INTERVAL: 1,
  
  /** Maximum battery percentage (100%) */
  MAX_PERCENTAGE: 100,
  
  /** Minimum battery percentage (0%) */
  MIN_PERCENTAGE: 0,
} as const;

/**
 * Cleaning Progress Configuration
 * 
 * Configuration for cleaning progress tracking and simulation.
 */
export const CLEANING_CONFIG = {
  /** Initial cleaning progress (0%) */
  INITIAL_PROGRESS: 0,
  
  /** Maximum cleaning progress (100%) */
  MAX_PROGRESS: 100,
  
  /** Progress increment per cleaning interval (simulated) */
  PROGRESS_INCREMENT: 3,
} as const;

/**
 * Timing Configuration
 * 
 * Timeout and interval values for robot operations.
 * These values are currently simulated and should be replaced with actual
 * robot hardware timing specifications when available.
 * 
 * All values are in milliseconds.
 */
export const TIMING_CONFIG = {
  /** 
   * Deployment timeout in milliseconds.
   * Time to wait before considering deployment complete.
   * 
   * Note: This is a simulated value. Should be replaced with actual
   * robot deployment time when hardware integration is complete.
   */
  DEPLOY_TIMEOUT_MS: 2000,
  
  /** 
   * Return timeout in milliseconds.
   * Time to wait before considering return to base complete.
   * 
   * Note: This is a simulated value. Should be replaced with actual
   * robot return time when hardware integration is complete.
   */
  RETURN_TIMEOUT_MS: 3000,
  
  /** 
   * Cleaning interval in milliseconds.
   * How often to update battery and progress during cleaning (simulated).
   * 
   * Note: This is a simulated value. Should be replaced with actual
   * robot telemetry update frequency when hardware integration is complete.
   */
  CLEANING_INTERVAL_MS: 2000,
} as const;

export type AppEnvironment = "development" | "staging" | "production";

export interface TimingConfig {
  deployTimeoutMs: number;
  returnTimeoutMs: number;
  cleaningIntervalMs: number;
}

export interface BatteryConfig {
  lowThreshold: number;
  initialPercentage: number;
  decrementPerInterval: number;
  maxPercentage: number;
  minPercentage: number;
}

export interface CleaningConfig {
  initialProgress: number;
  maxProgress: number;
  progressIncrement: number;
}

export interface AppConfig {
  timing: TimingConfig;
  battery: BatteryConfig;
  cleaning: CleaningConfig;
}

export interface ApiEnvironmentConfig {
  environment: AppEnvironment;
  apiBaseUrl: string;
  wsUrl: string;
}

const DEFAULT_API_ENDPOINTS: Record<AppEnvironment, { apiBaseUrl: string; wsUrl: string }> = {
  development: {
    apiBaseUrl: "http://localhost:3000/api",
    wsUrl: "ws://localhost:3000",
  },
  staging: {
    apiBaseUrl: "https://staging-api.terra-sweep-sparkle.com/api",
    wsUrl: "wss://staging-api.terra-sweep-sparkle.com",
  },
  production: {
    apiBaseUrl: "https://api.terra-sweep-sparkle.com/api",
    wsUrl: "wss://api.terra-sweep-sparkle.com",
  },
};

function resolveAppEnvironment(): AppEnvironment {
  const rawEnv = (import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE ?? "development").toLowerCase();

  if (rawEnv === "production" || rawEnv === "staging" || rawEnv === "development") {
    return rawEnv;
  }

  console.warn(`Invalid app environment '${rawEnv}'. Falling back to 'development'.`);
  return "development";
}

/**
 * Environment-based Configuration
 * 
 * Allows configuration values to be overridden via environment variables.
 * Falls back to default values if environment variables are not set.
 */
export const getConfig = (): AppConfig => {
  const deployTimeout = import.meta.env.VITE_DEPLOY_TIMEOUT_MS 
    ? Number(import.meta.env.VITE_DEPLOY_TIMEOUT_MS) 
    : TIMING_CONFIG.DEPLOY_TIMEOUT_MS;
  
  const returnTimeout = import.meta.env.VITE_RETURN_TIMEOUT_MS 
    ? Number(import.meta.env.VITE_RETURN_TIMEOUT_MS) 
    : TIMING_CONFIG.RETURN_TIMEOUT_MS;
  
  const cleaningInterval = import.meta.env.VITE_CLEANING_INTERVAL_MS 
    ? Number(import.meta.env.VITE_CLEANING_INTERVAL_MS) 
    : TIMING_CONFIG.CLEANING_INTERVAL_MS;
  
  const batteryThreshold = import.meta.env.VITE_BATTERY_LOW_THRESHOLD 
    ? Number(import.meta.env.VITE_BATTERY_LOW_THRESHOLD) 
    : BATTERY_CONFIG.LOW_THRESHOLD;
  
  // Validate environment variable values
  if (isNaN(deployTimeout) || deployTimeout <= 0) {
    console.warn(`Invalid VITE_DEPLOY_TIMEOUT_MS: ${import.meta.env.VITE_DEPLOY_TIMEOUT_MS}. Using default: ${TIMING_CONFIG.DEPLOY_TIMEOUT_MS}`);
  }
  if (isNaN(returnTimeout) || returnTimeout <= 0) {
    console.warn(`Invalid VITE_RETURN_TIMEOUT_MS: ${import.meta.env.VITE_RETURN_TIMEOUT_MS}. Using default: ${TIMING_CONFIG.RETURN_TIMEOUT_MS}`);
  }
  if (isNaN(cleaningInterval) || cleaningInterval <= 0) {
    console.warn(`Invalid VITE_CLEANING_INTERVAL_MS: ${import.meta.env.VITE_CLEANING_INTERVAL_MS}. Using default: ${TIMING_CONFIG.CLEANING_INTERVAL_MS}`);
  }
  if (isNaN(batteryThreshold) || batteryThreshold < 0 || batteryThreshold > 100) {
    console.warn(`Invalid VITE_BATTERY_LOW_THRESHOLD: ${import.meta.env.VITE_BATTERY_LOW_THRESHOLD}. Using default: ${BATTERY_CONFIG.LOW_THRESHOLD}`);
  }
  
  return {
    timing: {
      deployTimeoutMs: deployTimeout > 0 ? deployTimeout : TIMING_CONFIG.DEPLOY_TIMEOUT_MS,
      returnTimeoutMs: returnTimeout > 0 ? returnTimeout : TIMING_CONFIG.RETURN_TIMEOUT_MS,
      cleaningIntervalMs: cleaningInterval > 0 ? cleaningInterval : TIMING_CONFIG.CLEANING_INTERVAL_MS,
    },
    battery: {
      lowThreshold: (batteryThreshold >= 0 && batteryThreshold <= 100) 
        ? batteryThreshold 
        : BATTERY_CONFIG.LOW_THRESHOLD,
      initialPercentage: BATTERY_CONFIG.INITIAL_PERCENTAGE,
      decrementPerInterval: BATTERY_CONFIG.DECREMENT_PER_INTERVAL,
      maxPercentage: BATTERY_CONFIG.MAX_PERCENTAGE,
      minPercentage: BATTERY_CONFIG.MIN_PERCENTAGE,
    },
    cleaning: {
      initialProgress: CLEANING_CONFIG.INITIAL_PROGRESS,
      maxProgress: CLEANING_CONFIG.MAX_PROGRESS,
      progressIncrement: CLEANING_CONFIG.PROGRESS_INCREMENT,
    },
  };
};

export const getApiEnvironmentConfig = (): ApiEnvironmentConfig => {
  const environment = resolveAppEnvironment();
  const defaults = DEFAULT_API_ENDPOINTS[environment];
  const envSpecificApiBaseUrl =
    environment === "staging"
      ? import.meta.env.VITE_STAGING_API_BASE_URL
      : environment === "production"
        ? import.meta.env.VITE_PRODUCTION_API_BASE_URL
        : undefined;
  const envSpecificWsUrl =
    environment === "staging"
      ? import.meta.env.VITE_STAGING_WS_URL
      : environment === "production"
        ? import.meta.env.VITE_PRODUCTION_WS_URL
        : undefined;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || envSpecificApiBaseUrl || defaults.apiBaseUrl;
  const wsUrl = import.meta.env.VITE_WS_URL || envSpecificWsUrl || defaults.wsUrl;

  return {
    environment,
    apiBaseUrl,
    wsUrl,
  };
};

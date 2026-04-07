import { useEffect, useRef, useState } from "react";
import { DeployButton } from "@/components/DeployButton";
import { RobotStatusCard } from "@/components/RobotStatusCard";
import { BatteryIndicator } from "@/components/BatteryIndicator";
import { CleaningProgress } from "@/components/CleaningProgress";
import { toast } from "sonner";
import { logError, toUserFacingError } from "@/lib/errorHandler";
import { 
  ROBOT_STATUS, 
  DEPLOY_STATE, 
  LOCATIONS, 
  type Location,
  type RobotStatus, 
  type DeployState 
} from "@/lib/constants";
import { getConfig } from "@/lib/config";

// Get configuration values (can be overridden via environment variables)
const config = getConfig();

export function DashboardSection() {
  const [deployState, setDeployState] = useState<DeployState>(DEPLOY_STATE.IDLE);
  const [robotStatus, setRobotStatus] = useState<RobotStatus>(ROBOT_STATUS.IDLE);
  const [battery, setBattery] = useState<number>(config.battery.initialPercentage);
  const [location, setLocation] = useState<Location>(LOCATIONS.HOME_BASE);
  const [cleaningProgress, setCleaningProgress] = useState<number>(config.cleaning.initialProgress);
  const batteryRef = useRef<number>(config.battery.initialPercentage);
  const cleaningProgressRef = useRef<number>(config.cleaning.initialProgress);

  // Defensively avoid updating state after unmount.
  const isMountedRef = useRef<boolean>(true);
  const deployTimeoutRef = useRef<number | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (deployTimeoutRef.current) window.clearTimeout(deployTimeoutRef.current);
      if (stopTimeoutRef.current) window.clearTimeout(stopTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    batteryRef.current = battery;
  }, [battery]);

  useEffect(() => {
    cleaningProgressRef.current = cleaningProgress;
  }, [cleaningProgress]);

  const handleDeploy = () => {
    setDeployState(DEPLOY_STATE.DEPLOYING);
    setCleaningProgress(config.cleaning.initialProgress);
    toast.info("Initializing robot systems...");

    if (deployTimeoutRef.current) window.clearTimeout(deployTimeoutRef.current);

    deployTimeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      try {
        setDeployState(DEPLOY_STATE.DEPLOYED);
        setRobotStatus(ROBOT_STATUS.CLEANING);
        setLocation(LOCATIONS.ZONE_A_NORTH);
        toast.success("Robot deployed successfully!");
      } catch (err) {
        logError(err, "DashboardSection handleDeploy setTimeout");
        const userFacing = toUserFacingError(err);
        toast.error(userFacing.message);
      }
    }, config.timing.deployTimeoutMs);
  };

  const handleStop = () => {
    if (stopTimeoutRef.current) window.clearTimeout(stopTimeoutRef.current);

    setRobotStatus(ROBOT_STATUS.RETURNING);
    setLocation(LOCATIONS.RETURNING);
    toast.info("Robot returning to base...");
    
    stopTimeoutRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      try {
        setDeployState(DEPLOY_STATE.IDLE);
        setRobotStatus(ROBOT_STATUS.IDLE);
        setLocation(LOCATIONS.HOME_BASE);
        toast.success("Robot returned to base");
      } catch (err) {
        logError(err, "DashboardSection handleStop setTimeout");
        const userFacing = toUserFacingError(err);
        toast.error(userFacing.message);
      }
    }, config.timing.returnTimeoutMs);
  };

  useEffect(() => {
    if (robotStatus === ROBOT_STATUS.CLEANING) {
      const interval = setInterval(() => {
        if (!isMountedRef.current) return;

        try {
          // Compute both values first, then apply exactly one deterministic transition.
          const currentBattery = Math.max(
            config.battery.minPercentage,
            Math.min(config.battery.maxPercentage, batteryRef.current)
          );
          const currentProgress = Math.max(
            config.cleaning.initialProgress,
            Math.min(config.cleaning.maxProgress, cleaningProgressRef.current)
          );

          const nextBattery =
            currentBattery <= config.battery.lowThreshold
              ? currentBattery
              : Math.max(
                  config.battery.minPercentage,
                  currentBattery - config.battery.decrementPerInterval
                );
          const nextProgress =
            currentProgress >= config.cleaning.maxProgress
              ? config.cleaning.maxProgress
              : Math.min(
                  config.cleaning.maxProgress,
                  currentProgress + config.cleaning.progressIncrement
                );

          setBattery(nextBattery);
          setCleaningProgress(nextProgress);

          const isLowBattery = currentBattery <= config.battery.lowThreshold;
          const isCleaningComplete = currentProgress >= config.cleaning.maxProgress;

          if (isLowBattery) {
            setRobotStatus(ROBOT_STATUS.RETURNING);
            setLocation(LOCATIONS.RETURNING_LOW_BATTERY);
            toast.warning("Low battery! Returning to base...");
            return;
          }

          if (isCleaningComplete) {
            setRobotStatus(ROBOT_STATUS.RETURNING);
            setLocation(LOCATIONS.RETURNING);
            toast.success("Cleaning complete! Returning to base.");
          }
        } catch (err) {
          logError(err, "DashboardSection cleaning interval");
          toast.error(toUserFacingError(err).message);
        }
      }, config.timing.cleaningIntervalMs);
      return () => clearInterval(interval);
    }
  }, [robotStatus]);

  return (
    <section id="dashboard" className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Control Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor and control your Clean Bot in real-time
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <DeployButton 
              state={deployState}
              onDeploy={handleDeploy}
              onStop={handleStop}
              disabled={robotStatus === ROBOT_STATUS.RETURNING || robotStatus === ROBOT_STATUS.CHARGING}
            />
          </div>
          
          <div className="lg:col-span-1">
            <RobotStatusCard status={robotStatus} location={location} />
          </div>
          
          <div className="lg:col-span-1">
            <BatteryIndicator 
              percentage={battery} 
              isCharging={robotStatus === ROBOT_STATUS.CHARGING} 
            />
          </div>

          <div className="lg:col-span-1">
            <CleaningProgress 
              progress={Math.min(cleaningProgress, config.cleaning.maxProgress)} 
              isActive={robotStatus === ROBOT_STATUS.CLEANING} 
            />
          </div>
        </div>

        <div className="mt-8 glass rounded-2xl p-6 shadow-card">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-secondary/50 rounded-xl">
              <p className="font-heading text-2xl font-bold text-primary">127</p>
              <p className="text-sm text-muted-foreground">Total Runs</p>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-xl">
              <p className="font-heading text-2xl font-bold text-success">98%</p>
              <p className="text-sm text-muted-foreground">Efficiency</p>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-xl">
              <p className="font-heading text-2xl font-bold text-foreground">3.2k</p>
              <p className="text-sm text-muted-foreground">m² Cleaned</p>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-xl">
              <p className="font-heading text-2xl font-bold text-foreground">48h</p>
              <p className="text-sm text-muted-foreground">Total Runtime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

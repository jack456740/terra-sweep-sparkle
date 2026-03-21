import { useRobotStore } from "@/store/robotStore";
import { useRobotSimulation } from "@/hooks/useRobotSimulation";
import { DeployButton } from "@/components/DeployButton";
import { RobotStatusCard } from "@/components/RobotStatusCard";
import { BatteryIndicator } from "@/components/BatteryIndicator";
import { CleaningProgress } from "@/components/CleaningProgress";
import { toast } from "sonner";
import { ROBOT_STATUS } from "@/lib/constants";
import { getConfig } from "@/lib/config";

const config = getConfig();

export function DashboardSection() {
  const { deployState, robotStatus, batteryLevel, currentLocation, cleaningProgress, deployRobot, stopRobot } = useRobotStore();
  useRobotSimulation();

  const handleDeploy = () => {
    toast.info("Initializing robot systems...");
    deployRobot();
    setTimeout(() => toast.success("Robot deployed successfully!"), config.timing.deployTimeoutMs);
  };

  const handleStop = () => {
    toast.info("Robot returning to base...");
    stopRobot();
    setTimeout(() => toast.success("Robot returned to base"), config.timing.returnTimeoutMs);
  };

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
            <RobotStatusCard status={robotStatus} location={currentLocation} />
          </div>
          
          <div className="lg:col-span-1">
            <BatteryIndicator 
              percentage={batteryLevel}
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

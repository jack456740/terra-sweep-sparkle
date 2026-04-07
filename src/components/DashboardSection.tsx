import { DeployButton } from "@/components/DeployButton";
import { RobotStatusCard } from "@/components/RobotStatusCard";
import { BatteryIndicator } from "@/components/BatteryIndicator";
import { CleaningProgress } from "@/components/CleaningProgress";
import { DashboardQuickStats } from "@/features/dashboard/components/DashboardQuickStats";
import { useDashboardController } from "@/features/dashboard/useDashboardController";

/**
 * Dashboard Section component.
 * @returns The rendered Dashboard Section component.
 */
export function DashboardSection() {
  const {
    deployState,
    robotStatus,
    batteryLevel,
    currentLocation,
    cleaningProgress,
    isCharging,
    isCleaning,
    isControlDisabled,
    handleDeploy,
    handleStop,
  } = useDashboardController();

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
              disabled={isControlDisabled}
            />
          </div>
          
          <div className="lg:col-span-1">
            <RobotStatusCard status={robotStatus} location={currentLocation} />
          </div>
          
          <div className="lg:col-span-1">
            <BatteryIndicator 
              percentage={batteryLevel}
              isCharging={isCharging}
            />
          </div>

          <div className="lg:col-span-1">
            <CleaningProgress 
              progress={cleaningProgress}
              isActive={isCleaning}
            />
          </div>
        </div>

        <DashboardQuickStats />
      </div>
    </section>
  );
}

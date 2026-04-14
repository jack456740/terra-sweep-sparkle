import { DeployButton } from "@/components/DeployButton";
import { RobotStatusCard } from "@/components/RobotStatusCard";
import { BatteryIndicator } from "@/components/BatteryIndicator";
import { CleaningProgress } from "@/components/CleaningProgress";
import { SystemActivityLog } from "@/components/SystemActivityLog";
import { FloorPlanMap } from "@/components/FloorPlanMap";
import { DashboardQuickStats } from "@/features/dashboard/components/DashboardQuickStats";
import { useDashboardController } from "@/features/dashboard/useDashboardController";

/**
 * Dashboard Section component.
 * @returns The rendered Dashboard Section component.
 */
export function DashboardSection(): JSX.Element {
  const {
    deployState,
    robotStatus,
    batteryLevel,
    currentLocation,
    cleaningProgress,
    telemetrySource,
    pose,
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
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary mb-4">
            Live Dashboard
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Control Dashboard
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Monitor and control your Clean Bot in real-time with full system visibility
          </p>
        </div>

        {/* Top row: Status + Battery + Deploy */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="lg:col-span-1">
            <RobotStatusCard status={robotStatus} location={currentLocation} />
          </div>

          <div className="lg:col-span-1">
            <BatteryIndicator
              percentage={batteryLevel}
              isCharging={isCharging}
            />
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <DeployButton
              state={deployState}
              onDeploy={handleDeploy}
              onStop={handleStop}
              disabled={isControlDisabled}
            />
            <CleaningProgress
              progress={cleaningProgress}
              isActive={isCleaning}
            />
          </div>
        </div>

        {/* Middle row: Floor Plan + Activity Log */}
        <div className="grid gap-6 lg:grid-cols-5 mb-6">
          <div className="lg:col-span-3">
            <FloorPlanMap
              robotStatus={robotStatus}
              currentLocation={currentLocation}
              cleaningProgress={cleaningProgress}
              telemetrySource={telemetrySource}
              pose={pose}
            />
          </div>
          <div className="lg:col-span-2">
            <SystemActivityLog robotStatus={robotStatus} batteryLevel={batteryLevel} />
          </div>
        </div>

        {/* Bottom row: Quick Stats */}
        <DashboardQuickStats />
      </div>
    </section>
  );
}

import { Activity, CheckCircle, AlertTriangle, Info, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RobotStatus } from "@/lib/constants";

interface ActivityEntry {
  id: string;
  message: string;
  type: "info" | "success" | "warning";
  time: string;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
};

const colorMap = {
  info: "text-primary",
  success: "text-success",
  warning: "text-warning",
};

const bgMap = {
  info: "bg-primary/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
};

function getActivityLog(status: RobotStatus, battery: number): ActivityEntry[] {
  const entries: ActivityEntry[] = [];

  if (status === "cleaning") {
    entries.push(
      { id: "1", message: "Cleaning session started", type: "success", time: "Just now" },
      { id: "2", message: "Navigating Zone A - North Side", type: "info", time: "1m ago" },
      { id: "3", message: "Obstacle detected & avoided", type: "warning", time: "2m ago" },
    );
  } else if (status === "returning") {
    entries.push(
      { id: "1", message: "Returning to home base", type: "warning", time: "Just now" },
      { id: "2", message: "Cleaning session paused", type: "info", time: "1m ago" },
    );
  } else if (status === "charging") {
    entries.push(
      { id: "1", message: "Charging in progress", type: "info", time: "Just now" },
      { id: "2", message: "Docked at home base", type: "success", time: "2m ago" },
    );
  } else if (status === "idle") {
    entries.push(
      { id: "1", message: "System ready for deployment", type: "success", time: "Now" },
      { id: "2", message: "All sensors operational", type: "info", time: "5m ago" },
      { id: "3", message: "Self-diagnostic passed", type: "success", time: "10m ago" },
    );
  } else {
    entries.push(
      { id: "1", message: "Connection lost", type: "warning", time: "Just now" },
    );
  }

  if (battery <= 20) {
    entries.unshift({ id: "batt", message: "Low battery warning", type: "warning", time: "Now" });
  }

  return entries;
}

interface SystemActivityLogProps {
  robotStatus: RobotStatus;
  batteryLevel: number;
}

export function SystemActivityLog({ robotStatus, batteryLevel }: SystemActivityLogProps) {
  const entries = getActivityLog(robotStatus, batteryLevel);

  return (
    <div className="glass rounded-2xl p-6 shadow-card h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Activity className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground">System Activity</h3>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => {
          const Icon = iconMap[entry.type];
          return (
            <div
              key={entry.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl transition-colors",
                bgMap[entry.type],
              )}
            >
              <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", colorMap[entry.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{entry.message}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{entry.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

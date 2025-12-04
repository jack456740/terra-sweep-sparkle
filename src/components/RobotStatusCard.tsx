import { Bot, Wifi, WifiOff, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type RobotStatus = "idle" | "cleaning" | "returning" | "charging" | "offline";

interface RobotStatusCardProps {
  status: RobotStatus;
  location?: string;
}

const statusConfig: Record<RobotStatus, { label: string; color: string; bgColor: string; animate: boolean }> = {
  idle: {
    label: "Idle",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    animate: false,
  },
  cleaning: {
    label: "Cleaning",
    color: "text-success",
    bgColor: "bg-success/10",
    animate: true,
  },
  returning: {
    label: "Returning to Base",
    color: "text-warning",
    bgColor: "bg-warning/10",
    animate: true,
  },
  charging: {
    label: "Charging",
    color: "text-primary",
    bgColor: "bg-primary/10",
    animate: true,
  },
  offline: {
    label: "Offline",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    animate: false,
  },
};

export function RobotStatusCard({ status, location = "Home Base" }: RobotStatusCardProps) {
  const config = statusConfig[status];
  const isConnected = status !== "offline";

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">Robot Status</h3>
        <div className={cn("flex items-center gap-2", isConnected ? "text-success" : "text-destructive")}>
          {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <span className="text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className={cn(
          "relative w-16 h-16 rounded-2xl flex items-center justify-center",
          config.bgColor,
          status === "cleaning" && "animate-pulse-glow"
        )}>
          <Bot className={cn("h-8 w-8", config.color)} />
          {config.animate && (
            <span className={cn(
              "absolute -top-1 -right-1 w-3 h-3 rounded-full",
              status === "cleaning" ? "bg-success" : status === "returning" ? "bg-warning" : "bg-primary",
              "animate-status-blink"
            )} />
          )}
        </div>
        <div>
          <div className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
            config.bgColor,
            config.color
          )}>
            {config.label}
          </div>
          <div className="flex items-center gap-1 mt-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-sm">{location}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-muted-foreground mb-1">Runtime Today</p>
          <p className="font-heading font-semibold text-foreground">2h 34m</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-muted-foreground mb-1">Area Cleaned</p>
          <p className="font-heading font-semibold text-foreground">450 m²</p>
        </div>
      </div>
    </div>
  );
}

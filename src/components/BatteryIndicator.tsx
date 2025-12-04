import { Battery, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BatteryIndicatorProps {
  percentage: number;
  isCharging?: boolean;
}

export function BatteryIndicator({ percentage, isCharging = false }: BatteryIndicatorProps) {
  const getBatteryColor = () => {
    if (percentage <= 20) return "bg-destructive";
    if (percentage <= 50) return "bg-warning";
    return "bg-success";
  };

  const getBatteryTextColor = () => {
    if (percentage <= 20) return "text-destructive";
    if (percentage <= 50) return "text-warning";
    return "text-success";
  };

  const getBatteryIcon = () => {
    if (isCharging) return BatteryCharging;
    if (percentage <= 20) return BatteryLow;
    if (percentage <= 50) return BatteryMedium;
    return BatteryFull;
  };

  const BatteryIcon = getBatteryIcon();

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-lg font-semibold text-foreground">Battery</h3>
        {isCharging && (
          <div className="flex items-center gap-1 text-primary">
            <Zap className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Charging</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className={cn(
          "relative w-20 h-20 rounded-2xl flex items-center justify-center",
          isCharging ? "bg-primary/10" : "bg-secondary"
        )}>
          <BatteryIcon className={cn("h-10 w-10", getBatteryTextColor())} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-end gap-1 mb-3">
            <span className={cn("font-heading text-4xl font-bold", getBatteryTextColor())}>
              {percentage}
            </span>
            <span className="text-xl text-muted-foreground mb-1">%</span>
          </div>
          
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                getBatteryColor(),
                isCharging && "animate-pulse"
              )}
              style={{ 
                width: `${percentage}%`,
              }}
            />
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            {isCharging 
              ? `~${Math.ceil((100 - percentage) / 20)} min to full` 
              : `~${Math.floor(percentage * 1.5)} min remaining`
            }
          </p>
        </div>
      </div>
    </div>
  );
}

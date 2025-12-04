import { Target, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CleaningProgressProps {
  progress: number;
  isActive: boolean;
  totalArea?: number;
}

export function CleaningProgress({ progress, isActive, totalArea = 500 }: CleaningProgressProps) {
  const cleanedArea = Math.round((progress / 100) * totalArea);

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">Cleaning Progress</h3>
        {progress === 100 && (
          <div className="flex items-center gap-1 text-success">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Complete</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center",
          isActive ? "bg-primary/10" : "bg-secondary"
        )}>
          <Target className={cn(
            "h-7 w-7",
            isActive ? "text-primary animate-pulse" : "text-muted-foreground"
          )} />
        </div>
        <div className="flex-1">
          <div className="flex items-end gap-1 mb-1">
            <span className={cn(
              "font-heading text-3xl font-bold",
              isActive ? "text-primary" : "text-foreground"
            )}>
              {progress}
            </span>
            <span className="text-lg text-muted-foreground mb-0.5">%</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {cleanedArea} / {totalArea} m² cleaned
          </p>
        </div>
      </div>

      <div className="relative w-full h-4 bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
            isActive ? "gradient-primary" : "bg-muted-foreground/30",
            isActive && progress < 100 && "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-[shimmer_2s_infinite]"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {isActive ? "Estimated time remaining" : "Session status"}
        </span>
        <span className={cn(
          "font-medium",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {isActive 
            ? `~${Math.ceil((100 - progress) * 0.5)} min`
            : progress === 100 ? "Completed" : "Not started"
          }
        </span>
      </div>
    </div>
  );
}

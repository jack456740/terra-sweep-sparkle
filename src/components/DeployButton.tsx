import { Play, Square, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type DeployState = "idle" | "deploying" | "deployed";

interface DeployButtonProps {
  state: DeployState;
  onDeploy: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function DeployButton({ state, onDeploy, onStop, disabled = false }: DeployButtonProps) {
  const isDeployed = state === "deployed" || state === "deploying";

  return (
    <div className="glass rounded-2xl p-6 shadow-card">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-6">Robot Control</h3>
      
      <div className="flex flex-col items-center">
        <button
          onClick={isDeployed ? onStop : onDeploy}
          disabled={disabled || state === "deploying"}
          className={cn(
            "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
            "focus:outline-none focus:ring-4 focus:ring-primary/30",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && !isDeployed && "gradient-primary hover:scale-105 shadow-glow active:scale-95",
            !disabled && isDeployed && "bg-destructive hover:bg-destructive/90 hover:scale-105 active:scale-95",
            state === "deploying" && "animate-pulse-glow"
          )}
        >
          {state === "deploying" ? (
            <RotateCcw className="h-12 w-12 text-primary-foreground animate-spin" />
          ) : isDeployed ? (
            <Square className="h-12 w-12 text-destructive-foreground" />
          ) : (
            <Play className="h-12 w-12 text-primary-foreground ml-2" />
          )}
        </button>
        
        <p className={cn(
          "mt-4 font-heading font-semibold text-lg",
          isDeployed ? "text-destructive" : "text-primary"
        )}>
          {state === "deploying" ? "Deploying..." : isDeployed ? "Stop Robot" : "Deploy Robot"}
        </p>
        
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-[200px]">
          {state === "deploying" 
            ? "Initializing systems..."
            : isDeployed 
              ? "Tap to stop the cleaning cycle" 
              : "Tap to start autonomous cleaning"
          }
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last deployed</span>
          <span className="font-medium text-foreground">Today, 2:34 PM</span>
        </div>
      </div>
    </div>
  );
}

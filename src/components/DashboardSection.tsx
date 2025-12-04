import { useState, useEffect } from "react";
import { DeployButton } from "@/components/DeployButton";
import { RobotStatusCard } from "@/components/RobotStatusCard";
import { BatteryIndicator } from "@/components/BatteryIndicator";
import { CleaningProgress } from "@/components/CleaningProgress";
import { toast } from "sonner";

type RobotStatus = "idle" | "cleaning" | "returning" | "charging" | "offline";
type DeployState = "idle" | "deploying" | "deployed";

export function DashboardSection() {
  const [deployState, setDeployState] = useState<DeployState>("idle");
  const [robotStatus, setRobotStatus] = useState<RobotStatus>("idle");
  const [battery, setBattery] = useState(78);
  const [location, setLocation] = useState("Home Base");
  const [cleaningProgress, setCleaningProgress] = useState(0);

  const handleDeploy = () => {
    setDeployState("deploying");
    setCleaningProgress(0);
    toast.info("Initializing robot systems...");
    
    setTimeout(() => {
      setDeployState("deployed");
      setRobotStatus("cleaning");
      setLocation("Zone A - North Side");
      toast.success("Robot deployed successfully!");
    }, 2000);
  };

  const handleStop = () => {
    setRobotStatus("returning");
    setLocation("Returning...");
    toast.info("Robot returning to base...");
    
    setTimeout(() => {
      setDeployState("idle");
      setRobotStatus("idle");
      setLocation("Home Base");
      toast.success("Robot returned to base");
    }, 3000);
  };

  useEffect(() => {
    if (robotStatus === "cleaning") {
      const interval = setInterval(() => {
        setBattery(prev => {
          if (prev <= 20) {
            setRobotStatus("returning");
            setLocation("Returning (Low Battery)");
            toast.warning("Low battery! Returning to base...");
            return prev;
          }
          return prev - 1;
        });
        
        setCleaningProgress(prev => {
          if (prev >= 100) {
            setRobotStatus("returning");
            setLocation("Returning...");
            toast.success("Cleaning complete! Returning to base.");
            return 100;
          }
          return prev + 3;
        });
      }, 2000);
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
              disabled={robotStatus === "returning" || robotStatus === "charging"}
            />
          </div>
          
          <div className="lg:col-span-1">
            <RobotStatusCard status={robotStatus} location={location} />
          </div>
          
          <div className="lg:col-span-1">
            <BatteryIndicator 
              percentage={battery} 
              isCharging={robotStatus === "charging"} 
            />
          </div>

          <div className="lg:col-span-1">
            <CleaningProgress 
              progress={Math.min(cleaningProgress, 100)} 
              isActive={robotStatus === "cleaning"} 
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

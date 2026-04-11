import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { RobotStatus } from "@/lib/constants";

interface FloorPlanMapProps {
  robotStatus: RobotStatus;
  currentLocation: string;
  cleaningProgress: number;
}

/** Zone definitions for the floor plan grid */
const ZONES = [
  { id: "zone-a", label: "Zone A", x: 20, y: 20, w: 200, h: 140, cleanOrder: 1 },
  { id: "zone-b", label: "Zone B", x: 240, y: 20, w: 200, h: 140, cleanOrder: 2 },
  { id: "zone-c", label: "Zone C", x: 20, y: 180, w: 200, h: 140, cleanOrder: 3 },
  { id: "zone-d", label: "Zone D", x: 240, y: 180, w: 200, h: 140, cleanOrder: 4 },
] as const;

/** Trash items (green) — collected when zone is cleaned */
const TRASH_ITEMS = [
  { id: "t1", zoneOrder: 1, cx: 70, cy: 65, shape: "leaf" as const },
  { id: "t2", zoneOrder: 1, cx: 160, cy: 110, shape: "bottle" as const },
  { id: "t3", zoneOrder: 1, cx: 120, cy: 140, shape: "wrapper" as const },
  { id: "t4", zoneOrder: 2, cx: 300, cy: 55, shape: "leaf" as const },
  { id: "t5", zoneOrder: 2, cx: 370, cy: 100, shape: "bottle" as const },
  { id: "t6", zoneOrder: 2, cx: 330, cy: 135, shape: "wrapper" as const },
  { id: "t7", zoneOrder: 3, cx: 80, cy: 220, shape: "leaf" as const },
  { id: "t8", zoneOrder: 3, cx: 150, cy: 270, shape: "bottle" as const },
  { id: "t9", zoneOrder: 3, cx: 110, cy: 300, shape: "wrapper" as const },
  { id: "t10", zoneOrder: 4, cx: 310, cy: 210, shape: "leaf" as const },
  { id: "t11", zoneOrder: 4, cx: 380, cy: 260, shape: "bottle" as const },
  { id: "t12", zoneOrder: 4, cx: 340, cy: 295, shape: "wrapper" as const },
];

/** Obstacles (red) — robot avoids these */
const OBSTACLES = [
  { id: "o1", cx: 190, cy: 90, r: 10, label: "Rock" },
  { id: "o2", cx: 410, cy: 70, r: 12, label: "Bench" },
  { id: "o3", cx: 60, cy: 260, r: 11, label: "Pot" },
  { id: "o4", cx: 400, cy: 240, r: 10, label: "Post" },
];

const BASE = { x: 440, y: 300, label: "Base" };

function getZoneStatus(
  cleanOrder: number,
  cleaningProgress: number,
  robotStatus: RobotStatus
): "idle" | "cleaning" | "cleaned" {
  if (robotStatus !== "cleaning" && robotStatus !== "returning") {
    if (cleaningProgress === 0) return "idle";
  }
  const perZone = 100 / ZONES.length;
  const zoneStart = (cleanOrder - 1) * perZone;
  const zoneEnd = cleanOrder * perZone;
  if (cleaningProgress >= zoneEnd) return "cleaned";
  if (cleaningProgress > zoneStart) return "cleaning";
  return "idle";
}

function getRobotPosition(
  robotStatus: RobotStatus,
  cleaningProgress: number
): { x: number; y: number } {
  if (
    robotStatus === "idle" ||
    robotStatus === "charging" ||
    robotStatus === "offline"
  ) {
    return { x: BASE.x, y: BASE.y };
  }
  if (robotStatus === "returning") {
    // Animate between last zone and base
    const lastZone = ZONES[ZONES.length - 1];
    const zoneCx = lastZone.x + lastZone.w / 2;
    const zoneCy = lastZone.y + lastZone.h / 2;
    return {
      x: (zoneCx + BASE.x) / 2,
      y: (zoneCy + BASE.y) / 2,
    };
  }
  // Cleaning — place in active zone
  const perZone = 100 / ZONES.length;
  const activeIndex = Math.min(
    Math.floor(cleaningProgress / perZone),
    ZONES.length - 1
  );
  const zone = ZONES[activeIndex];
  const withinZone = (cleaningProgress % perZone) / perZone;
  return {
    x: zone.x + 30 + withinZone * (zone.w - 60),
    y: zone.y + zone.h / 2 + Math.sin(withinZone * Math.PI * 4) * 20,
  };
}

const statusFill: Record<string, string> = {
  idle: "hsl(165, 20%, 92%)",
  cleaning: "hsl(168, 76%, 42%, 0.18)",
  cleaned: "hsl(142, 76%, 36%, 0.18)",
};

const statusStroke: Record<string, string> = {
  idle: "hsl(168, 30%, 85%)",
  cleaning: "hsl(168, 76%, 42%)",
  cleaned: "hsl(142, 76%, 36%)",
};

export function FloorPlanMap({
  robotStatus,
  currentLocation,
  cleaningProgress,
}: FloorPlanMapProps): JSX.Element {
  const robotPos = useMemo(
    () => getRobotPosition(robotStatus, cleaningProgress),
    [robotStatus, cleaningProgress]
  );

  const isCleaning = robotStatus === "cleaning";

  return (
    <div className="glass rounded-2xl p-6 shadow-card h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 12h18M12 3v18" />
            </svg>
          </div>
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Floor Plan
          </h3>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(142,70%,45%)]" />
            Trash
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[hsl(0,70%,50%)]" />
            Obstacle
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary/20 border border-primary" />
            Active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-success/20 border border-success" />
            Cleaned
          </span>
        </div>
      </div>

      <div className="w-full aspect-[5/4] max-h-[340px]">
        <svg
          viewBox="0 0 500 360"
          className="w-full h-full"
          role="img"
          aria-label="Floor plan showing robot position and cleaned areas"
        >
          {/* Background */}
          <rect
            x="10"
            y="10"
            width="480"
            height="340"
            rx="12"
            fill="hsl(165, 30%, 96%)"
            stroke="hsl(168, 30%, 85%)"
            strokeWidth="1.5"
          />

          {/* Zones */}
          {ZONES.map((zone) => {
            const status = getZoneStatus(
              zone.cleanOrder,
              cleaningProgress,
              robotStatus
            );
            return (
              <g key={zone.id}>
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  rx="8"
                  fill={statusFill[status]}
                  stroke={statusStroke[status]}
                  strokeWidth={status === "cleaning" ? 2 : 1.2}
                  strokeDasharray={status === "cleaning" ? "6 3" : "none"}
                  className={cn(
                    "transition-all duration-700",
                    status === "cleaning" && "animate-pulse"
                  )}
                />
                {/* Zone label */}
                <text
                  x={zone.x + zone.w / 2}
                  y={zone.y + 22}
                  textAnchor="middle"
                  className="text-[11px] font-medium"
                  fill={
                    status === "cleaned"
                      ? "hsl(142, 76%, 36%)"
                      : status === "cleaning"
                        ? "hsl(168, 76%, 42%)"
                        : "hsl(180, 10%, 45%)"
                  }
                >
                  {zone.label}
                </text>
                {/* Cleaned pattern lines */}
                {status === "cleaned" && (
                  <g opacity="0.3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <line
                        key={i}
                        x1={zone.x + 15}
                        y1={zone.y + 35 + i * 18}
                        x2={zone.x + zone.w - 15}
                        y2={zone.y + 35 + i * 18}
                        stroke="hsl(142, 76%, 36%)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    ))}
                  </g>
                )}
                {/* Cleaning sweep lines */}
                {status === "cleaning" && (
                  <g opacity="0.25">
                    {Array.from({
                      length: Math.floor(
                        ((cleaningProgress % (100 / ZONES.length)) /
                          (100 / ZONES.length)) *
                          6
                      ),
                    }).map((_, i) => (
                      <line
                        key={i}
                        x1={zone.x + 15}
                        y1={zone.y + 35 + i * 18}
                        x2={zone.x + zone.w - 15}
                        y2={zone.y + 35 + i * 18}
                        stroke="hsl(168, 76%, 42%)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                    ))}
                  </g>
                )}
              </g>
            );
          })}

          {/* Trash items (green) — disappear when zone is cleaned */}
          {TRASH_ITEMS.map((item) => {
            const zoneStatus = getZoneStatus(item.zoneOrder, cleaningProgress, robotStatus);
            const collected = zoneStatus === "cleaned";
            const beingCollected = zoneStatus === "cleaning";
            return (
              <g
                key={item.id}
                opacity={collected ? 0 : beingCollected ? 0.5 : 1}
                className="transition-opacity duration-700"
              >
                {item.shape === "leaf" && (
                  <g transform={`translate(${item.cx}, ${item.cy})`}>
                    <ellipse rx="7" ry="4" fill="hsl(142, 70%, 45%)" transform="rotate(-30)" />
                    <line x1="0" y1="0" x2="5" y2="3" stroke="hsl(142, 50%, 35%)" strokeWidth="0.8" />
                  </g>
                )}
                {item.shape === "bottle" && (
                  <g transform={`translate(${item.cx}, ${item.cy})`}>
                    <rect x="-3" y="-7" width="6" height="14" rx="2" fill="hsl(142, 70%, 45%)" />
                    <rect x="-1.5" y="-10" width="3" height="4" rx="1" fill="hsl(142, 60%, 40%)" />
                  </g>
                )}
                {item.shape === "wrapper" && (
                  <g transform={`translate(${item.cx}, ${item.cy})`}>
                    <polygon points="-6,-4 6,-4 5,4 -5,4" fill="hsl(142, 70%, 45%)" />
                    <line x1="-3" y1="0" x2="3" y2="0" stroke="hsl(142, 50%, 35%)" strokeWidth="0.6" />
                  </g>
                )}
              </g>
            );
          })}

          {/* Obstacles (red) — always visible */}
          {OBSTACLES.map((obs) => (
            <g key={obs.id}>
              <circle
                cx={obs.cx}
                cy={obs.cy}
                r={obs.r}
                fill="hsl(0, 70%, 50%, 0.2)"
                stroke="hsl(0, 70%, 50%)"
                strokeWidth="1.5"
              />
              <line
                x1={obs.cx - obs.r * 0.5}
                y1={obs.cy - obs.r * 0.5}
                x2={obs.cx + obs.r * 0.5}
                y2={obs.cy + obs.r * 0.5}
                stroke="hsl(0, 70%, 50%)"
                strokeWidth="1.5"
              />
              <line
                x1={obs.cx + obs.r * 0.5}
                y1={obs.cy - obs.r * 0.5}
                x2={obs.cx - obs.r * 0.5}
                y2={obs.cy + obs.r * 0.5}
                stroke="hsl(0, 70%, 50%)"
                strokeWidth="1.5"
              />
              <text
                x={obs.cx}
                y={obs.cy + obs.r + 10}
                textAnchor="middle"
                className="text-[8px]"
                fill="hsl(0, 60%, 45%)"
              >
                {obs.label}
              </text>
            </g>
          ))}

          <g>
            <rect
              x={BASE.x - 25}
              y={BASE.y - 18}
              width="50"
              height="36"
              rx="6"
              fill="hsl(168, 76%, 42%, 0.12)"
              stroke="hsl(168, 76%, 42%)"
              strokeWidth="1.5"
            />
            <text
              x={BASE.x}
              y={BASE.y + 3}
              textAnchor="middle"
              className="text-[10px] font-semibold"
              fill="hsl(168, 76%, 42%)"
            >
              BASE
            </text>
          </g>

          {/* Robot trail (subtle) */}
          {isCleaning && (
            <circle
              cx={robotPos.x}
              cy={robotPos.y}
              r="18"
              fill="hsl(168, 76%, 42%, 0.08)"
              className="animate-ping"
              style={{ animationDuration: "2s" }}
            />
          )}

          {/* Robot dot */}
          <g
            className="transition-all duration-1000 ease-in-out"
            style={{
              transform: `translate(${robotPos.x}px, ${robotPos.y}px)`,
            }}
          >
            <circle
              cx="0"
              cy="0"
              r="10"
              fill="hsl(168, 76%, 42%)"
              stroke="hsl(0, 0%, 100%)"
              strokeWidth="2.5"
              className={cn(isCleaning && "drop-shadow-md")}
            />
            <circle cx="0" cy="0" r="3" fill="hsl(0, 0%, 100%)" />
          </g>
        </svg>
      </div>

      {/* Footer info */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Location: <span className="font-medium text-foreground">{currentLocation}</span>
        </span>
        <span className={cn(
          "font-medium",
          isCleaning ? "text-primary" : "text-muted-foreground"
        )}>
          {cleaningProgress}% covered
        </span>
      </div>
    </div>
  );
}

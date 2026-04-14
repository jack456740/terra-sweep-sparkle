import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DEPLOY_STATE, LOCATIONS, ROBOT_STATUS } from "@/lib/constants";
import { useRobotStore } from "@/store/robotStore";
import type { RobotPose, RobotState } from "@/store/types";

type MissionStatus = "idle" | "cleaning" | "returning" | "charging" | "offline";

interface MissionKeyframe {
  tSec: number;
  x: number;
  y: number;
  headingDeg?: number;
  progress: number;
  status?: MissionStatus;
  location?: string;
}

interface MissionScript {
  id: string;
  name: string;
  durationSec: number;
  keyframes: MissionKeyframe[];
}

interface UseMissionScriptSyncResult {
  isMissionRunning: boolean;
  startScriptMission: () => Promise<void>;
  stopScriptMission: () => void;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function interpolatePose(a: MissionKeyframe, b: MissionKeyframe, ratio: number): RobotPose {
  return {
    x: clamp(a.x + (b.x - a.x) * ratio),
    y: clamp(a.y + (b.y - a.y) * ratio),
    headingDeg: (a.headingDeg ?? 0) + ((b.headingDeg ?? 0) - (a.headingDeg ?? 0)) * ratio,
  };
}

function toPatch(frame: MissionKeyframe, pose: RobotPose): Partial<RobotState> {
  return {
    pose,
    cleaningProgress: Math.round(frame.progress),
    currentLocation: frame.location ?? LOCATIONS.MAIN_AREA,
    robotStatus: (frame.status ?? ROBOT_STATUS.CLEANING) as RobotState["robotStatus"],
    deployState:
      (frame.status ?? ROBOT_STATUS.CLEANING) === ROBOT_STATUS.IDLE
        ? DEPLOY_STATE.IDLE
        : DEPLOY_STATE.DEPLOYED,
    telemetrySource: "script",
    lastTelemetryAt: new Date().toISOString(),
  };
}

export function useMissionScriptSync(): UseMissionScriptSyncResult {
  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const missionRef = useRef<MissionScript | null>(null);
  const runningRef = useRef<boolean>(false);
  const [isMissionRunning, setIsMissionRunning] = useState<boolean>(false);
  const updateStatus = useRobotStore((state) => state.updateStatus);
  const setTelemetrySource = useRobotStore((state) => state.setTelemetrySource);

  const stopScriptMission = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    runningRef.current = false;
    setIsMissionRunning(false);
    setTelemetrySource("simulation");
    updateStatus({
      deployState: DEPLOY_STATE.IDLE,
      robotStatus: ROBOT_STATUS.IDLE,
      currentLocation: LOCATIONS.HOME_BASE,
      pose: null,
    });
  }, [setTelemetrySource, updateStatus]);

  const startScriptMission = useCallback(async () => {
    if (runningRef.current) return;

    let mission: MissionScript;
    try {
      const response = await fetch("/missions/demo-mission.json");
      if (!response.ok) {
        throw new Error("Could not load mission script");
      }
      mission = (await response.json()) as MissionScript;
    } catch {
      toast.error("Mission script unavailable. Check /public/missions/demo-mission.json.");
      return;
    }

    if (!Array.isArray(mission.keyframes) || mission.keyframes.length < 2) {
      toast.error("Mission script needs at least 2 keyframes.");
      return;
    }

    missionRef.current = mission;
    startedAtRef.current = Date.now();
    runningRef.current = true;
    setIsMissionRunning(true);

    updateStatus({
      deployState: DEPLOY_STATE.DEPLOYED,
      robotStatus: ROBOT_STATUS.CLEANING,
      telemetrySource: "script",
      currentLocation: LOCATIONS.MAIN_AREA,
      cleaningProgress: 0,
    });

    toast.success(`Script demo started: ${mission.name}`);

    intervalRef.current = window.setInterval(() => {
      const activeMission = missionRef.current;
      if (!activeMission) return;

      const elapsedSec = (Date.now() - startedAtRef.current) / 1000;
      const keyframes = activeMission.keyframes;

      if (elapsedSec >= activeMission.durationSec) {
        const lastFrame = keyframes[keyframes.length - 1];
        const finalPose: RobotPose = {
          x: clamp(lastFrame.x),
          y: clamp(lastFrame.y),
          headingDeg: lastFrame.headingDeg ?? 0,
        };
        updateStatus({
          ...toPatch(lastFrame, finalPose),
          deployState: DEPLOY_STATE.IDLE,
          robotStatus: ROBOT_STATUS.IDLE,
          telemetrySource: "simulation",
        });
        runningRef.current = false;
        setIsMissionRunning(false);
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        toast.success("Script demo completed.");
        return;
      }

      let nextIdx = keyframes.findIndex((frame) => frame.tSec > elapsedSec);
      if (nextIdx <= 0) nextIdx = 1;
      const prev = keyframes[nextIdx - 1];
      const next = keyframes[nextIdx];
      const segmentDuration = Math.max(0.001, next.tSec - prev.tSec);
      const ratio = clamp((elapsedSec - prev.tSec) / segmentDuration, 0, 1);
      const pose = interpolatePose(prev, next, ratio);
      const mergedFrame: MissionKeyframe = {
        ...next,
        progress: prev.progress + (next.progress - prev.progress) * ratio,
      };
      updateStatus(toPatch(mergedFrame, pose));
    }, 100);
  }, [updateStatus]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isMissionRunning,
    startScriptMission,
    stopScriptMission,
  };
}

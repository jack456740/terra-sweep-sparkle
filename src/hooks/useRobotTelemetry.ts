import { useEffect } from "react";
import { robotService, type RobotRealtimeUpdate } from "@/services/robotService";
import { useRobotStore } from "@/store/robotStore";
import type { RobotState } from "@/store/types";

function toStorePatch(update: RobotRealtimeUpdate): Partial<RobotState> {
  const payload = update.payload;

  return {
    ...payload,
    telemetrySource: payload.telemetrySource ?? "live",
    pose: payload.pose ?? null,
    lastTelemetryAt: update.timestamp ?? new Date().toISOString(),
  };
}

export function useRobotTelemetry(): void {
  const updateStatus = useRobotStore((state) => state.updateStatus);

  useEffect(() => {
    let isActive = true;

    const unsubscribe = robotService.subscribeToRobotUpdates((update) => {
      if (!isActive) return;
      updateStatus(toStorePatch(update));
    });

    // Best-effort initial sync when backend is reachable.
    void robotService
      .getRobotStatus()
      .then((status) => {
        if (!isActive) return;
        updateStatus({
          ...status,
          telemetrySource: status.telemetrySource ?? "live",
          pose: status.pose ?? null,
          lastTelemetryAt: status.updatedAt ?? new Date().toISOString(),
        });
      })
      .catch(() => {
        if (!isActive) return;
        updateStatus({ telemetrySource: "simulation" });
      });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [updateStatus]);
}

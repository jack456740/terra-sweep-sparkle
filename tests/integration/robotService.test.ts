import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/client";
import { robotService } from "@/services/robotService";

describe("robotService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("gets robot status through api client", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValue({
      data: {
        robotStatus: "idle",
        deployState: "idle",
        batteryLevel: 100,
        currentLocation: "Home Base",
        cleaningProgress: 0,
      },
      status: 200,
      headers: new Headers(),
    });

    const result = await robotService.getRobotStatus();
    expect(result.robotStatus).toBe("idle");
    expect(result.deployState).toBe("idle");
  });

  it("subscribes to robot updates and forwards parsed messages", () => {
    const messageHandler = vi.fn();
    const close = vi.fn();

    class MockWebSocket {
      static OPEN = 1;
      static CONNECTING = 0;
      static instance: MockWebSocket | null = null;
      readyState = 1;
      onmessage: ((event: MessageEvent<string>) => void) | null = null;
      close = close;
      constructor(url: string) {
        void url;
        MockWebSocket.instance = this;
      }
    }

    vi.stubGlobal("WebSocket", MockWebSocket as unknown as typeof WebSocket);

    const unsubscribe = robotService.subscribeToRobotUpdates(messageHandler);

    if (MockWebSocket.instance?.onmessage) {
      MockWebSocket.instance.onmessage({
        data: JSON.stringify({
          type: "telemetry_update",
          payload: { cleaningProgress: 42 },
        }),
      } as MessageEvent<string>);
    }

    expect(messageHandler).toHaveBeenCalledTimes(1);
    unsubscribe();
    expect(close).toHaveBeenCalledTimes(1);
  });
});

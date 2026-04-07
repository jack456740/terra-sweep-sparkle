import { apiClient, type ApiClientError } from "@/lib/api/client";
import { getApiEnvironmentConfig } from "@/lib/config";
import { retryWithBackoff } from "@/lib/retry";
import type { DeployState, RobotStatus } from "@/lib/constants";

export type RobotStatusResponse = {
  robotStatus: RobotStatus;
  deployState: DeployState;
  batteryLevel: number;
  currentLocation: string;
  cleaningProgress: number;
  updatedAt?: string;
};

export type RobotCommandResponse = {
  success: boolean;
  message: string;
  taskId?: string;
};

export type RobotRealtimeUpdate = {
  type: "status_update" | "telemetry_update" | "event";
  payload: Partial<RobotStatusResponse>;
  timestamp?: string;
};

function normalizeServiceError(err: unknown): ApiClientError {
  if (typeof err === "object" && err !== null) {
    const candidate = err as Partial<ApiClientError>;
    if (typeof candidate.code === "string" && typeof candidate.message === "string") {
      return candidate as ApiClientError;
    }
  }

  if (err instanceof Error) {
    return {
      code: "NETWORK_ERROR",
      message: err.message,
      details: err,
    };
  }

  return {
    code: "NETWORK_ERROR",
    message: "Unexpected robot service error",
    details: err,
  };
}

function isRetryableRobotError(err: unknown): boolean {
  const error = normalizeServiceError(err);

  if (error.code === "TIMEOUT" || error.code === "NETWORK_ERROR") {
    return true;
  }

  return error.code === "HTTP_ERROR" && !!error.status && error.status >= 500;
}

const RETRY_OPTIONS = {
  retries: 2,
  baseDelayMs: 300,
  maxDelayMs: 2500,
  shouldRetry: isRetryableRobotError,
} as const;

export const robotService = {
  async deployRobot(): Promise<RobotCommandResponse> {
    try {
      const response = await retryWithBackoff(
        () => apiClient.post<RobotCommandResponse>("/robot/deploy"),
        RETRY_OPTIONS
      );
      return response.data;
    } catch (err) {
      throw normalizeServiceError(err);
    }
  },

  async stopRobot(): Promise<RobotCommandResponse> {
    try {
      const response = await retryWithBackoff(
        () => apiClient.post<RobotCommandResponse>("/robot/stop"),
        RETRY_OPTIONS
      );
      return response.data;
    } catch (err) {
      throw normalizeServiceError(err);
    }
  },

  async getRobotStatus(): Promise<RobotStatusResponse> {
    try {
      const response = await retryWithBackoff(
        () => apiClient.get<RobotStatusResponse>("/robot/status"),
        RETRY_OPTIONS
      );
      return response.data;
    } catch (err) {
      throw normalizeServiceError(err);
    }
  },

  subscribeToRobotUpdates(onMessage: (update: RobotRealtimeUpdate) => void): () => void {
    const { wsUrl } = getApiEnvironmentConfig();
    const socket = new WebSocket(`${wsUrl.replace(/\/$/, "")}/robot/updates`);

    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(event.data) as RobotRealtimeUpdate;
        onMessage(parsed);
      } catch {
        // Ignore malformed events so one bad message does not break the stream.
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  },
};


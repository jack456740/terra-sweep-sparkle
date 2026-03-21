export type UserFacingError = {
  title: string;
  message: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Convert an unknown error into a user-friendly message.
 * Keep this function deterministic and side-effect free so it can be reused in multiple contexts.
 */
export function toUserFacingError(err: unknown): UserFacingError {
  if (err instanceof Error) {
    return {
      title: "Something went wrong",
      message: err.message || "An unexpected error occurred.",
    };
  }

  if (typeof err === "string") {
    return { title: "Something went wrong", message: err };
  }

  if (isRecord(err)) {
    const message = typeof err.message === "string" ? err.message : undefined;
    if (message) {
      return { title: "Something went wrong", message };
    }
  }

  return {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
  };
}

/**
 * Central place to log errors consistently.
 * For now we only log to the console; later this can be swapped to Sentry or another service.
 */
export function logError(err: unknown, context?: string): void {
  console.error(context ? `[Clean Bot] ${context}` : "[Clean Bot]", err);
}


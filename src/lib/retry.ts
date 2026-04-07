export type RetryOptions = {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

const DEFAULT_BACKOFF_MULTIPLIER = 2;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function withJitter(delayMs: number): number {
  const jitter = Math.floor(Math.random() * Math.max(1, Math.floor(delayMs * 0.2)));
  return delayMs + jitter;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  {
    retries,
    baseDelayMs,
    maxDelayMs,
    backoffMultiplier = DEFAULT_BACKOFF_MULTIPLIER,
    shouldRetry,
  }: RetryOptions
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const canRetry = shouldRetry ? shouldRetry(error, attempt) : true;
      const isLastAttempt = attempt >= retries;

      if (!canRetry || isLastAttempt) {
        throw error;
      }

      const exponentialDelay = Math.min(
        maxDelayMs,
        Math.floor(baseDelayMs * Math.pow(backoffMultiplier, attempt))
      );

      await sleep(withJitter(exponentialDelay));
      attempt += 1;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Retry operation failed");
}


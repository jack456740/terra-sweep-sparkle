import React from "react";
import { logError, toUserFacingError } from "@/lib/errorHandler";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: unknown;
};

/**
 * React Error Boundary to prevent the entire app from crashing.
 * Uses a centralized error normalization utility for consistent messaging.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: unknown): void {
    logError(error, "ErrorBoundary caught render/runtime error");
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  public render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const userFacing = toUserFacingError(this.state.error);

    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center p-4">
        <div className="max-w-lg w-full rounded-lg border bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">{userFacing.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{userFacing.message}</p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}


import { toast } from "sonner";

interface StartTaskParams {
  execute: () => void;
  successDelayMs: number;
  startMessage: string;
  successMessage: string;
}

function startTimedTask({
  execute,
  successDelayMs,
  startMessage,
  successMessage,
}: StartTaskParams) {
  toast.info(startMessage);
  execute();
  setTimeout(() => toast.success(successMessage), successDelayMs);
}

export const TaskService = {
  startDeployTask: (execute: () => void, successDelayMs: number) =>
    startTimedTask({
      execute,
      successDelayMs,
      startMessage: "Initializing robot systems...",
      successMessage: "Robot deployed successfully!",
    }),

  startStopTask: (execute: () => void, successDelayMs: number) =>
    startTimedTask({
      execute,
      successDelayMs,
      startMessage: "Robot returning to base...",
      successMessage: "Robot returned to base",
    }),
};

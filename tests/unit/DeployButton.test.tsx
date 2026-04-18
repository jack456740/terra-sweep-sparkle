import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DeployButton } from "@/components/DeployButton";
import { DEPLOY_STATE } from "@/lib/constants";

describe("DeployButton", () => {
  it("calls onDeploy when idle button is clicked", () => {
    const onDeploy = vi.fn();
    const onStop = vi.fn();

    render(
      <DeployButton
        state={DEPLOY_STATE.IDLE}
        onDeploy={onDeploy}
        onStop={onStop}
      />
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onDeploy).toHaveBeenCalledTimes(1);
    expect(onStop).not.toHaveBeenCalled();
  });

  it("calls onStop when deployed button is clicked", () => {
    const onDeploy = vi.fn();
    const onStop = vi.fn();

    render(
      <DeployButton
        state={DEPLOY_STATE.DEPLOYED}
        onDeploy={onDeploy}
        onStop={onStop}
      />
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onDeploy).not.toHaveBeenCalled();
  });
});

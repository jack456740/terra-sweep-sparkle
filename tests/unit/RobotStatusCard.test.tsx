import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RobotStatusCard } from "@/components/RobotStatusCard";
import { ROBOT_STATUS } from "@/lib/constants";

describe("RobotStatusCard", () => {
  it("shows connected state for cleaning robot", () => {
    render(<RobotStatusCard status={ROBOT_STATUS.CLEANING} location="Main Area" />);

    expect(screen.getByText("Cleaning")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByText("Main Area")).toBeInTheDocument();
  });

  it("shows disconnected state for offline robot", () => {
    render(<RobotStatusCard status={ROBOT_STATUS.OFFLINE} />);

    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(screen.getByText("Disconnected")).toBeInTheDocument();
  });
});

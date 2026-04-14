import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BatteryIndicator } from "@/components/BatteryIndicator";

describe("BatteryIndicator", () => {
  it("renders battery percentage and remaining time", () => {
    render(<BatteryIndicator percentage={80} />);

    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText(/min remaining/i)).toBeInTheDocument();
  });

  it("renders charging status when charging", () => {
    render(<BatteryIndicator percentage={40} isCharging />);

    expect(screen.getByText("Charging")).toBeInTheDocument();
    expect(screen.getByText(/min to full/i)).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CleaningProgress } from "@/components/CleaningProgress";

describe("CleaningProgress", () => {
  it("renders progress and computed area", () => {
    render(<CleaningProgress progress={50} isActive={false} totalArea={500} />);

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("250 / 500 m² cleaned")).toBeInTheDocument();
    expect(screen.getByText("Not started")).toBeInTheDocument();
  });

  it("renders complete state at 100%", () => {
    render(<CleaningProgress progress={100} isActive={false} />);

    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});

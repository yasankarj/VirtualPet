import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatBar } from "../../src/components/StatBar";

describe("StatBar", () => {
  it("renders the label and value", () => {
    render(<StatBar label="Hunger" value={42} isDetrimental />);
    expect(screen.getByTestId("stat-bar-Hunger")).toHaveTextContent("Hunger: 42");
  });

  it("colors a high detrimental value as bad (red)", () => {
    render(<StatBar label="Hunger" value={90} isDetrimental />);
    const fill = screen.getByTestId("stat-bar-Hunger").querySelector(".stat-bar-fill");
    expect(fill).toHaveStyle({ backgroundColor: "rgb(244, 67, 54)" });
  });

  it("colors a high beneficial value as good (green)", () => {
    render(<StatBar label="Happiness" value={90} isDetrimental={false} />);
    const fill = screen.getByTestId("stat-bar-Happiness").querySelector(".stat-bar-fill");
    expect(fill).toHaveStyle({ backgroundColor: "rgb(76, 175, 80)" });
  });
});

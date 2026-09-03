import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PetDisplay } from "../../src/components/PetDisplay";

describe("PetDisplay", () => {
  it("renders the label matching the given mood", () => {
    render(<PetDisplay mood="SICK" />);
    expect(screen.getByTestId("pet-display")).toHaveTextContent("Sick");
  });

  it("renders a different label for a different mood", () => {
    render(<PetDisplay mood="HAPPY" />);
    expect(screen.getByTestId("pet-display")).toHaveTextContent("Happy");
  });
});

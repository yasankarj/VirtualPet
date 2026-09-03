import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PetDisplay } from "../../src/components/PetDisplay";

describe("PetDisplay", () => {
  it("renders the label matching the given mood", () => {
    render(<PetDisplay name="Rex" mood="SICK" onRenameClick={() => {}} />);
    expect(screen.getByTestId("pet-display")).toHaveTextContent("Sick");
  });

  it("renders a different label for a different mood", () => {
    render(<PetDisplay name="Rex" mood="HAPPY" onRenameClick={() => {}} />);
    expect(screen.getByTestId("pet-display")).toHaveTextContent("Happy");
  });

  it("renders the pet's name", () => {
    render(<PetDisplay name="Rex" mood="NEUTRAL" onRenameClick={() => {}} />);
    expect(screen.getByTestId("pet-display-name")).toHaveTextContent("Rex");
  });

  it("fires onRenameClick when the rename button is clicked", async () => {
    const onRenameClick = vi.fn();
    render(<PetDisplay name="Rex" mood="NEUTRAL" onRenameClick={onRenameClick} />);
    await userEvent.click(screen.getByTestId("pet-display-rename-button"));
    expect(onRenameClick).toHaveBeenCalledOnce();
  });
});

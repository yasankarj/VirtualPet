import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { FEED_HUNGER_DELTA, NEW_PET_STARTING_STATS } from "../src/domain/constants";
import { createNewPet } from "../src/domain/factory";
import { saveState } from "../src/domain/persistence";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    // Seed an already-saved pet so the first-launch naming prompt (Refresh/Naming FR-NR3) doesn't
    // appear — these tests predate naming and are about stat/action behavior, not naming.
    saveState(createNewPet());
  });

  it("shows the default new-pet stats when nothing is saved", () => {
    render(<App />);
    expect(screen.getByTestId("stat-bar-Hunger")).toHaveTextContent(
      `Hunger: ${NEW_PET_STARTING_STATS.hunger}`,
    );
    expect(screen.getByTestId("stat-bar-Happiness")).toHaveTextContent(
      `Happiness: ${NEW_PET_STARTING_STATS.happiness}`,
    );
  });

  it("updates the Hunger stat display after clicking Feed", async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId("action-panel-feed-button"));
    expect(screen.getByTestId("stat-bar-Hunger")).toHaveTextContent(
      `Hunger: ${Math.max(0, NEW_PET_STARTING_STATS.hunger + FEED_HUNGER_DELTA)}`,
    );
  });
});

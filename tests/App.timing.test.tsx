import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import App from "../src/App";
import { TICK_INTERVAL_MS } from "../src/domain/constants";

/**
 * Decay Pacing FR-DP1: the tick timer restarts on every player action, so the next tick
 * always lands a full TICK_INTERVAL_MS after the most recent action - never sooner.
 *
 * Uses native `.click()` (not `userEvent`) inside `act()` so fake timers stay under our
 * control - `userEvent` schedules its own real-time delays internally, which conflicts
 * with `vi.useFakeTimers()`.
 */
describe("App tick scheduling", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("restarts the tick timer on Feed - the cooldown display only advances a full TICK_INTERVAL_MS after the click, not sooner", () => {
    render(<App />);

    // Let the original mount-time interval run partway through its first window, so a tick
    // would otherwise be due soon if the click below didn't restart the clock.
    act(() => {
      vi.advanceTimersByTime(700);
    });

    act(() => {
      screen.getByTestId("action-panel-feed-button").click();
    });
    expect(screen.getByTestId("action-panel-feed-button")).toHaveTextContent("Feed (3s)");

    // If the clock were NOT restarted, the pre-existing interval would fire ~300ms after
    // this click (at the 1000ms mark from mount), ticking the cooldown down too early.
    act(() => {
      vi.advanceTimersByTime(TICK_INTERVAL_MS - 100);
    });
    expect(screen.getByTestId("action-panel-feed-button")).toHaveTextContent("Feed (3s)");

    // Exactly one TICK_INTERVAL_MS after the click, the restarted timer fires its first tick.
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId("action-panel-feed-button")).toHaveTextContent("Feed (2s)");
  });
});

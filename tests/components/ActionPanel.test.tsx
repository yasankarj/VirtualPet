import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionPanel } from "../../src/components/ActionPanel";

function renderPanel(overrides: Partial<React.ComponentProps<typeof ActionPanel>> = {}) {
  const onFeed = vi.fn();
  const onPlay = vi.fn();
  const onRest = vi.fn();
  render(
    <ActionPanel
      onFeed={onFeed}
      onPlay={onPlay}
      onRest={onRest}
      feedRemainingMs={0}
      playRemainingMs={0}
      isResting={false}
      restRemainingMs={0}
      {...overrides}
    />,
  );
  return { onFeed, onPlay, onRest };
}

describe("ActionPanel", () => {
  it("fires the callback when an enabled button is clicked", async () => {
    const { onFeed } = renderPanel();
    await userEvent.click(screen.getByTestId("action-panel-feed-button"));
    expect(onFeed).toHaveBeenCalledOnce();
  });

  it("disables Feed and shows a countdown while on cooldown", () => {
    renderPanel({ feedRemainingMs: 3000 });
    const button = screen.getByTestId("action-panel-feed-button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Feed (3s)");
  });

  it("disables Play and shows a countdown while on cooldown", () => {
    renderPanel({ playRemainingMs: 4000 });
    const button = screen.getByTestId("action-panel-play-button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Play (4s)");
  });

  it("disables Feed and Play while resting, and shows the sleep countdown on Rest", () => {
    renderPanel({ isResting: true, restRemainingMs: 7000 });
    expect(screen.getByTestId("action-panel-feed-button")).toBeDisabled();
    expect(screen.getByTestId("action-panel-play-button")).toBeDisabled();
    const restButton = screen.getByTestId("action-panel-rest-button");
    expect(restButton).toBeDisabled();
    expect(restButton).toHaveTextContent("Sleeping... 7s");
  });
});

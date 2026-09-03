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
      isResting={false}
      restRemainingMs={0}
      hunger={50}
      happiness={50}
      energy={50}
      health={50}
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

  it("disables Feed and Play while resting, and shows the sleep countdown on Rest", () => {
    renderPanel({ isResting: true, restRemainingMs: 7000 });
    expect(screen.getByTestId("action-panel-feed-button")).toBeDisabled();
    expect(screen.getByTestId("action-panel-play-button")).toBeDisabled();
    const restButton = screen.getByTestId("action-panel-rest-button");
    expect(restButton).toBeDisabled();
    expect(restButton).toHaveTextContent("Sleeping... 7s");
  });

  it("disables Feed once hunger has reached 0", () => {
    renderPanel({ hunger: 0 });
    expect(screen.getByTestId("action-panel-feed-button")).toBeDisabled();
  });

  it("disables Play once happiness has reached 100", () => {
    renderPanel({ happiness: 100 });
    expect(screen.getByTestId("action-panel-play-button")).toBeDisabled();
  });

  it("disables Play once energy has reached 0", () => {
    renderPanel({ energy: 0 });
    expect(screen.getByTestId("action-panel-play-button")).toBeDisabled();
  });

  it("disables Play once health has reached 0", () => {
    renderPanel({ health: 0 });
    expect(screen.getByTestId("action-panel-play-button")).toBeDisabled();
  });
});

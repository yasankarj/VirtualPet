import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App";
import { DEFAULT_PET_NAME, NEW_PET_STARTING_STATS } from "../src/domain/constants";
import { createNewPet } from "../src/domain/factory";
import { applyFeed } from "../src/domain/rules";
import { saveState } from "../src/domain/persistence";

describe("App - first-launch naming", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the naming prompt on a genuinely first launch", () => {
    render(<App />);
    expect(screen.getByTestId("name-dialog")).toBeInTheDocument();
  });

  it("skipping (close button) assigns the default name and does not reappear on the next mount", async () => {
    const { unmount } = render(<App />);
    await userEvent.click(screen.getByTestId("name-dialog-close-button"));
    expect(screen.queryByTestId("name-dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("pet-display-name")).toHaveTextContent(DEFAULT_PET_NAME);

    unmount();
    render(<App />);
    expect(screen.queryByTestId("name-dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("pet-display-name")).toHaveTextContent(DEFAULT_PET_NAME);
  });

  it("saving a valid name sets it and persists it across a remount", async () => {
    const { unmount } = render(<App />);
    await userEvent.type(screen.getByTestId("name-dialog-input"), "Rex");
    await userEvent.click(screen.getByTestId("name-dialog-save-button"));
    expect(screen.queryByTestId("name-dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("pet-display-name")).toHaveTextContent("Rex");

    unmount();
    render(<App />);
    expect(screen.queryByTestId("name-dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("pet-display-name")).toHaveTextContent("Rex");
  });

  it("submitting an empty name shows an inline error and keeps the prompt open", async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId("name-dialog-save-button"));
    expect(screen.getByTestId("name-dialog-error")).toBeInTheDocument();
    expect(screen.getByTestId("name-dialog")).toBeInTheDocument();
  });

  it("does not show the naming prompt when a pet was already saved", () => {
    saveState(createNewPet("Rex"));
    render(<App />);
    expect(screen.queryByTestId("name-dialog")).not.toBeInTheDocument();
  });
});

describe("App - rename", () => {
  beforeEach(() => {
    localStorage.clear();
    saveState(createNewPet("Rex"));
  });

  it("opens the rename dialog pre-filled with the current name", async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId("pet-display-rename-button"));
    expect(screen.getByTestId("name-dialog-input")).toHaveValue("Rex");
  });

  it("cancel leaves the name unchanged", async () => {
    render(<App />);
    await userEvent.click(screen.getByTestId("pet-display-rename-button"));
    await userEvent.clear(screen.getByTestId("name-dialog-input"));
    await userEvent.type(screen.getByTestId("name-dialog-input"), "Ignored");
    await userEvent.click(screen.getByTestId("name-dialog-close-button"));
    expect(screen.queryByTestId("name-dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("pet-display-name")).toHaveTextContent("Rex");
  });

  it("saving a new valid name updates and persists it", async () => {
    const { unmount } = render(<App />);
    await userEvent.click(screen.getByTestId("pet-display-rename-button"));
    await userEvent.clear(screen.getByTestId("name-dialog-input"));
    await userEvent.type(screen.getByTestId("name-dialog-input"), "Buddy");
    await userEvent.click(screen.getByTestId("name-dialog-save-button"));
    expect(screen.getByTestId("pet-display-name")).toHaveTextContent("Buddy");

    unmount();
    render(<App />);
    expect(screen.getByTestId("pet-display-name")).toHaveTextContent("Buddy");
  });
});

describe("App - refresh", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("immediately resets stats and cooldowns while preserving the name, with no confirmation dialog", async () => {
    const fedPet = applyFeed(createNewPet("Rex"));
    saveState(fedPet);
    render(<App />);
    expect(screen.getByTestId("action-panel-feed-button")).toBeDisabled();

    await userEvent.click(screen.getByTestId("refresh-button"));

    expect(screen.queryByTestId("name-dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("pet-display-name")).toHaveTextContent("Rex");
    expect(screen.getByTestId("stat-bar-Hunger")).toHaveTextContent(
      `Hunger: ${NEW_PET_STARTING_STATS.hunger}`,
    );
    expect(screen.getByTestId("action-panel-feed-button")).not.toBeDisabled();
  });
});

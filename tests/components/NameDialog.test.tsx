import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NameDialog } from "../../src/components/NameDialog";
import { MAX_PET_NAME_LENGTH } from "../../src/domain/constants";

describe("NameDialog", () => {
  it("renders the initial-naming heading and an empty input", () => {
    render(<NameDialog mode="initial" onSave={() => {}} onDismiss={() => {}} />);
    expect(screen.getByTestId("name-dialog")).toHaveTextContent("Name Your Pet");
    expect(screen.getByTestId("name-dialog-input")).toHaveValue("");
    expect(screen.getByTestId("name-dialog-save-button")).toHaveTextContent("Start!");
  });

  it("renders the rename heading with the input pre-filled from currentName", () => {
    render(<NameDialog mode="rename" currentName="Rex" onSave={() => {}} onDismiss={() => {}} />);
    expect(screen.getByTestId("name-dialog")).toHaveTextContent("Rename Rex");
    expect(screen.getByTestId("name-dialog-input")).toHaveValue("Rex");
    expect(screen.getByTestId("name-dialog-save-button")).toHaveTextContent("Save");
  });

  it("calls onSave with the trimmed name when a valid name is submitted", async () => {
    const onSave = vi.fn();
    render(<NameDialog mode="initial" onSave={onSave} onDismiss={() => {}} />);
    await userEvent.type(screen.getByTestId("name-dialog-input"), "  Rex  ");
    await userEvent.click(screen.getByTestId("name-dialog-save-button"));
    expect(onSave).toHaveBeenCalledWith("Rex");
  });

  it("shows an inline error and does not call onSave when the name is empty", async () => {
    const onSave = vi.fn();
    render(<NameDialog mode="initial" onSave={onSave} onDismiss={() => {}} />);
    await userEvent.click(screen.getByTestId("name-dialog-save-button"));
    expect(screen.getByTestId("name-dialog-error")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("shows an inline error and does not call onSave when the name is whitespace-only", async () => {
    const onSave = vi.fn();
    render(<NameDialog mode="initial" onSave={onSave} onDismiss={() => {}} />);
    await userEvent.type(screen.getByTestId("name-dialog-input"), "   ");
    await userEvent.click(screen.getByTestId("name-dialog-save-button"));
    expect(screen.getByTestId("name-dialog-error")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not allow typing past MAX_PET_NAME_LENGTH characters", async () => {
    render(<NameDialog mode="initial" onSave={() => {}} onDismiss={() => {}} />);
    const input = screen.getByTestId("name-dialog-input");
    await userEvent.type(input, "a".repeat(MAX_PET_NAME_LENGTH + 10));
    expect(input).toHaveValue("a".repeat(MAX_PET_NAME_LENGTH));
  });

  it("calls onDismiss when the close button is clicked", async () => {
    const onDismiss = vi.fn();
    render(<NameDialog mode="initial" onSave={() => {}} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByTestId("name-dialog-close-button"));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

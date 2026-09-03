import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RefreshButton } from "../../src/components/RefreshButton";

describe("RefreshButton", () => {
  it("fires onRefresh when clicked", async () => {
    const onRefresh = vi.fn();
    render(<RefreshButton onRefresh={onRefresh} />);
    await userEvent.click(screen.getByTestId("refresh-button"));
    expect(onRefresh).toHaveBeenCalledOnce();
  });
});

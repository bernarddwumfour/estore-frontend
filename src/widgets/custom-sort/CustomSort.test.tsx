import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CustomSort, type SortConfig } from "./CustomSort";

const config: SortConfig = {
  options: [
    { value: "created_at", label: "Date" },
    { value: "name", label: "Name" },
  ],
  defaultSortBy: "created_at",
  defaultSortOrder: "desc",
};

describe("CustomSort", () => {
  it("starts with no pending changes and a disabled Apply button", () => {
    render(<CustomSort config={config} onSortChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /apply sort/i })).toBeDisabled();
    expect(screen.queryByText(/unsaved sort changes/i)).not.toBeInTheDocument();
  });

  it("marks changes and enables Apply after toggling sort order", async () => {
    render(<CustomSort config={config} onSortChange={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "↓" }));
    expect(screen.getByRole("button", { name: "↑" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apply sort/i })).toBeEnabled();
    expect(screen.getByText(/unsaved sort changes/i)).toBeInTheDocument();
  });

  it("fires onSortChange with applied values and clears the pending state", async () => {
    const onSortChange = vi.fn();
    render(<CustomSort config={config} onSortChange={onSortChange} />);
    await userEvent.click(screen.getByRole("button", { name: "↓" })); // -> asc
    await userEvent.click(screen.getByRole("button", { name: /apply sort/i }));
    expect(onSortChange).toHaveBeenCalledWith("created_at", "asc");
    expect(screen.getByRole("button", { name: /apply sort/i })).toBeDisabled();
  });

  it("shows a Reset button once a non-default sort is applied, and resets to defaults", async () => {
    const onSortChange = vi.fn();
    render(<CustomSort config={config} onSortChange={onSortChange} />);
    expect(screen.queryByRole("button", { name: /reset/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "↓" }));
    await userEvent.click(screen.getByRole("button", { name: /apply sort/i }));
    const reset = screen.getByRole("button", { name: /reset/i });
    expect(reset).toBeInTheDocument();

    await userEvent.click(reset);
    expect(onSortChange).toHaveBeenLastCalledWith("created_at", "desc");
    expect(screen.queryByRole("button", { name: /reset/i })).not.toBeInTheDocument();
  });
});

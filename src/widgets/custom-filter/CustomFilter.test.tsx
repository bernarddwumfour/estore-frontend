import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CustomFilter, type FilterConfig } from "./CustomFilter";

const config: FilterConfig = {
  searchPlaceholder: "Search orders...",
  fields: [
    { name: "ref", type: "text", placeholder: "Reference" },
    {
      name: "status",
      type: "select",
      placeholder: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "paused", label: "Paused" },
      ],
    },
  ],
};

describe("CustomFilter", () => {
  it("renders the search box and configured fields", () => {
    render(<CustomFilter config={config} filters={{}} onFilterChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search orders...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Reference")).toBeInTheDocument();
  });

  it("keeps Apply disabled until something changes", () => {
    render(<CustomFilter config={config} filters={{}} onFilterChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /apply filters/i })).toBeDisabled();
  });

  it("enables Apply and surfaces the unsaved hint after editing a field", async () => {
    render(<CustomFilter config={config} filters={{}} onFilterChange={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText("Reference"), "ABC");
    expect(screen.getByRole("button", { name: /apply filters/i })).toBeEnabled();
    expect(screen.getByText(/unsaved filter changes/i)).toBeInTheDocument();
  });

  it("applies filters with the merged search value", async () => {
    const onFilterChange = vi.fn();
    render(<CustomFilter config={config} filters={{}} onFilterChange={onFilterChange} />);
    await userEvent.type(screen.getByPlaceholderText("Reference"), "X");
    await userEvent.click(screen.getByRole("button", { name: /apply filters/i }));
    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(onFilterChange.mock.calls[0][0]).toMatchObject({ ref: "X", search: "" });
  });

  it("shows a Clear button with the active filter count and resets", async () => {
    const onFilterChange = vi.fn();
    const onReset = vi.fn();
    render(
      <CustomFilter
        config={config}
        filters={{ status: "active" }}
        onFilterChange={onFilterChange}
        onReset={onReset}
      />
    );
    const clear = screen.getByRole("button", { name: /clear/i });
    expect(clear).toBeInTheDocument();
    await userEvent.click(clear);
    expect(onReset).toHaveBeenCalledOnce();
    // reset clears all field values
    expect(onFilterChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "", ref: "", search: "" })
    );
  });
});

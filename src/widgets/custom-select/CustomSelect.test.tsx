import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CustomSelect, type selectField } from "./CustomSelect";

const items: selectField[] = [
  { id: 1, label: "Active", value: "active" },
  { id: 2, label: "Draft", value: "draft" },
];

describe("CustomSelect", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<CustomSelect items={items} placeholder="Pick status" />);
    expect(screen.getByText("Pick status")).toBeInTheDocument();
  });

  it("falls back to a default placeholder", () => {
    render(<CustomSelect items={items} />);
    expect(screen.getByText("Select an option")).toBeInTheDocument();
  });

  it("reflects the currently selected value", () => {
    render(
      <CustomSelect
        items={items}
        selectField={{ id: 1, label: "Active", value: "active" }}
      />
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("calls onValueChange with the full selected item", async () => {
    const onValueChange = vi.fn();
    render(<CustomSelect items={items} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "Draft" }));
    expect(onValueChange).toHaveBeenCalledWith({ id: 2, label: "Draft", value: "draft" });
  });

  it("falls back to setSelectField when onValueChange is not provided", async () => {
    const setSelectField = vi.fn();
    render(<CustomSelect items={items} setSelectField={setSelectField} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "Active" }));
    expect(setSelectField).toHaveBeenCalledWith({ id: 1, label: "Active", value: "active" });
  });
});

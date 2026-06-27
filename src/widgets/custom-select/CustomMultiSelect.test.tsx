import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CustomMultiSelect, type selectField } from "./CustomMultiSelect";

const items: selectField[] = [
  { id: 1, label: "Red", value: "red" },
  { id: 2, label: "Green", value: "green" },
  { id: 3, label: "Blue", value: "blue" },
  { id: 4, label: "Black", value: "black" },
];

describe("CustomMultiSelect", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(
      <CustomMultiSelect
        selectField={[]}
        setSelectField={vi.fn()}
        items={items}
        placeholder="Pick colours"
      />
    );
    expect(screen.getByText("Pick colours")).toBeInTheDocument();
  });

  it("renders selected items as badges up to maxCount with an overflow badge", () => {
    render(
      <CustomMultiSelect
        selectField={items}
        setSelectField={vi.fn()}
        items={items}
        maxCount={2}
      />
    );
    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Green")).toBeInTheDocument();
    // Blue/Black collapse into a "+2 more" badge
    expect(screen.getByText("+ 2 more")).toBeInTheDocument();
    expect(screen.queryByText("Blue")).not.toBeInTheDocument();
  });

  it("clears all selections via the clear button", async () => {
    const setSelectField = vi.fn();
    render(
      <CustomMultiSelect
        selectField={[items[0]]}
        setSelectField={setSelectField}
        items={items}
      />
    );
    // The trigger renders an X clear button alongside the badge.
    const buttons = screen.getAllByRole("button");
    // Last small button in the trigger is the clear-all control.
    await userEvent.click(buttons[buttons.length - 1]);
    expect(setSelectField).toHaveBeenCalledWith([]);
  });

  it("adds an option when picked from the open list (multiple mode)", async () => {
    const setSelectField = vi.fn();
    render(
      <CustomMultiSelect selectField={[]} setSelectField={setSelectField} items={items} />
    );
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(await screen.findByText("Green"));
    expect(setSelectField).toHaveBeenCalledWith([items[1]]);
  });

  it("replaces selection and does not render checkboxes in single mode", async () => {
    const setSelectField = vi.fn();
    render(
      <CustomMultiSelect
        selectField={[]}
        setSelectField={setSelectField}
        items={items}
        allowMultiple={false}
      />
    );
    await userEvent.click(screen.getByRole("button"));
    // No "(Select All)" entry in single mode
    expect(screen.queryByText("(Select All)")).not.toBeInTheDocument();
    await userEvent.click(await screen.findByText("Blue"));
    expect(setSelectField).toHaveBeenCalledWith([items[2]]);
  });

  it("is not interactive when disabled", () => {
    render(
      <CustomMultiSelect
        selectField={[]}
        setSelectField={vi.fn()}
        items={items}
        disabled
      />
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

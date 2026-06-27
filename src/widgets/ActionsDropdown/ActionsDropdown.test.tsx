import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Pencil, Trash2, Eye, Copy } from "lucide-react";
import { ActionsDropdown, type ActionItem } from "./ActionsDropdown";

function action(label: string, overrides: Partial<ActionItem> = {}): ActionItem {
  return { label, icon: <Pencil />, onClick: vi.fn(), ...overrides };
}

describe("ActionsDropdown", () => {
  it("renders nothing when there are no actions", () => {
    const { container } = render(<ActionsDropdown actions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders visible actions and fires their onClick", async () => {
    const onClick = vi.fn();
    const actions = [action("Edit", { onClick, icon: <Pencil /> })];
    render(<ActionsDropdown actions={actions} />);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("shows labels when showLabels is set", () => {
    render(<ActionsDropdown actions={[action("Duplicate", { icon: <Copy /> })]} showLabels />);
    expect(screen.getByText("Duplicate")).toBeInTheDocument();
  });

  it("disables an action and prevents its onClick", async () => {
    const onClick = vi.fn();
    render(<ActionsDropdown actions={[action("View", { onClick, disabled: true, icon: <Eye /> })]} />);
    const btn = screen.getByRole("button", { name: /view/i });
    expect(btn).toBeDisabled();
    await userEvent.click(btn).catch(() => {});
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders a spinner and disables a loading action", () => {
    const { container } = render(
      <ActionsDropdown actions={[action("Save", { loading: true })]} />
    );
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("collapses overflow actions into a dropdown and fires the chosen one", async () => {
    const onDelete = vi.fn();
    const actions = [
      action("Edit", { icon: <Pencil /> }),
      action("View", { icon: <Eye /> }),
      action("Copy", { icon: <Copy /> }),
      action("Delete", { icon: <Trash2 />, onClick: onDelete, variant: "destructive" }),
    ];
    render(<ActionsDropdown actions={actions} maxVisible={3} />);

    // 4th action is not directly visible; it lives behind the overflow trigger.
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
    const triggers = screen.getAllByRole("button");
    await userEvent.click(triggers[triggers.length - 1]); // overflow "More" trigger
    await userEvent.click(await screen.findByRole("menuitem", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledOnce();
  });
});

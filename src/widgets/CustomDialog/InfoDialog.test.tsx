import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { InfoDialog } from "./InfoDialog";

describe("InfoDialog", () => {
  it("renders the message and default button labels when open", () => {
    render(<InfoDialog open infoMessage="Are you sure?" onOpenChange={vi.fn()} />);
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("renders custom button labels", () => {
    render(
      <InfoDialog
        open
        infoMessage="Delete this?"
        primaryButtonText="Delete"
        secondaryButtonText="Keep"
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument();
  });

  it("invokes primary and secondary actions", async () => {
    const primaryAction = vi.fn();
    const secondaryAction = vi.fn();
    render(
      <InfoDialog
        open
        infoMessage="Confirm?"
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        onOpenChange={vi.fn()}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(primaryAction).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(secondaryAction).toHaveBeenCalledOnce();
  });

  it("calls handleClose from the close icon", async () => {
    const handleClose = vi.fn();
    render(
      <InfoDialog open infoMessage="x" handleClose={handleClose} onOpenChange={vi.fn()} />
    );
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(handleClose).toHaveBeenCalledOnce();
  });
});

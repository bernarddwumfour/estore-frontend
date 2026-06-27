import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CustomDialog } from "./CustomDialog";

describe("CustomDialog", () => {
  it("does not render content while closed", () => {
    render(
      <CustomDialog title="Edit" open={false} onOpenChange={vi.fn()}>
        <p>Body content</p>
      </CustomDialog>
    );
    expect(screen.queryByText("Body content")).not.toBeInTheDocument();
  });

  it("renders title, description and children when open", () => {
    render(
      <CustomDialog title="Edit Product" description="Update fields" open onOpenChange={vi.fn()}>
        <p>Body content</p>
      </CustomDialog>
    );
    expect(screen.getByText("Edit Product")).toBeInTheDocument();
    expect(screen.getByText("Update fields")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("requests close when the close button is clicked", async () => {
    const onOpenChange = vi.fn();
    render(
      <CustomDialog title="Edit" open onOpenChange={onOpenChange}>
        <p>Body</p>
      </CustomDialog>
    );
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

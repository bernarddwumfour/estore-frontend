import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CustomSheet } from "./CustomSheet";

describe("CustomSheet", () => {
  it("hides content while closed", () => {
    render(
      <CustomSheet title="Filters" open={false} onOpenChange={vi.fn()}>
        <p>Sheet body</p>
      </CustomSheet>
    );
    expect(screen.queryByText("Sheet body")).not.toBeInTheDocument();
  });

  it("renders title, description and children when open", () => {
    render(
      <CustomSheet title="Filters" description="Narrow results" open onOpenChange={vi.fn()}>
        <p>Sheet body</p>
      </CustomSheet>
    );
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Narrow results")).toBeInTheDocument();
    expect(screen.getByText("Sheet body")).toBeInTheDocument();
  });

  it("requests close from the close button", async () => {
    const onOpenChange = vi.fn();
    render(
      <CustomSheet title="Filters" open onOpenChange={onOpenChange}>
        <p>Body</p>
      </CustomSheet>
    );
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge, badgeVariants } from "./Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies the default variant when none is given", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toHaveClass("bg-primary");
  });

  it("applies an extended variant class", () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText("Active")).toHaveClass("bg-green-500");
  });

  it("merges a caller-supplied className", () => {
    render(<Badge className="custom-x">Tagged</Badge>);
    expect(screen.getByText("Tagged")).toHaveClass("custom-x");
  });

  it("forwards arbitrary HTML props", () => {
    render(<Badge data-testid="b" title="hello">X</Badge>);
    expect(screen.getByTestId("b")).toHaveAttribute("title", "hello");
  });

  it("exposes badgeVariants as a class generator", () => {
    expect(badgeVariants({ variant: "warning" })).toContain("bg-yellow-500");
  });
});

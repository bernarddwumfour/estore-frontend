import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Spinner from "./Spinner";

describe("Spinner", () => {
  it("renders with a status role and accessible loading text", () => {
    render(<Spinner size="md" />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("applies the size class for each size", () => {
    const { rerender } = render(<Spinner size="sm" />);
    expect(screen.getByRole("status")).toHaveClass("w-4", "h-4");
    rerender(<Spinner size="md" />);
    expect(screen.getByRole("status")).toHaveClass("w-8", "h-8");
    rerender(<Spinner size="lg" />);
    expect(screen.getByRole("status")).toHaveClass("w-12", "h-12");
  });

  it("uses the primary border by default and white when requested", () => {
    const { rerender } = render(<Spinner size="md" />);
    expect(screen.getByRole("status")).toHaveClass("border-primary");
    rerender(<Spinner size="md" white />);
    expect(screen.getByRole("status")).toHaveClass("border-white");
  });
});

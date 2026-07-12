import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TableSkeleton } from "./TableSkeleton";

describe("TableSkeleton", () => {
  it("renders the skeleton scaffold", () => {
    const { container } = render(<TableSkeleton />);
    expect(container.firstChild).not.toBeNull();
    // animate-pulse wrapper signals the loading skeleton table.
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});

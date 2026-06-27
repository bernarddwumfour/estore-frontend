import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TableLoader from "./TableLoader";

describe("TableLoader", () => {
  it("renders skeleton placeholder elements", () => {
    const { container } = render(<TableLoader />);
    // A grid of skeletons should render plenty of placeholder divs.
    expect(container.querySelectorAll("div").length).toBeGreaterThan(10);
  });

  it("renders without crashing when a message prop is supplied", () => {
    // `message` is an accepted prop; component must not break when it is passed.
    const { container } = render(<TableLoader message="Loading orders" />);
    expect(container.firstChild).not.toBeNull();
  });
});

import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AnalyticsLoader from "./AnalyticsLoader";

describe("AnalyticsLoader", () => {
  it("renders a main region with skeleton placeholders", () => {
    const { container } = render(<AnalyticsLoader />);
    expect(container.querySelector("main")).toBeInTheDocument();
    expect(container.querySelectorAll("div").length).toBeGreaterThan(10);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DataDisplay } from "./DataDisplay";

describe("DataDisplay", () => {
  it("renders an empty state when there is no data", () => {
    render(<DataDisplay data={{}} />);
    expect(screen.getByText(/no metadata available/i)).toBeInTheDocument();
  });

  it("renders key/value pairs by default", () => {
    render(<DataDisplay data={{ name: "Widget", sku: "ABC" }} />);
    expect(screen.getByText("Widget")).toBeInTheDocument();
    expect(screen.getByText("ABC")).toBeInTheDocument();
  });

  it("omits excluded keys", () => {
    render(<DataDisplay data={{ name: "Widget", secret: "hidden" }} excludeKeys={["secret"]} />);
    expect(screen.getByText("Widget")).toBeInTheDocument();
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });

  it("renders a badge for configured values", () => {
    render(
      <DataDisplay data={{ status: "active" }} badges={{ status: { active: "emerald" } }} />
    );
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders an internal link without target and an external link with target=_blank", () => {
    const { rerender } = render(
      <DataDisplay data={{ ref: "X1" }} links={{ ref: () => "/orders/X1" }} />
    );
    const internal = screen.getByRole("link", { name: /X1/ });
    expect(internal).toHaveAttribute("href", "/orders/X1");
    expect(internal).not.toHaveAttribute("target", "_blank");

    rerender(<DataDisplay data={{ ref: "X1" }} links={{ ref: () => "https://ext.com/x" }} />);
    expect(screen.getByRole("link", { name: /X1/ })).toHaveAttribute("target", "_blank");
  });

  it("renders arrays as badges, collapsing past five entries", () => {
    render(<DataDisplay data={{ tags: ["a", "b", "c", "d", "e", "f", "g"] }} />);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("e")).toBeInTheDocument();
    // 6th and 7th collapse into a "+2" badge
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("renders objects as formatted JSON", () => {
    render(<DataDisplay data={{ meta: { a: 1 } }} />);
    expect(screen.getByText(/"a": 1/)).toBeInTheDocument();
  });

  it("renders a dash for null values", () => {
    render(<DataDisplay data={{ note: null }} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("uses a custom renderer when provided", () => {
    render(
      <DataDisplay
        data={{ price: 1000 }}
        customRenderers={{ price: (v) => <span>${v}</span> }}
      />
    );
    expect(screen.getByText("$1000")).toBeInTheDocument();
  });
});

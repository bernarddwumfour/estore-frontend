import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import { UnderConstruction } from "./UnderConstruction";

describe("UnderConstruction", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders default title and message", () => {
    render(<UnderConstruction />);
    expect(screen.getByText("Page Under Construction")).toBeInTheDocument();
    expect(screen.getByText(/working hard to bring you this feature/i)).toBeInTheDocument();
  });

  it("renders custom title and message", () => {
    render(<UnderConstruction title="Reports" message="Soon." />);
    expect(screen.getByText("Reports")).toBeInTheDocument();
    expect(screen.getByText("Soon.")).toBeInTheDocument();
  });

  it("shows estimated completion only when provided", () => {
    const { rerender } = render(<UnderConstruction />);
    expect(screen.queryByText(/Estimated completion/i)).not.toBeInTheDocument();
    rerender(<UnderConstruction estimatedCompletion="Q3 2026" />);
    expect(screen.getByText(/Estimated completion: Q3 2026/i)).toBeInTheDocument();
  });

  it("renders the features list only for the detailed variant", () => {
    const { rerender } = render(
      <UnderConstruction features={["Exports", "Webhooks"]} variant="default" />
    );
    // features are gated behind the 'detailed' variant
    expect(screen.queryByText("Exports")).not.toBeInTheDocument();
    rerender(<UnderConstruction features={["Exports", "Webhooks"]} variant="detailed" />);
    expect(screen.getByText("Exports")).toBeInTheDocument();
    expect(screen.getByText("Webhooks")).toBeInTheDocument();
  });

  it("calls window.history.back when the back button is clicked", async () => {
    const backSpy = vi.spyOn(window.history, "back").mockImplementation(() => {});
    render(<UnderConstruction />);
    await userEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(backSpy).toHaveBeenCalledOnce();
  });

  it("hides the back and home buttons when disabled", () => {
    render(<UnderConstruction showBackButton={false} showHomeButton={false} />);
    expect(screen.queryByRole("button", { name: /go back/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /go to dashboard/i })).not.toBeInTheDocument();
  });

  it("links the home button to the dashboard", () => {
    render(<UnderConstruction />);
    expect(screen.getByRole("link", { name: /go to dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard"
    );
  });
});

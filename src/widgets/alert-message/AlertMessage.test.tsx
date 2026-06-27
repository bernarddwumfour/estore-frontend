import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AlertMessage } from "./AlertMessage";

describe("AlertMessage", () => {
  it("renders the message text", () => {
    render(<AlertMessage variant="default" message="Heads up" />);
    expect(screen.getByText("Heads up")).toBeInTheDocument();
  });

  it("applies the error colour for the error variant", () => {
    render(<AlertMessage variant="error" message="Something failed" />);
    expect(screen.getByText("Something failed")).toHaveClass("text-red-400");
  });

  it("applies the success colour for the success variant", () => {
    render(<AlertMessage variant="success" message="Saved" />);
    expect(screen.getByText("Saved")).toHaveClass("text-green-400");
  });

  it("applies the info colour for the info variant", () => {
    render(<AlertMessage variant="info" message="FYI" />);
    expect(screen.getByText("FYI")).toHaveClass("text-blue-400");
  });
});

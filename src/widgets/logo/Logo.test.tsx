import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Logo from "./Logo";

describe("Logo", () => {
  it("renders a link pointing to the home page", () => {
    render(<Logo />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders the brand mark text", () => {
    render(<Logo />);
    expect(screen.getByText("iP")).toBeInTheDocument();
  });
});

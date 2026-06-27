import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders the current year in the copyright line", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(
      screen.getByText((content) => content.includes(year) && content.includes("iPlug"))
    ).toBeInTheDocument();
  });

  it("links to key navigation pages", () => {
    render(<Footer />);
    const hrefs = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(
      expect.arrayContaining(["/", "/collections", "/about", "/privacy-policy"])
    );
  });
});

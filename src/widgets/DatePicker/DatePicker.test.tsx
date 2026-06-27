import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { format } from "date-fns";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  it("shows the placeholder when no date is selected", () => {
    render(<DatePicker setDate={vi.fn()} placeholder="Choose a day" />);
    expect(screen.getByText("Choose a day")).toBeInTheDocument();
  });

  it("uses the default placeholder when none is given", () => {
    render(<DatePicker setDate={vi.fn()} />);
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
  });

  it("renders the selected date formatted as PPP", () => {
    const date = new Date(2026, 0, 15);
    render(<DatePicker date={date} setDate={vi.fn()} />);
    expect(screen.getByText(format(date, "PPP"))).toBeInTheDocument();
  });
});

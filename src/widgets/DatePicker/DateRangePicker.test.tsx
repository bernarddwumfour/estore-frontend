import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DateRangePicker } from "./DateRangePicker";

describe("DateRangePicker", () => {
  it("shows the placeholder when no range is set", () => {
    render(<DateRangePicker setDate={vi.fn()} placeholder="Choose range" />);
    expect(screen.getByText("Choose range")).toBeInTheDocument();
  });

  it("shows an open-ended range when only 'from' is set", () => {
    render(
      <DateRangePicker date={{ from: new Date(2026, 0, 1), to: undefined }} setDate={vi.fn()} />
    );
    expect(screen.getByText(/Jan 1, 2026 - \.\.\./)).toBeInTheDocument();
  });

  it("shows the full range when both 'from' and 'to' are set", () => {
    render(
      <DateRangePicker
        date={{ from: new Date(2026, 0, 1), to: new Date(2026, 0, 31) }}
        setDate={vi.fn()}
      />
    );
    expect(screen.getByText("Jan 1, 2026 - Jan 31, 2026")).toBeInTheDocument();
  });
});

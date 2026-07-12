import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CustomPagination, type PaginationMeta } from "./CustomPagination";

function meta(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
  return {
    current_page: 1,
    per_page: 10,
    total: 100,
    total_pages: 10,
    has_next: true,
    has_previous: false,
    next_page: 2,
    previous_page: null,
    start_index: 1,
    end_index: 10,
    ...overrides,
  };
}

describe("CustomPagination", () => {
  it("renders nothing when there are no results", () => {
    const { container } = render(
      <CustomPagination pagination={meta({ total: 0 })} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows the results summary numbers", () => {
    render(
      <CustomPagination
        pagination={meta({ start_index: 11, end_index: 20, total: 57 })}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("57")).toBeInTheDocument();
  });

  it("calls onPageChange with the clicked page number", async () => {
    const onPageChange = vi.fn();
    render(<CustomPagination pagination={meta()} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("disables previous/first controls on the first page", () => {
    render(
      <CustomPagination
        pagination={meta({ current_page: 1, has_previous: false })}
        onPageChange={vi.fn()}
      />
    );
    // The two leading icon-only buttons are first-page and previous-page.
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it("disables next/last controls on the last page", () => {
    const buttons = render(
      <CustomPagination
        pagination={meta({
          current_page: 10,
          has_next: false,
          has_previous: true,
          next_page: null,
          previous_page: 9,
        })}
        onPageChange={vi.fn()}
      />
    ).getAllByRole("button");
    // The two trailing icon-only buttons are next-page and last-page.
    expect(buttons[buttons.length - 1]).toBeDisabled();
    expect(buttons[buttons.length - 2]).toBeDisabled();
  });

  it("shows all pages without an ellipsis when total_pages is small", () => {
    render(
      <CustomPagination
        pagination={meta({ total_pages: 4, total: 40 })}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.queryByText("...")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
  });

  it("collapses the middle with an ellipsis for many pages", () => {
    render(
      <CustomPagination
        pagination={meta({ current_page: 1, total_pages: 20, total: 200 })}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getAllByText("...").length).toBeGreaterThan(0);
    // First and last pages are always reachable.
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "20" })).toBeInTheDocument();
  });
});


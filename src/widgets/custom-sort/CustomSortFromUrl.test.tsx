import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CustomSortFromUrl, type SortConfig } from "./CustomSortFromUrl";

const push = vi.fn();
let currentParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/dashboard/products",
  useSearchParams: () => currentParams,
}));

const config: SortConfig = {
  options: [
    { value: "created_at", label: "Date" },
    { value: "name", label: "Name" },
  ],
  defaultSortBy: "created_at",
  defaultSortOrder: "desc",
};

describe("CustomSortFromUrl", () => {
  beforeEach(() => {
    push.mockClear();
    currentParams = new URLSearchParams();
  });

  it("initialises the sort order from the URL params", () => {
    currentParams = new URLSearchParams("sort_by=name&sort_order=asc");
    render(<CustomSortFromUrl config={config} />);
    // order toggle reflects 'asc' from the URL
    expect(screen.getByRole("button", { name: "↑" })).toBeInTheDocument();
  });

  it("pushes a URL with the new sort params and resets page to 1 on apply", async () => {
    render(<CustomSortFromUrl config={config} />);
    await userEvent.click(screen.getByRole("button", { name: "↓" })); // toggle to asc
    await userEvent.click(screen.getByRole("button", { name: /apply sort/i }));

    expect(push).toHaveBeenCalledTimes(1);
    const url = push.mock.calls[0][0] as string;
    expect(url).toContain("/dashboard/products?");
    expect(url).toContain("sort_by=created_at");
    expect(url).toContain("sort_order=asc");
    expect(url).toContain("page=1");
  });

  it("honours the urlParamPrefix when building params", async () => {
    render(<CustomSortFromUrl config={{ ...config, urlParamPrefix: "orders" }} />);
    await userEvent.click(screen.getByRole("button", { name: "↓" }));
    await userEvent.click(screen.getByRole("button", { name: /apply sort/i }));

    const url = push.mock.calls[0][0] as string;
    expect(url).toContain("orders_sort_by=created_at");
    expect(url).toContain("orders_sort_order=asc");
  });

  it("calls the optional onSortChange callback on apply", async () => {
    const onSortChange = vi.fn();
    render(<CustomSortFromUrl config={config} onSortChange={onSortChange} />);
    await userEvent.click(screen.getByRole("button", { name: "↓" }));
    await userEvent.click(screen.getByRole("button", { name: /apply sort/i }));
    expect(onSortChange).toHaveBeenCalledWith("created_at", "asc");
  });
});

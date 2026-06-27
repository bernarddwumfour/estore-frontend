import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Categories from "./Categories";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, jsx-a11y/alt-text
  default: (props: any) => <img {...props} />,
}));

const categories = [
  { id: "1", name: "Phones", slug: "phones", image: "/phones.png", is_active: true, product_count: 3 },
  { id: "2", name: "Laptops", slug: "laptops", image: "/laptops.png", is_active: true, product_count: 5 },
];

function mockFetch(payload: unknown, ok = true, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => payload,
  }) as unknown as typeof fetch;
}

describe("Categories (async server component)", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders category links in badge mode", async () => {
    mockFetch({ success: true, data: { categories } });
    render(await Categories({ type: "badge", searchParams: {} }));
    expect(screen.getByText("Phones")).toBeInTheDocument();
    expect(screen.getByText("Laptops")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("points each category to its filtered products URL", async () => {
    mockFetch({ success: true, data: { categories } });
    render(await Categories({ type: "badge", searchParams: {} }));
    const phones = screen.getByText("Phones").closest("a");
    expect(phones).toHaveAttribute("href", "/products?category=phones");
  });

  it("shows an empty state when there are no categories", async () => {
    mockFetch({ success: true, data: { categories: [] } });
    render(await Categories({ type: "badge", searchParams: {} }));
    expect(screen.getByText(/no categories available/i)).toBeInTheDocument();
  });

  it("shows an error state when the fetch fails", async () => {
    mockFetch({}, false, 500);
    render(await Categories({ type: "withImage", searchParams: {} }));
    expect(screen.getByText(/failed to load categories/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

// AdvancedFilters is imported but only used in commented-out markup; stub it
// so the heavy filter module isn't pulled into this test.
vi.mock("../advanced-filters/AdvancedFilters", () => ({ AdvancedFilters: () => null }));

const categories = [
  { id: "c1", name: "Phones", slug: "phones" },
  { id: "c2", name: "Laptops", slug: "laptops" },
];

const get = vi.fn((url: string) => {
  if (url.includes("categor")) {
    return Promise.resolve({ data: { data: { categories } } });
  }
  return Promise.resolve({ data: { data: { products: [], total: 0 } } });
});
vi.mock("@/axios-instances/UnAuthenticatedAxios", () => ({ default: { get: (u: string) => get(u) } }));

import { SearchModal } from "./SearchModal";

function renderModal(props: Partial<React.ComponentProps<typeof SearchModal>> = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <SearchModal isOpen onClose={vi.fn()} {...props} />
    </QueryClientProvider>
  );
}

describe("SearchModal", () => {
  beforeEach(() => {
    push.mockClear();
    get.mockClear();
    localStorage.clear();
  });

  it("renders nothing when closed", () => {
    const client = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={client}>
        <SearchModal isOpen={false} onClose={vi.fn()} />
      </QueryClientProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the search heading and input when open", () => {
    renderModal();
    expect(screen.getByText(/what are you/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search for products/i)).toBeInTheDocument();
  });

  it("shows browse categories fetched from the API", async () => {
    renderModal();
    expect(await screen.findByText("Phones")).toBeInTheDocument();
    expect(screen.getByText("Laptops")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("closes when the close button is clicked", async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    await userEvent.click(screen.getByRole("button", { name: /close search/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.keyDown(screen.getByPlaceholderText(/search for products/i), { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows and applies the clear button while typing", async () => {
    renderModal();
    const input = screen.getByPlaceholderText(/search for products/i);
    await userEvent.type(input, "phone");
    expect(input).toHaveValue("phone");
    await userEvent.click(screen.getByRole("button", { name: /clear search/i }));
    expect(input).toHaveValue("");
  });
});

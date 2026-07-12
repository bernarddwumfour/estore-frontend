import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const logout = vi.fn();
let authUser: Record<string, unknown> | null = null;

vi.mock("@/lib/use-auth", () => ({
  useAuth: () => ({ user: authUser, logout }),
}));

// cart store supports both selector and full-object call styles
vi.mock("@/app/lib/store/cart-store", () => {
  const state = {
    items: [],
    getTotalItems: () => 2,
    getTotalPrice: () => 0,
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
  };
  return {
    useCartStore: (selector?: (s: typeof state) => unknown) =>
      selector ? selector(state) : state,
  };
});

vi.mock("../search-modal/SearchModal", () => ({
  SearchModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div>search-modal-open</div> : null,
}));

import Navbar from "./Navbar";

describe("Navbar", () => {
  beforeEach(() => {
    logout.mockClear();
    authUser = null;
  });

  it("renders the primary navigation links", () => {
    render(<Navbar />);
    expect(screen.getAllByRole("link", { name: "Products" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "About Us" }).length).toBeGreaterThan(0);
  });

  it("shows the cart item count badge", () => {
    render(<Navbar />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("opens the search modal on the search button", async () => {
    render(<Navbar />);
    expect(screen.queryByText("search-modal-open")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /search products/i }));
    expect(screen.getByText("search-modal-open")).toBeInTheDocument();
  });

  it("shows a Login button when logged out", () => {
    render(<Navbar />);
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows the account menu with Dashboard for non-customer users and logs out", async () => {
    authUser = { id: "1", role: "admin", first_name: "A", last_name: "B" };
    render(<Navbar />);
    await userEvent.click(screen.getByRole("button", { name: /account/i }));
    expect(await screen.findByRole("menuitem", { name: /dashboard/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: /logout/i }));
    expect(logout).toHaveBeenCalledOnce();
  });

  it("hides the Dashboard entry for customer accounts", async () => {
    authUser = { id: "1", role: "customer", first_name: "A", last_name: "B" };
    render(<Navbar />);
    await userEvent.click(screen.getByRole("button", { name: /account/i }));
    expect(await screen.findByRole("menuitem", { name: /orders/i })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /dashboard/i })).not.toBeInTheDocument();
  });
});

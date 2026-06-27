import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Cart from "./Cart";
import { useCartStore } from "@/app/lib/store/cart-store";

vi.mock("@/app/lib/store/cart-store", () => ({ useCartStore: vi.fn() }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, jsx-a11y/alt-text
  default: (props: any) => <img {...props} />,
}));

const mockedUseCartStore = vi.mocked(useCartStore);

const removeItem = vi.fn();
const updateQuantity = vi.fn();
const clearCart = vi.fn();

function setCart(items: unknown[]) {
  mockedUseCartStore.mockReturnValue({
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems: () => items.reduce((n: number, i: any) => n + i.quantity, 0),
    getTotalPrice: () => items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
  } as unknown as ReturnType<typeof useCartStore>);
}

const sampleItem = {
  sku: "SKU1",
  slug: "phone",
  title: "Phone",
  imageUrl: "/p.jpg",
  price: 100,
  quantity: 2,
  isBundle: false,
};

describe("Cart", () => {
  beforeEach(() => {
    removeItem.mockClear();
    updateQuantity.mockClear();
    clearCart.mockClear();
  });

  it("renders nothing when closed", () => {
    setCart([sampleItem]);
    const { container } = render(<Cart cartopen={false} setcartopen={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows the empty state when there are no items", () => {
    setCart([]);
    render(<Cart cartopen setcartopen={vi.fn()} />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("renders item details and totals", () => {
    setCart([sampleItem]);
    render(<Cart cartopen setcartopen={vi.fn()} />);
    expect(screen.getByText("Your Cart (2)")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    // line total + right column both show $200.00
    expect(screen.getAllByText("$200.00").length).toBeGreaterThan(0);
  });

  it("increments and decrements quantity through the store", async () => {
    setCart([sampleItem]);
    render(<Cart cartopen setcartopen={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "+" }));
    expect(updateQuantity).toHaveBeenCalledWith("SKU1", 3);
    await userEvent.click(screen.getByRole("button", { name: "-" }));
    expect(updateQuantity).toHaveBeenCalledWith("SKU1", 1);
  });

  it("removes an item", async () => {
    setCart([sampleItem]);
    render(<Cart cartopen setcartopen={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /remove item/i }));
    expect(removeItem).toHaveBeenCalledWith("SKU1");
  });

  it("clears the cart and closes", async () => {
    const setcartopen = vi.fn();
    setCart([sampleItem]);
    render(<Cart cartopen setcartopen={setcartopen} />);
    await userEvent.click(screen.getByRole("button", { name: /clear cart/i }));
    expect(clearCart).toHaveBeenCalledOnce();
    expect(setcartopen).toHaveBeenCalledWith(false);
  });

  it("expands bundle items on demand", async () => {
    setCart([
      {
        ...sampleItem,
        isBundle: true,
        bundleItems: [
          { title: "Case", quantity: 1, price: 0, imageUrl: "/c.jpg" },
          { title: "Charger", quantity: 1, price: 20, imageUrl: "/ch.jpg" },
        ],
      },
    ]);
    render(<Cart cartopen setcartopen={vi.fn()} />);
    // collapsed initially
    expect(screen.queryByText(/Case/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /2 items in bundle/i }));
    expect(screen.getByText(/Case/)).toBeInTheDocument();
    expect(screen.getByText("FREE")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Home } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";

const items = [
  {
    title: "Catalog",
    url: "/dashboard/catalog",
    icon: Home,
    isActive: true,
    items: [
      { title: "Products", url: "/dashboard/products" },
      { title: "Categories", url: "/dashboard/categories" },
    ],
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    items: [{ title: "All Orders", url: "/dashboard/orders" }],
  },
];

function renderNav() {
  return render(
    <SidebarProvider>
      <NavMain items={items} />
    </SidebarProvider>
  );
}

describe("NavMain", () => {
  it("renders all top-level item titles", () => {
    renderNav();
    expect(screen.getByText("Catalog")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  it("expands the active group's sub-items by default", () => {
    renderNav();
    // Catalog is active -> its sub links are rendered
    const products = screen.getByText("Products").closest("a");
    expect(products).toHaveAttribute("href", "/dashboard/products");
    expect(screen.getByText("Categories").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/categories"
    );
  });
});

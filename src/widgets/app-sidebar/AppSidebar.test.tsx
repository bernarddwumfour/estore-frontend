import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

describe("AppSidebar", () => {
  it("renders the logo and the top-level navigation groups", () => {
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    );
    expect(screen.getByText("iP")).toBeInTheDocument(); // Logo mark
    // These appear as both a nav group label and a sub-item, so match any.
    expect(screen.getAllByText("Products").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Orders").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Users").length).toBeGreaterThan(0);
    expect(screen.getByText("Audit logs")).toBeInTheDocument();
  });
});

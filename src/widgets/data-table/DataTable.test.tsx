import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import DataTable from "./DataTable";

describe("DataTable (tanstack)", () => {
  it("shows a fallback when data is undefined", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<DataTable data={undefined as any} />);
    expect(screen.getByText(/unable to fetch data/i)).toBeInTheDocument();
  });

  it("shows an empty-state message for an empty array", () => {
    render(<DataTable data={[]} />);
    expect(screen.getByText(/no data specified/i)).toBeInTheDocument();
  });

  it("renders headers and row values from the data keys", () => {
    render(<DataTable data={[{ name: "Alpha", price: 1200 }]} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    // numbers are locale-formatted
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });

  it("ignores keys that start with an underscore", () => {
    render(<DataTable data={[{ _internal: "x", name: "Alpha" }]} />);
    expect(screen.queryByText(/_internal/i)).not.toBeInTheDocument();
  });

  it("renders booleans as Yes/No", () => {
    render(<DataTable data={[{ name: "Alpha", active: true }]} />);
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("applies a configured badge variant for matching values", () => {
    render(
      <DataTable
        data={[{ status: "active" }]}
        badgesConfig={{ status: { values: ["active"], variants: ["success"] } }}
      />
    );
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders a filter input for the first string column", () => {
    render(<DataTable data={[{ name: "Alpha" }]} />);
    expect(screen.getByPlaceholderText(/filter name/i)).toBeInTheDocument();
  });

  it("renders an actions column when an actions component is supplied", () => {
    const Actions = ({ row }: { row: { name: string } }) => <button>act-{row.name}</button>;
    render(<DataTable data={[{ name: "Alpha" }]} actionsDropdown={Actions} />);
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "act-Alpha" })).toBeInTheDocument();
  });
});

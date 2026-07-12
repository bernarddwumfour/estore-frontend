import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Trash2 } from "lucide-react";
import { DataTable } from "./DataTable";

type Row = { id: string; name: string; status: string };

const rows: Row[] = [
  { id: "1", name: "Alpha", status: "active" },
  { id: "2", name: "Beta", status: "paused" },
];

describe("Customtable DataTable", () => {
  it("renders the empty state with custom copy", () => {
    render(<DataTable data={[]} emptyTitle="Nothing Here" emptyDescription="Add a record" />);
    expect(screen.getByText("Nothing Here")).toBeInTheDocument();
    expect(screen.getByText("Add a record")).toBeInTheDocument();
  });

  it("renders column headers and row values", () => {
    render(<DataTable data={rows} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    // headers derived from keys (id, name, status)
    expect(screen.getByRole("columnheader", { name: /name/i })).toBeInTheDocument();
  });

  it("hides excluded columns", () => {
    render(<DataTable data={rows} excludeColumns={["status"]} />);
    expect(screen.queryByRole("columnheader", { name: /status/i })).not.toBeInTheDocument();
  });

  it("renders a configured badge for a cell value", () => {
    render(<DataTable data={rows} badges={{ status: { active: "emerald", paused: "amber" } }} />);
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("paused")).toBeInTheDocument();
  });

  it("renders links via the links config", () => {
    render(<DataTable data={rows} links={{ name: (item) => `/x/${item.id}` }} />);
    expect(screen.getByRole("link", { name: /Alpha/ })).toHaveAttribute("href", "/x/1");
  });

  it("renders an Actions column and fires a row action", async () => {
    const onClick = vi.fn();
    render(
      <DataTable
        data={rows}
        actions={[{ label: "Delete", icon: <Trash2 />, variant: "destructive", onClick }]}
      />
    );
    expect(screen.getAllByText("Actions").length).toBeGreaterThan(0);
    // open the first row's action menu (MoreVertical trigger)
    const triggers = screen.getAllByRole("button", { name: /row actions/i });
    await userEvent.click(triggers[0]);
    await userEvent.click(await screen.findByRole("menuitem", { name: /delete/i }));
    expect(onClick).toHaveBeenCalledWith(rows[0]);
  });

  it("supports row selection and bulk actions", async () => {
    const onBulk = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        data={rows}
        bulkActions={[{ label: "Archive", onClick: onBulk }]}
        onSelectionChange={onSelectionChange}
      />
    );
    // prompt is shown before any selection
    expect(screen.getByText(/select rows to perform bulk actions/i)).toBeInTheDocument();

    // header checkbox selects all rows
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[0]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(rows);
    expect(screen.getByText(/2 selected/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /archive/i }));
    expect(onBulk).toHaveBeenCalledWith(rows);
  });

  it("renders the export and columns controls", () => {
    render(<DataTable data={rows} />);
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /columns/i })).toBeInTheDocument();
  });

  it("uses a custom renderActions when provided", () => {
    render(<DataTable data={rows} renderActions={(item) => <span>row-{item.id}</span>} />);
    expect(screen.getByText("row-1")).toBeInTheDocument();
    expect(screen.getByText("row-2")).toBeInTheDocument();
  });
});

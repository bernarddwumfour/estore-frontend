"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertMessage } from "../alert-message/AlertMessage";
import { Badge } from "../badge/Badge";
interface DataTableProps {
  data: any[];
  hiddenColumns?: string[];
  actionsDropdown?: React.ComponentType<{ row: any }>;
  bulkActionsDropdown?: React.ComponentType<{ rows: any[] }>;
  badgesConfig?: {
    [column: string]: {
      values: string[];
      variants: string[]; // one per position
    };
  };
}

const generateColumns = (
  sampleData: any[],
  ActionsDropdown?: React.ComponentType<{ row: any }>,
  badgesConfig: DataTableProps["badgesConfig"] = {},
  BulkActionsDropdown? :  React.ComponentType<{ row: any[] }>,
): ColumnDef<any>[] => {
  if (!sampleData || sampleData.length === 0) return [];

  const firstItem = sampleData[0];
  const columns: ColumnDef<any>[] = [];

  Object.keys(firstItem).forEach((key) => {
    if (key.startsWith("_")) return;

    columns.push({
      accessorKey: key,
      header: ({ column }) => (
        <div  className="flex gap-4 items-center">
          <span className="whitespace-nowrap">
          {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}
          </span>
                  <Button
                  className="w-fit h-fit px-2"
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
        </div>
      ),
      cell: ({ row }) => {
        const value = String(row.getValue(key));

        // Handle badges
        if (badgesConfig[key]) {
          const rawValue = row.getValue(key);
let value = String(rawValue);

if (typeof rawValue === "boolean") {
  value = rawValue ? "Yes" : "No";
}

          const { values, variants } = badgesConfig[key];
          const index = values.indexOf(value);

          if (index !== -1) {
            const variant = variants[index] || "default"; // fallback
            return <Badge variant={variant as any}>{value}</Badge>;
          }
        }

        // Default render
        if (typeof row.getValue(key) === "number" && !key.includes("id")) {
          return (
            <div className="text-right py-2">
              {Number(row.getValue(key)).toLocaleString()}
            </div>
          );
        } else if (row.getValue(key) instanceof Date) {
          return <div className="py-2">{(row.getValue(key) as Date).toLocaleDateString()}</div>;
        } else if (typeof row.getValue(key) === "boolean") {
          return <div className="py-2">{row.getValue(key) ? "Yes" : "No"}</div>;
        } else if (row.getValue(key) === null || row.getValue(key) === undefined) {
          return <div className="text-muted-foreground py-2">-</div>;
        }

        return <div className="py-2">{value}</div>;
      },
    });

    // Add actions column if ActionsDropdown is provided 
    
  });

  if (ActionsDropdown) {
    columns.unshift({ id: "actions", header: ({ table }) => ( <> <p>Actions</p> </> 
    ), enableHiding: false, cell: ({ row }) => <ActionsDropdown row={row.original} />, }); 
   }

   if(BulkActionsDropdown){
     // Add select column 
     columns.unshift({ id: "select", header: ({ table }) => ( <> <Checkbox checked={ table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate") } onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" /> </> 
     // Add actions column if ActionsDropdown is provided
      ), cell: ({ row }) => ( <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" /> ), enableSorting: false, enableHiding: false, });

   }



  return columns;
};


export default function DataTable({ 
  data, 
  hiddenColumns = [], 
  actionsDropdown: ActionsDropdown,
  bulkActionsDropdown: BulkActionsDropdown,
  badgesConfig = {},
}: DataTableProps) {
  // Early return if data is not defined
  if (!data) {
    return (
      <div className="w-full rounded-md border p-4 text-center text-muted-foreground">
        Unable to fetch data 
      </div>
    );
  }

  // Early return if data is empty
  if (data.length === 0) {
    return (
      <AlertMessage variant="default" message="No data specified at the moment"/>
    );
  }

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  // Initialize column visibility state based on hiddenColumns prop
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() => {
    const initialState: VisibilityState = {};
    hiddenColumns.forEach(columnId => {
      initialState[columnId] = false;
    });
    return initialState;
  });

  const columns = React.useMemo(
    () => generateColumns(data, ActionsDropdown,badgesConfig,BulkActionsDropdown as any), 
    [data, ActionsDropdown]
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const filterableColumn = columns.find(col => 
    !['select', 'actions'].includes(col.id as string) && 
    typeof data[0]?.[col.id as string] === 'string'
  )?.id as string;

  // Get selected rows
  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        {filterableColumn && (
          <Input
            placeholder={`Filter ${filterableColumn}...`}
            value={(table.getColumn(filterableColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(filterableColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        
        {/* Bulk Actions (only shown when rows are selected) */}
        {BulkActionsDropdown && selectedRows.length > 0 && (
          <div className="ml-auto flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id.replace(/_/g, ' ')}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <BulkActionsDropdown rows={selectedRows} />

          </div>
        )}

        {/* Default view when no rows are selected */}
        {(!BulkActionsDropdown || selectedRows.length === 0) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id.replace(/_/g, ' ')}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="py-4"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div> */}
    </div>
  );
}
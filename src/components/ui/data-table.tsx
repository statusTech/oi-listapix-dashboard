/**
 * DataTable — shadcn Table + @tanstack/react-table v8 wrapper.
 *
 * @example
 * const columns = [
 *   {
 *     accessorKey: "name",
 *     header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
 *   },
 *   {
 *     accessorKey: "amount",
 *     header: "Valor",
 *     cell: ({ row }) => formatCurrency(row.getValue("amount")),
 *   },
 * ]
 *
 * <DataTable columns={columns} data={rows} onRowClick={(row) => console.log(row)} />
 */

import { Fragment, useState, type ReactNode } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { cn } from "@/lib/utils"

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** show pagination controls (default true) */
  pagination?: boolean
  /** enable column sorting (default true) */
  sorting?: boolean
  onRowClick?: (row: TData) => void
  /** content shown when data is empty */
  empty?: ReactNode
  /** extra class applied to the <Table> */
  className?: string
  numberCellClassName?: string
  sortingState?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  paginationState?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  mobileCard?: (row: TData) => ReactNode
  /** stable row key (default: row index) */
  getRowId?: (row: TData) => string
  /** extra <TableRow>s rendered right after a row (e.g. expanded details) */
  renderSubRows?: (row: TData) => ReactNode
  /**
   * Total rows on the server. When set, `data` is only the current page:
   * the table doesn't slice it, and `paginationState` must be controlled.
   */
  rowCount?: number
  /** extra class per row */
  rowClassName?: (row: TData) => string | undefined
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination = true,
  sorting: enableSorting = true,
  onRowClick,
  empty,
  className,
  numberCellClassName = '',
  sortingState: controlledSorting,
  onSortingChange,
  paginationState: controlledPagination,
  onPaginationChange,
  mobileCard,
  getRowId,
  renderSubRows,
  rowCount,
  rowClassName,
}: DataTableProps<TData, TValue>) {
  const serverPagination = rowCount !== undefined
  const [innerSorting, setInnerSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [innerPagination, setInnerPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  // Estado controlado (ex.: guardado na URL) quando informado; senão, interno.
  const sortingState = controlledSorting ?? innerSorting
  const setSortingState = onSortingChange ?? setInnerSorting
  const paginationState = controlledPagination ?? innerPagination
  const setPaginationState = onPaginationChange ?? setInnerPagination

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: {
      sorting: sortingState,
      columnFilters,
      pagination: paginationState,
    },
    onSortingChange: setSortingState,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPaginationState,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination && !serverPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: !pagination || serverPagination,
    rowCount,
    autoResetPageIndex: !controlledPagination,
  })

  const rows = table.getRowModel().rows

  return (
    <div className="w-full">
      {mobileCard && (
        <div className="flex flex-col gap-3 md:hidden">
          {rows.length ? (
            rows.map((row) => (
              <div key={row.id} onClick={() => onRowClick?.(row.original)}>
                {mobileCard(row.original)}
              </div>
            ))
          ) : (
            <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
              {empty ?? "Nenhum resultado encontrado."}
            </div>
          )}
        </div>
      )}
      <div className={cn(mobileCard && "max-md:hidden")}>
      <Table className={className}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  aria-sort={
                    header.column.getIsSorted() === "asc"
                      ? "ascending"
                      : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : undefined
                  }
                >
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
              <TableRow
                data-state={row.getIsSelected() && "selected"}
                className={cn(onRowClick && "cursor-pointer", rowClassName?.(row.original))}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell 
                    key={cell.id}
                    className={cn(
                      !Number.isNaN(Number(cell.getValue())) ? numberCellClassName : 'text-[13px]',
                      'max-md:text-sm'
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {renderSubRows?.(row.original)}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {empty ?? "Nenhum resultado encontrado."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
      {pagination && <DataTablePagination table={table} total={rowCount} />}
    </div>
  )
}

import type { ColumnDef, OnChangeFn, PaginationState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Paginated } from "@/types/logs";

interface LogsTableProps<TItem> {
  columns: ColumnDef<TItem>[];
  data: Paginated<TItem> | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  getRowId: (item: TItem) => string;
  rowClassName?: (item: TItem) => string | undefined;
}

/** Skeleton, erro ou a DataTable paginada pelo servidor. */
export function LogsTable<TItem>({
  columns,
  data,
  loading,
  error,
  onRetry,
  pagination,
  onPaginationChange,
  getRowId,
  rowClassName,
}: LogsTableProps<TItem>) {
  if (error) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-oi-border p-4">
        <span className="text-sm text-destructive">{error}</span>
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("min-w-0 transition-opacity", loading && "opacity-60")} aria-busy={loading}>
      <DataTable
        columns={columns}
        data={data.items}
        rowCount={data.total}
        paginationState={pagination}
        onPaginationChange={onPaginationChange}
        // A ordem é a da API: ordenar aqui mexeria só na página atual.
        sorting={false}
        getRowId={getRowId}
        rowClassName={rowClassName}
        empty="Nenhum log no período"
        className="[&_td]:px-2 [&_td]:py-3 [&_th]:whitespace-nowrap [&_th]:px-2"
        numberCellClassName="tabular-nums"
      />
    </div>
  );
}

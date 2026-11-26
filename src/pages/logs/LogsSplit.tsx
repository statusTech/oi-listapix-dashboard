import type { ColumnDef } from "@tanstack/react-table";
import SectionCard from "@/components/layout/SectionCard";
import { defaultPeriod, formatDateTime, useClientOptions } from "@/lib/logs";
import { formatCurrency, formatDayKey } from "@/pages/home/utils";
import type { SplitFilters, SplitLog } from "@/types/logs";
import { FiltersForm, SelectFilter, TextFilter } from "./filters";
import { LogsTable } from "./LogsTable";
import { useServerLogs } from "./useServerLogs";

function defaultFilters(): SplitFilters {
  return { ...defaultPeriod(), clientId: "", eventName: "", reason: "" };
}

const nowrap = (value: string) => <span className="whitespace-nowrap">{value}</span>;
const wrapping = (value: string) => <span className="block min-w-[9rem]">{value}</span>;

const columns: ColumnDef<SplitLog>[] = [
  { id: "date", header: "Data", cell: ({ row }) => nowrap(formatDateTime(row.original.occurred_at)) },
  { id: "client", header: "Cliente", cell: ({ row }) => wrapping(row.original.client.name ?? "—") },
  { id: "event", header: "Evento", cell: ({ row }) => wrapping(row.original.event.name) },
  { id: "order", header: "Pedido", cell: ({ row }) => nowrap(row.original.order_id ?? "—") },
  {
    id: "amount",
    header: () => <div className="text-right">Valor</div>,
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-right tabular-nums">{formatCurrency(row.original.amount)}</div>
    ),
  },
  { id: "reason", header: "Motivo", cell: ({ row }) => wrapping(row.original.reason) },
];

export function LogsSplit() {
  const logs = useServerLogs<SplitFilters, SplitLog>(
    "/admin/listapix-dashboard/logs/split",
    defaultFilters,
    "Não foi possível carregar os logs de split.",
  );
  const { filters, setFilter, data } = logs;
  const clients = useClientOptions();

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl">
      <SectionCard
        title="Logs · Split"
        className="min-w-0"
        headerClassName="flex-wrap"
        headerRight={
          data && (
            <span className="text-xs tabular-nums text-oi-text-muted">
              Período: {formatDayKey(data.period.dateStart)} a {formatDayKey(data.period.dateEnd)}
            </span>
          )
        }
      >
        <FiltersForm onSearch={logs.search} onClear={logs.clear}>
          <TextFilter label="De" type="date" value={filters.dateStart} onChange={(v) => setFilter("dateStart", v)} />
          <TextFilter label="Até" type="date" value={filters.dateEnd} onChange={(v) => setFilter("dateEnd", v)} />
          <SelectFilter
            label="Cliente"
            value={filters.clientId}
            options={clients.map((c) => ({ value: c.id, label: c.name }))}
            onChange={(v) => setFilter("clientId", v)}
          />
          <TextFilter
            label="Evento"
            placeholder="Nome do evento"
            value={filters.eventName}
            onChange={(v) => setFilter("eventName", v)}
          />
          <TextFilter
            label="Motivo"
            placeholder="Parte do motivo"
            value={filters.reason}
            onChange={(v) => setFilter("reason", v)}
          />
        </FiltersForm>

        <LogsTable
          columns={columns}
          data={data}
          loading={logs.loading}
          error={logs.error}
          onRetry={logs.retry}
          pagination={logs.pagination}
          onPaginationChange={logs.onPaginationChange}
          getRowId={(log) => String(log.id)}
        />
      </SectionCard>
    </div>
  );
}

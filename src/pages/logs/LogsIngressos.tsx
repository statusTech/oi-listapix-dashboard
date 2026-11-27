import type { ColumnDef } from "@tanstack/react-table";
import { PageLayout } from "@/components/layout/PageLayout";
import SectionCard from "@/components/layout/SectionCard";
import { Badge } from "@/components/ui/badge";
import { defaultPeriod, formatDateTime, useClientOptions } from "@/lib/logs";
import type {
  IngressoChannel,
  IngressoLog,
  IngressoOrigin,
  IngressoProvider,
  IngressoStatus,
  IngressosFilters,
} from "@/types/logs";
import { BadgeTooltip } from "./BadgeTooltip";
import { FiltersForm, SelectFilter, TextFilter } from "./filters";
import { LogsTable } from "./LogsTable";
import { useServerLogs } from "./useServerLogs";

const STATUS_LABEL: Record<IngressoStatus, string> = { success: "Enviado", failed: "Falhou" };
const CHANNEL_LABEL: Record<IngressoChannel, string> = { whatsapp: "WhatsApp", email: "E-mail" };
const ORIGIN_LABEL: Record<IngressoOrigin, string> = { store: "Loja", panel: "Painel" };
const PROVIDER_LABEL: Record<IngressoProvider, string> = { smsbarato: "SMS Barato", zapi: "Z-API", email: "E-mail" };

function toOptions<T extends string>(labels: Record<T, string>) {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}

function defaultFilters(): IngressosFilters {
  return {
    ...defaultPeriod(),
    clientId: "",
    eventName: "",
    status: "",
    channel: "",
    origin: "",
    provider: "",
    error: "",
  };
}

const nowrap = (value: string) => <span className="whitespace-nowrap">{value}</span>;
const wrapping = (value: string) => <span className="block min-w-[9rem]">{value}</span>;

const columns: ColumnDef<IngressoLog>[] = [
  { id: "date", header: "Data", cell: ({ row }) => nowrap(formatDateTime(row.original.sent_at)) },
  { id: "client", header: "Cliente", cell: ({ row }) => wrapping(row.original.client.name ?? "—") },
  { id: "event", header: "Evento", cell: ({ row }) => wrapping(row.original.event.name) },
  { id: "order", header: "Pedido", cell: ({ row }) => nowrap(row.original.reference ?? row.original.order_id) },
  { id: "buyer", header: "Comprador", cell: ({ row }) => wrapping(row.original.buyer_name) },
  { id: "recipient", header: "Destinatário", cell: ({ row }) => nowrap(row.original.recipient) },
  { id: "channel", header: "Canal", cell: ({ row }) => CHANNEL_LABEL[row.original.channel] },
  { id: "origin", header: "Origem", cell: ({ row }) => ORIGIN_LABEL[row.original.origin] },
  { id: "provider", header: "Provedor", cell: ({ row }) => nowrap(PROVIDER_LABEL[row.original.provider]) },
  {
    id: "fallback",
    header: "Fallback",
    cell: ({ row }) => {
      const { used_fallback, fallback_reason } = row.original;
      const label = used_fallback ? "Sim" : "Não";
      if (fallback_reason) {
        return <BadgeTooltip label={label} text={fallback_reason.text} code={fallback_reason.code} variant="outline" />;
      }
      return used_fallback ? <Badge variant="outline">{label}</Badge> : label;
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "failed" ? "destructive" : "secondary"}
        // O cinza padrão do "secondary" some na linha zebrada.
        className={row.original.status === "failed" ? undefined : "bg-oi-border hover:bg-oi-border"}
      >
        {STATUS_LABEL[row.original.status]}
      </Badge>
    ),
  },
  {
    id: "error",
    header: "Erro",
    cell: ({ row }) => {
      const { error } = row.original;
      return error ? <BadgeTooltip label={error.text} text={error.text} code={error.code} variant="destructive" /> : "—";
    },
  },
];

export function LogsIngressos() {
  const logs = useServerLogs<IngressosFilters, IngressoLog>(
    "/admin/listapix-dashboard/logs/ingressos",
    defaultFilters,
    "Não foi possível carregar os logs de ingressos.",
  );
  const { filters, setFilter } = logs;
  const clients = useClientOptions();

  return (
    <PageLayout
      breadcrumb={[{ label: "Dashboard", to: "/" }, { label: "Logs", to: "/logs" }, { label: "Ingressos" }]}
      title="Ingressos"
      filters={
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
          <SelectFilter
            label="Status"
            value={filters.status}
            options={toOptions(STATUS_LABEL)}
            onChange={(v) => setFilter("status", v)}
          />
          <SelectFilter
            label="Canal"
            value={filters.channel}
            options={toOptions(CHANNEL_LABEL)}
            onChange={(v) => setFilter("channel", v)}
          />
          <SelectFilter
            label="Origem"
            allLabel="Todas"
            value={filters.origin}
            options={toOptions(ORIGIN_LABEL)}
            onChange={(v) => setFilter("origin", v)}
          />
          <SelectFilter
            label="Provedor"
            value={filters.provider}
            options={toOptions(PROVIDER_LABEL)}
            onChange={(v) => setFilter("provider", v)}
          />
          <TextFilter
            label="Erro (código ou texto)"
            className="w-72"
            placeholder="Ex.: SMSBARATO_NUMERO_EXCLUIDO"
            value={filters.error}
            onChange={(v) => setFilter("error", v)}
          />
        </FiltersForm>
      }
    >
      <SectionCard className="min-w-0">
        <LogsTable
          columns={columns}
          data={logs.data}
          loading={logs.loading}
          error={logs.error}
          onRetry={logs.retry}
          pagination={logs.pagination}
          onPaginationChange={logs.onPaginationChange}
          getRowId={(log) => log.id}
          rowClassName={(log) => (log.status === "failed" ? "bg-red-50 hover:bg-red-100" : undefined)}
        />
      </SectionCard>
    </PageLayout>
  );
}

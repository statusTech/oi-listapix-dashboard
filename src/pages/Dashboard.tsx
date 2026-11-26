import { useEffect, useState } from "react";
import axios from "axios";
import { functionalUpdate, type OnChangeFn, type PaginationState, type SortingState } from "@tanstack/react-table";
import { CircleDollarSign, Percent, Search, Split, Unplug, Users, X } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { ClientOverview, DashboardOverview } from "@/types/dashboard";
import KpiCard from "@/components/layout/KpiCard";
import SectionCard from "@/components/layout/SectionCard";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientsTable } from "./home/ClientsTable";
import { Filters } from "./home/Filters";
import { BarsCard, type ChartEntry } from "./home/charts";
import {
  DEFAULT_FILTERS,
  brtTodayKey,
  filterClients,
  formatCount,
  formatCurrency,
  formatPercent,
  resolveDateRange,
  type HomeFilters,
  type SplitFilter,
} from "./home/utils";

// Nomes dos query params da rota de overview (período = data da venda, dia de Brasília).
const PERIOD_PARAM_START = "dateStart";
const PERIOD_PARAM_END = "dateEnd";

export function Dashboard() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filters, setFilters] = useState<HomeFilters>(DEFAULT_FILTERS);
  const [sorting, setSorting] = useState<SortingState>([{ id: "totalVendido", desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [excludeTarget, setExcludeTarget] = useState<ClientOverview | null>(null);
  const [excludeOpen, setExcludeOpen] = useState(false);
  const [excluding, setExcluding] = useState(false);

  const dateRange = resolveDateRange(filters.period, filters.customStart, filters.customEnd);
  const rangeStart = dateRange?.start;
  const rangeEnd = dateRange?.end;

  useEffect(() => {
    // Personalizado incompleto/inválido: mantém os dados atuais até o período ficar válido.
    if (filters.period === "custom" && !dateRange) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    api
      .get<DashboardOverview>("/admin/listapix-dashboard/overview", {
        signal: controller.signal,
        params: dateRange ? { [PERIOD_PARAM_START]: dateRange.start, [PERIOD_PARAM_END]: dateRange.end } : undefined,
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        const body = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
        const message = typeof body === "string" && body ? body : "Não foi possível carregar o dashboard.";
        // Descarta os dados anteriores: eles são de outro período.
        setData(null);
        setLoadError(message);
        setLoading(false);
        toast({ variant: "destructive", title: message });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.period, rangeStart, rangeEnd, reloadKey]);

  function toFirstPage() {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }

  function updateFilters(patch: Partial<HomeFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    toFirstPage();
  }

  const handleSorting: OnChangeFn<SortingState> = (updater) => {
    setSorting((prev) => functionalUpdate(updater, prev));
    toFirstPage();
  };

  function requestExclude(clientId: string) {
    // Original (sem filtro de evento): o resumo desconta os totais cheios do cliente.
    const client = data?.clients.find((c) => c.clientId === clientId);
    if (!client) return;
    setExcludeTarget(client);
    setExcludeOpen(true);
  }

  async function confirmExclude() {
    if (!excludeTarget) return;
    const excluded = excludeTarget;
    setExcluding(true);
    try {
      await api.post("/admin/listapix-dashboard/blacklist", {
        clientId: excluded.clientId,
        name: excluded.name,
      });
      setExcludeOpen(false);
      setData((prev) => {
        if (!prev) return prev;
        const clients = prev.clients.filter((c) => c.clientId !== excluded.clientId);
        return {
          ...prev,
          clients,
          summary: {
            totalClientesAtivos: prev.summary.totalClientesAtivos - 1,
            totalSplitados: prev.summary.totalSplitados - (excluded.split ? 1 : 0),
            totalNaoSplitados: prev.summary.totalNaoSplitados - (excluded.split ? 0 : 1),
            totalVendidoGeral: prev.summary.totalVendidoGeral - excluded.totalVendido,
            totalTaxasGeral: prev.summary.totalTaxasGeral - excluded.totalTaxas,
          },
        };
      });
      toast({
        variant: "success",
        title: "Cliente excluído",
        description: `"${excluded.name}" foi para a Lista Negra.`,
      });
    } catch {
      toast({ variant: "destructive", title: "Não foi possível excluir o cliente." });
    } finally {
      setExcluding(false);
    }
  }

  const today = brtTodayKey();
  const summary = data?.summary;
  const firstLoad = loading && !data;
  const clients = data ? filterClients(data.clients, filters, today) : [];
  // Excluir o último cliente de uma página não pode deixar a tabela numa página vazia.
  const lastPage = Math.max(0, Math.ceil(clients.length / pagination.pageSize) - 1);
  const currentPagination = { ...pagination, pageIndex: Math.min(pagination.pageIndex, lastPage) };

  const hasActiveFilters = (Object.keys(DEFAULT_FILTERS) as (keyof HomeFilters)[]).some((key) => {
    // As datas só contam através do período "Personalizado".
    if (key === "customStart" || key === "customEnd") return false;
    if (key === "search") return filters.search.trim() !== "";
    return filters[key] !== DEFAULT_FILTERS[key];
  });

  const clientEntries = (value: (client: ClientOverview) => number): ChartEntry[] =>
    clients.map((client) => ({ id: client.clientId, label: client.name, value: value(client), split: client.split }));

  const eventEntries: ChartEntry[] = clients.flatMap((client) =>
    client.events.map((event) => ({
      id: `${client.clientId}:${event.eventId}`,
      label: `${client.name} — ${event.name}`,
      value: event.totalVendido,
      split: client.split,
    })),
  );

  const kpiValue = (value: number | undefined, format: (v: number) => string) =>
    value === undefined ? "—" : format(value);

  const splitKpi = (split: Exclude<SplitFilter, "all">) => ({
    onClick: () => updateFilters({ split }),
    className: cn(filters.split === split && "border-oi-blue ring-1 ring-oi-blue"),
  });

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-3" aria-busy={loading}>
      <div className={cn("grid grid-cols-2 gap-3 transition-opacity lg:grid-cols-5", loading && data && "opacity-60")}>
        <KpiCard
          label="Total vendido"
          variant="primary"
          icon={<CircleDollarSign />}
          value={kpiValue(summary?.totalVendidoGeral, formatCurrency)}
          loading={firstLoad}
          className="col-span-2 lg:col-span-1"
        />
        <KpiCard
          label="Total de taxas"
          icon={<Percent />}
          value={kpiValue(summary?.totalTaxasGeral, formatCurrency)}
          loading={firstLoad}
          className="col-span-2 sm:col-span-1"
        />
        <KpiCard
          label="Clientes ativos"
          icon={<Users />}
          iconColor="#22C55E"
          value={kpiValue(summary?.totalClientesAtivos, formatCount)}
          loading={firstLoad}
          className="col-span-2 sm:col-span-1"
        />
        <KpiCard
          label="Splitados"
          icon={<Split />}
          iconColor="#9B59B6"
          value={kpiValue(summary?.totalSplitados, formatCount)}
          loading={firstLoad}
          ariaLabel="Splitados: filtrar a listagem"
          {...splitKpi("split")}
        />
        <KpiCard
          label="Não splitados"
          icon={<Unplug />}
          iconColor="#747474"
          value={kpiValue(summary?.totalNaoSplitados, formatCount)}
          loading={firstLoad}
          ariaLabel="Não splitados: filtrar a listagem"
          {...splitKpi("notSplit")}
        />
      </div>

      <SectionCard
        title="Clientes"
        className="min-w-0"
        headerClassName="flex-wrap"
        headerRightClassName="w-full sm:w-auto"
        headerRight={
          <div className="relative w-full sm:w-64">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              placeholder="Buscar cliente..."
              aria-label="Buscar cliente por nome"
              className="h-9 pl-8 text-[13px]"
            />
          </div>
        }
      >
        <Filters filters={filters} today={today} onChange={updateFilters} />

        <div className="flex min-h-7 flex-wrap items-center gap-2">
          {data && (
            <span className="text-xs tabular-nums text-oi-text-muted">
              {clients.length} de {data.clients.length} {data.clients.length === 1 ? "cliente" : "clientes"}
            </span>
          )}
          {hasActiveFilters && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                toFirstPage();
              }}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Limpar filtros
            </Button>
          )}
        </div>

        {firstLoad ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-oi-border p-4">
            <span className="text-sm text-destructive">{loadError}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className={cn("min-w-0 transition-opacity", loading && "opacity-60")}>
            <ClientsTable
              clients={clients}
              today={today}
              sorting={sorting}
              onSortingChange={handleSorting}
              pagination={currentPagination}
              onPaginationChange={setPagination}
              onExclude={requestExclude}
            />
          </div>
        )}
      </SectionCard>

      {!loadError && (
        <div className={cn("grid grid-cols-1 gap-3 transition-opacity xl:grid-cols-2", loading && data && "opacity-60")}>
          <BarsCard
            title="Total vendido"
            entries={clientEntries((c) => c.totalVendido)}
            formatValue={formatCurrency}
            loading={firstLoad}
          />
          <BarsCard
            title="Taxa efetiva"
            note="total de taxas ÷ total vendido"
            entries={clientEntries((c) => (c.totalVendido > 0 ? (c.totalTaxas / c.totalVendido) * 100 : 0))}
            formatValue={formatPercent}
            loading={firstLoad}
          />
          <BarsCard
            title="Ingressos por cliente"
            entries={clientEntries((c) => c.totalTransacoes)}
            formatValue={formatCount}
            loading={firstLoad}
          />
          <BarsCard
            title="Total vendido por evento"
            note="Cada barra é um evento — ingresso e mesa/camarote somados"
            entries={eventEntries}
            formatValue={formatCurrency}
            loading={firstLoad}
          />
        </div>
      )}

      <AlertDialog open={excludeOpen} onOpenChange={(open) => !excluding && setExcludeOpen(open)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              "{excludeTarget?.name}" vai pra Lista Negra e some deste dashboard. Você pode restaurar depois em Lista
              Negra.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluding}>Cancelar</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={excluding} onClick={confirmExclude}>
              {excluding ? "Aguarde..." : "Excluir"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

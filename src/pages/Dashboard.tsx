import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { CalendarCheck, ChevronRight, Search, Trash2, X } from "lucide-react";
import { api } from "../lib/api";
import type { DashboardOverview, ClientOverview } from "../types/dashboard";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { BarChart, type BarChartEntry } from "../components/BarChart";
import { ColumnChart, type ColumnChartEntry } from "../components/ColumnChart";
import { cn } from "../lib/utils";

type SplitFilter = "all" | "split" | "notSplit";

const SPLIT_FILTER_OPTIONS: { value: SplitFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "split", label: "Splitados" },
  { value: "notSplit", label: "Não splitados" },
];

type DateFilter = "today" | "month" | "custom";

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "month", label: "Este mês" },
  { value: "custom", label: "Personalizado" },
];

// YYYY-MM-DD no fuso local (toISOString converteria pra UTC e pode virar o dia).
function toDateParam(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Intervalo inclusivo [startDate, endDate]; null quando o personalizado ainda está incompleto/inválido.
function resolveDateRange(filter: DateFilter, customStart: string, customEnd: string) {
  const now = new Date();
  if (filter === "today") {
    const today = toDateParam(now);
    return { startDate: today, endDate: today };
  }
  if (filter === "month") {
    return {
      startDate: toDateParam(new Date(now.getFullYear(), now.getMonth(), 1)),
      endDate: toDateParam(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  if (!customStart || !customEnd || customStart > customEnd) return null;
  return { startDate: customStart, endDate: customEnd };
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCount(value: number) {
  return value.toLocaleString("pt-BR");
}

function formatPercent(value: number) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function TransacoesCell({
  total,
  mesaCamarote,
  ingresso,
  small,
}: {
  total: number;
  mesaCamarote: number;
  ingresso: number;
  small?: boolean;
}) {
  return (
    <div className={small ? "text-sm" : undefined}>
      <span>{total}</span>
      {mesaCamarote > 0 && (
        <span className="ml-1.5 text-xs text-neutral-500">
          ({ingresso} ingresso, {mesaCamarote} mesa/camarote)
        </span>
      )}
    </div>
  );
}

export function Dashboard() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [splitFilter, setSplitFilter] = useState<SplitFilter>("all");
  const [onlyActiveEvents, setOnlyActiveEvents] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [excludeTarget, setExcludeTarget] = useState<ClientOverview | null>(null);
  const [excluding, setExcluding] = useState(false);

  const dateRange = resolveDateRange(dateFilter, customStart, customEnd);
  const startDate = dateRange?.startDate;
  const endDate = dateRange?.endDate;

  useEffect(() => {
    if (!startDate || !endDate) return;
    const controller = new AbortController();
    setLoading(true);
    api
      .get<DashboardOverview>("/admin/listapix-dashboard/overview", {
        params: { startDate, endDate },
        signal: controller.signal,
      })
      .then((response) => setData(response.data))
      .catch((err) => {
        if (!axios.isCancel(err)) setError("Não foi possível carregar o dashboard.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [startDate, endDate]);

  function selectDateFilter(value: DateFilter) {
    if (value === "custom" && !customStart && !customEnd) {
      const current = resolveDateRange(dateFilter, "", "");
      if (current) {
        setCustomStart(current.startDate);
        setCustomEnd(current.endDate);
      }
    }
    setDateFilter(value);
  }

  function toggleExpanded(clientId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  }

  async function handleConfirmExcluir() {
    if (!excludeTarget) return;
    setExcluding(true);
    try {
      await api.post("/admin/listapix-dashboard/blacklist", {
        clientId: excludeTarget.clientId,
        name: excludeTarget.name,
      });
      const excluded = excludeTarget;
      setExcludeTarget(null);
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
    } catch {
      setError("Não foi possível excluir o cliente.");
    } finally {
      setExcluding(false);
    }
  }

  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (!data) {
    return (
      <div className="p-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const hasActiveFilters =
    search.trim() !== "" || splitFilter !== "all" || onlyActiveEvents || dateFilter !== "month";
  const invalidCustomRange = dateFilter === "custom" && customStart !== "" && customEnd !== "" && customStart > customEnd;

  const filteredClients = data.clients
    .filter((client) => {
      const matchesSearch = client.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesSplit =
        splitFilter === "all" || (splitFilter === "split" ? client.split : !client.split);
      const eventosAtivos = client.events.filter((event) => event.ativo).length;
      const matchesActiveEvents = !onlyActiveEvents || eventosAtivos > 0;
      return matchesSearch && matchesSplit && matchesActiveEvents;
    })
    .sort((a, b) => b.totalVendido - a.totalVendido);

  const clientEntries = (metric: "totalVendido" | "totalTaxas" | "totalTransacoes"): ColumnChartEntry[] =>
    filteredClients.map((client) => ({
      id: client.clientId,
      label: client.name,
      value: client[metric],
      highlighted: client.split,
    }));

  const taxaEfetivaEntries: ColumnChartEntry[] = filteredClients.map((client) => ({
    id: client.clientId,
    label: client.name,
    value: client.totalVendido > 0 ? (client.totalTaxas / client.totalVendido) * 100 : 0,
    highlighted: client.split,
  }));

  const eventEntries: BarChartEntry[] = filteredClients.flatMap((client) =>
    client.events.map((event) => ({
      id: event.eventId,
      label: `${client.name} — ${event.name}`,
      value: event.totalVendido,
      highlighted: client.split,
    })),
  );

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-md border border-input" role="group" aria-label="Filtrar por período">
          {DATE_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={dateFilter === option.value}
              onClick={() => selectDateFilter(option.value)}
              className={cn(
                "h-9 whitespace-nowrap px-3 text-sm font-medium transition-colors [&:not(:first-child)]:border-l [&:not(:first-child)]:border-input",
                dateFilter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {dateFilter === "custom" && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              aria-label="Data inicial"
              value={customStart}
              max={customEnd || undefined}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-9 w-auto"
            />
            <span className="text-sm text-neutral-500">até</span>
            <Input
              type="date"
              aria-label="Data final"
              value={customEnd}
              min={customStart || undefined}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-9 w-auto"
            />
          </div>
        )}

        {invalidCustomRange && <span className="text-sm text-red-600">Data inicial depois da final.</span>}
        {loading && <span className="text-sm text-neutral-500">Carregando...</span>}
      </div>

      <div className="mb-6 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-b border-border pb-4">
        <span>
          <span className="text-sm text-neutral-500">Total vendido</span>{" "}
          <span className="font-semibold">{formatCurrency(data.summary.totalVendidoGeral)}</span>
        </span>
        <span>
          <span className="text-sm text-neutral-500">Total de taxas</span>{" "}
          <span className="font-semibold">{formatCurrency(data.summary.totalTaxasGeral)}</span>
        </span>
        <span>
          <span className="text-sm text-neutral-500">Clientes ativos</span>{" "}
          <span className="font-semibold">{data.summary.totalClientesAtivos}</span>
        </span>
        <span>
          <span className="text-sm text-neutral-500">Splitados</span>{" "}
          <span className="font-semibold">{data.summary.totalSplitados}</span>
        </span>
        <span>
          <span className="text-sm text-neutral-500">Não splitados</span>{" "}
          <span className="font-semibold">{data.summary.totalNaoSplitados}</span>
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-neutral-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-md border border-input" role="group" aria-label="Filtrar por status de split">
            {SPLIT_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={splitFilter === option.value}
                onClick={() => setSplitFilter(option.value)}
                className={cn(
                  "h-9 whitespace-nowrap px-3 text-sm font-medium transition-colors [&:not(:first-child)]:border-l [&:not(:first-child)]:border-input",
                  splitFilter === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant={onlyActiveEvents ? "default" : "outline"}
            size="sm"
            className="h-9"
            aria-pressed={onlyActiveEvents}
            onClick={() => setOnlyActiveEvents((prev) => !prev)}
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            Com eventos ativos
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 text-neutral-500 hover:text-foreground"
              onClick={() => {
                setSearch("");
                setSplitFilter("all");
                setOnlyActiveEvents(false);
                setDateFilter("month");
              }}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      <p className="mb-2 text-sm text-neutral-500">
        {filteredClients.length} de {data.clients.length} {data.clients.length === 1 ? "cliente" : "clientes"}
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Total de eventos</TableHead>
            <TableHead>Eventos ativos</TableHead>
            <TableHead>Transações</TableHead>
            <TableHead>Total vendido</TableHead>
            <TableHead>Total de taxas</TableHead>
            <TableHead>Split</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-sm text-neutral-500">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
          {filteredClients.map((client: ClientOverview) => (
            <Fragment key={client.clientId}>
              <TableRow
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-expanded={expanded.has(client.clientId)}
                onClick={() => toggleExpanded(client.clientId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleExpanded(client.clientId);
                  }
                }}
              >
                <TableCell>
                  <span className="flex items-center gap-1.5">
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
                        expanded.has(client.clientId) ? "rotate-90" : ""
                      }`}
                      aria-hidden="true"
                    />
                    {client.name}
                  </span>
                </TableCell>
                <TableCell>{client.events.length}</TableCell>
                <TableCell>{client.events.filter((event) => event.ativo).length}</TableCell>
                <TableCell>
                  <TransacoesCell
                    total={client.totalTransacoes}
                    mesaCamarote={client.transacoesMesaCamarote}
                    ingresso={client.transacoesIngresso}
                  />
                </TableCell>
                <TableCell>{formatCurrency(client.totalVendido)}</TableCell>
                <TableCell>{formatCurrency(client.totalTaxas)}</TableCell>
                <TableCell>
                  <Badge variant={client.split ? "default" : "secondary"}>{client.split ? "Sim" : "Não"}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExcludeTarget(client);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
              {expanded.has(client.clientId) &&
                client.events.map((event) => (
                  <TableRow key={event.eventId} className="bg-neutral-50 hover:bg-neutral-50">
                    <TableCell className="pl-8 text-sm text-neutral-600">{event.name}</TableCell>
                    <TableCell />
                    <TableCell>
                      <Badge variant={event.ativo ? "default" : "secondary"} className="text-xs">
                        {event.ativo ? "Ativo" : "Encerrado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TransacoesCell
                        total={event.totalTransacoes}
                        mesaCamarote={event.transacoesMesaCamarote}
                        ingresso={event.transacoesIngresso}
                        small
                      />
                    </TableCell>
                    <TableCell className="text-sm">{formatCurrency(event.totalVendido)}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(event.totalTaxas)}</TableCell>
                    <TableCell />
                    <TableCell />
                  </TableRow>
                ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm text-neutral-500">
          Gráficos — {filteredClients.length} {filteredClients.length === 1 ? "cliente filtrado" : "clientes filtrados"}
        </h2>
        <div className="flex items-center gap-4 text-xs text-neutral-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Splitado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-400" />
            Não splitado
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <Card>
          <CardContent className="pt-6">
            <ColumnChart title="Total vendido" entries={clientEntries("totalVendido")} formatValue={formatCurrency} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <ColumnChart
              title="Taxa efetiva"
              entries={taxaEfetivaEntries}
              formatValue={formatPercent}
              note="Total de taxas ÷ total vendido — expõe % fora do padrão do cliente"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <ColumnChart
              title="Transações por cliente"
              entries={clientEntries("totalTransacoes")}
              formatValue={formatCount}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <BarChart
              title="Total vendido por evento"
              entries={eventEntries}
              formatValue={formatCurrency}
              note="Cada barra é um evento, agrupado por cliente — ingresso e mesa/camarote somados"
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={excludeTarget !== null}
        title="Excluir cliente"
        description={
          excludeTarget
            ? `"${excludeTarget.name}" vai pra Lista Negra e some deste dashboard. Você pode restaurar depois em Lista Negra.`
            : ""
        }
        confirmLabel="Excluir"
        confirming={excluding}
        onConfirm={handleConfirmExcluir}
        onCancel={() => setExcludeTarget(null)}
      />
    </div>
  );
}

import type { ClientOverview, EventTotals } from "@/types/dashboard";

export type SplitFilter = "all" | "split" | "notSplit";
export type ClientStatusFilter = "all" | "active" | "inactive";
export type DateFilter = "today" | "month" | "custom";
export type EncerradoFilter = "all" | "yes" | "no";
export type ActiveEventsFilter = "all" | "withActive";

export interface HomeFilters {
  search: string;
  status: ClientStatusFilter;
  split: SplitFilter;
  activeEvents: ActiveEventsFilter;
  period: DateFilter;
  customStart: string;
  customEnd: string;
  encerrado: EncerradoFilter;
}

export const DEFAULT_FILTERS: HomeFilters = {
  search: "",
  status: "all",
  split: "all",
  activeEvents: "all",
  period: "month",
  customStart: "",
  customEnd: "",
  encerrado: "all",
};

export interface DateRange {
  start: string;
  end: string;
}

// YYYY-MM-DD no fuso local (toISOString converteria pra UTC e pode virar o dia).
function toDayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function eventDayKey(value: string | null | undefined) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : toDayKey(date);
}

export function formatDayKey(dayKey: string) {
  const [y, m, d] = dayKey.split("-");
  return `${d}/${m}/${y}`;
}

function compareEventsByStartDesc(a: EventTotals, b: EventTotals) {
  const sa = eventDayKey(a.date_ini);
  const sb = eventDayKey(b.date_ini);
  if (sa === sb) return 0;
  if (!sa) return 1;
  if (!sb) return -1;
  return sa < sb ? 1 : -1;
}

// Dia de hoje em Brasília (a venda é filtrada pelo dia de Brasília no backend).
export function brtTodayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

/** Período da venda; `null` quando o personalizado está incompleto ou inválido. */
export function resolveDateRange(filter: DateFilter, customStart: string, customEnd: string): DateRange | null {
  const today = brtTodayKey();
  if (filter === "today") {
    return { start: today, end: today };
  }
  if (filter === "month") {
    const [y, m] = today.split("-").map(Number);
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const mm = String(m).padStart(2, "0");
    return { start: `${y}-${mm}-01`, end: `${y}-${mm}-${String(lastDay).padStart(2, "0")}` };
  }
  if (!customStart || !customEnd || customStart > customEnd) return null;
  return { start: customStart, end: customEnd };
}

export function isEventEncerrado(event: EventTotals, today: string) {
  const start = eventDayKey(event.date_ini);
  if (!start) return false;
  const end = eventDayKey(event.date_end) ?? start;
  return end < today;
}

// Totais do cliente passam a ser a soma só dos eventos mantidos.
function withFilteredEvents(client: ClientOverview, keep: (event: EventTotals) => boolean): ClientOverview {
  const events = client.events.filter(keep).sort(compareEventsByStartDesc);
  const sum = (key: "totalVendido" | "totalTaxas" | "totalItens" | "totalTransacoes" | "transacoesMesaCamarote" | "transacoesIngresso") =>
    events.reduce((acc, event) => acc + event[key], 0);
  return {
    ...client,
    events,
    totalVendido: sum("totalVendido"),
    totalTaxas: sum("totalTaxas"),
    totalItens: sum("totalItens"),
    totalTransacoes: sum("totalTransacoes"),
    transacoesMesaCamarote: sum("transacoesMesaCamarote"),
    transacoesIngresso: sum("transacoesIngresso"),
  };
}

export function filterClients(clients: ClientOverview[], filters: HomeFilters, today: string): ClientOverview[] {
  const search = filters.search.trim().toLowerCase();
  const dateRange = resolveDateRange(filters.period, filters.customStart, filters.customEnd);

  function keepEvent(event: EventTotals) {
    // Com período, o backend zera os eventos sem venda no período.
    if (dateRange && event.totalTransacoes <= 0) return false;
    if (filters.encerrado !== "all" && isEventEncerrado(event, today) !== (filters.encerrado === "yes")) return false;
    return true;
  }

  return clients
    .filter((client) => {
      const matchesSearch = client.name.toLowerCase().includes(search);
      const matchesStatus = filters.status === "all" || (filters.status === "active" ? client.ativo : !client.ativo);
      const matchesSplit = filters.split === "all" || (filters.split === "split" ? client.split : !client.split);
      const matchesActiveEvents = filters.activeEvents === "all" || client.events.some((event) => event.ativo);
      return matchesSearch && matchesStatus && matchesSplit && matchesActiveEvents;
    })
    .map((client) => withFilteredEvents(client, keepEvent))
    .filter((client) => client.events.length > 0);
}

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatCount(value: number) {
  return value.toLocaleString("pt-BR");
}

export function formatPercent(value: number) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

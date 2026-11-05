import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { Pagination } from "../../components/Pagination";
import { FilterField, FilterSelect } from "../../components/FilterField";
import { fetchSplitLogs, MOCK_SPLIT_CLIENTS, MOCK_SPLIT_REASONS } from "../../lib/mock/split";
import type { Paginated, SplitFilters, SplitLog } from "../../types/logs";

const PAGE_SIZE = 20;

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function toInputDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function defaultFilters(): SplitFilters {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);
  return { from: toInputDate(from), to: toInputDate(to), client: "", event: "", reason: "" };
}

export function LogsSplit() {
  const [filters, setFilters] = useState<SplitFilters>(defaultFilters);
  const [applied, setApplied] = useState({ from: filters.from, to: filters.to });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<SplitLog> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    fetchSplitLogs(applied, page, PAGE_SIZE)
      .then((result) => !cancelled && setData(result))
      .catch(() => !cancelled && setError("Não foi possível carregar os logs de split."));
    return () => {
      cancelled = true;
    };
  }, [applied, page, reloadKey]);

  function set<K extends keyof SplitFilters>(key: K, value: SplitFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function search() {
    setPage(1);
    setApplied({ from: filters.from, to: filters.to });
    setReloadKey((k) => k + 1);
  }

  function clearFilters() {
    const fresh = defaultFilters();
    setFilters(fresh);
    setPage(1);
    setApplied({ from: fresh.from, to: fresh.to });
    setReloadKey((k) => k + 1);
  }

  // Cliente, evento e motivo filtram apenas os itens já carregados na tela.
  const visibleItems = (data?.items ?? []).filter((log) => {
    const event = filters.event.trim().toLowerCase();
    if (filters.client && log.clientName !== filters.client) return false;
    if (event && !log.eventName.toLowerCase().includes(event)) return false;
    if (filters.reason && log.reason !== filters.reason) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <h2 className="mb-6 text-lg font-semibold">Logs · Split</h2>

      <form
        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
      >
        <FilterField label="De">
          <Input type="date" value={filters.from} onChange={(e) => set("from", e.target.value)} />
        </FilterField>
        <FilterField label="Até">
          <Input type="date" value={filters.to} onChange={(e) => set("to", e.target.value)} />
        </FilterField>
        <FilterField label="Cliente">
          <FilterSelect value={filters.client} onChange={(e) => set("client", e.target.value)}>
            <option value="">Todos</option>
            {MOCK_SPLIT_CLIENTS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <FilterField label="Evento">
          <Input placeholder="Nome do evento" value={filters.event} onChange={(e) => set("event", e.target.value)} />
        </FilterField>
        <FilterField label="Motivo">
          <FilterSelect value={filters.reason} onChange={(e) => set("reason", e.target.value)}>
            <option value="">Todos</option>
            {MOCK_SPLIT_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3 lg:justify-end">
          <Button type="button" variant="outline" onClick={clearFilters}>
            Limpar filtros
          </Button>
          <Button type="submit">Buscar</Button>
        </div>
      </form>

      {error ? (
        <div className="rounded-md border border-red-200 p-4 text-sm text-red-600">
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setReloadKey((k) => k + 1)}>
            Tentar novamente
          </Button>
        </div>
      ) : !data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-neutral-500">
                      Nenhum log no período
                    </TableCell>
                  </TableRow>
                )}
                {visibleItems.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.occurredAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                    </TableCell>
                    <TableCell>{log.clientName}</TableCell>
                    <TableCell>{log.eventName}</TableCell>
                    <TableCell className="whitespace-nowrap">{log.orderRef}</TableCell>
                    <TableCell className="whitespace-nowrap text-right">{currency.format(log.amount)}</TableCell>
                    <TableCell>{log.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
        </>
      )}
    </div>
  );
}

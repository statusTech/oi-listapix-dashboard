import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { Pagination } from "../../components/Pagination";
import { FilterField, FilterSelect } from "../../components/FilterField";
import { api } from "../../lib/api";
import { cleanParams, defaultPeriod, errorMessage, formatDateTime, useClientOptions } from "../../lib/logs";
import type { Paginated, SplitFilters, SplitLog } from "../../types/logs";

const PAGE_SIZE = 50;

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function defaultFilters(): SplitFilters {
  return { ...defaultPeriod(), clientId: "", eventName: "", reason: "" };
}

export function LogsSplit() {
  const [filters, setFilters] = useState<SplitFilters>(defaultFilters);
  const [applied, setApplied] = useState<SplitFilters>(filters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<SplitLog> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const clients = useClientOptions();

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    api
      .get<Paginated<SplitLog>>("/admin/listapix-dashboard/logs/split", {
        params: cleanParams({ ...applied, page, limit: PAGE_SIZE }),
      })
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => !cancelled && setError(errorMessage(err, "Não foi possível carregar os logs de split.")));
    return () => {
      cancelled = true;
    };
  }, [applied, page, reloadKey]);

  function set<K extends keyof SplitFilters>(key: K, value: SplitFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function search() {
    setPage(1);
    setApplied(filters);
    setReloadKey((k) => k + 1);
  }

  function clearFilters() {
    const fresh = defaultFilters();
    setFilters(fresh);
    setPage(1);
    setApplied(fresh);
    setReloadKey((k) => k + 1);
  }

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
          <Input type="date" value={filters.dateStart} onChange={(e) => set("dateStart", e.target.value)} />
        </FilterField>
        <FilterField label="Até">
          <Input type="date" value={filters.dateEnd} onChange={(e) => set("dateEnd", e.target.value)} />
        </FilterField>
        <FilterField label="Cliente">
          <FilterSelect value={filters.clientId} onChange={(e) => set("clientId", e.target.value)}>
            <option value="">Todos</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FilterSelect>
        </FilterField>
        <FilterField label="Evento">
          <Input placeholder="Nome do evento" value={filters.eventName} onChange={(e) => set("eventName", e.target.value)} />
        </FilterField>
        <FilterField label="Motivo">
          <Input placeholder="Parte do motivo" value={filters.reason} onChange={(e) => set("reason", e.target.value)} />
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
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-neutral-500">
                      Nenhum log no período
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{formatDateTime(log.occurred_at)}</TableCell>
                    <TableCell>{log.client.name ?? "—"}</TableCell>
                    <TableCell>{log.event.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{log.order_id ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-right">{currency.format(log.amount)}</TableCell>
                    <TableCell>{log.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Período: {data.period.dateStart} a {data.period.dateEnd}
          </p>
          <Pagination page={data.page} pageSize={data.limit} total={data.total} onChange={setPage} />
        </>
      )}
    </div>
  );
}

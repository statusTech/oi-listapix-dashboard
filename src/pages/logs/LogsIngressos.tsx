import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { Pagination } from "../../components/Pagination";
import { FilterField, FilterSelect } from "../../components/FilterField";
import { api } from "../../lib/api";
import { cleanParams, defaultPeriod, errorMessage, formatDateTime, useClientOptions } from "../../lib/logs";
import type { IngressoLog, IngressosFilters, Paginated } from "../../types/logs";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;

const CHANNEL_LABEL = { whatsapp: "WhatsApp", email: "E-mail" } as const;
const ORIGIN_LABEL = { store: "Loja", panel: "Painel" } as const;
const PROVIDER_LABEL = { smsbarato: "SMS Barato", zapi: "Z-API", email: "E-mail" } as const;

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

export function LogsIngressos() {
  const [filters, setFilters] = useState<IngressosFilters>(defaultFilters);
  const [applied, setApplied] = useState<IngressosFilters>(filters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<IngressoLog> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const clients = useClientOptions();

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    api
      .get<Paginated<IngressoLog>>("/admin/listapix-dashboard/logs/ingressos", {
        params: cleanParams({ ...applied, page, limit: PAGE_SIZE }),
      })
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => !cancelled && setError(errorMessage(err, "Não foi possível carregar os logs de ingressos.")));
    return () => {
      cancelled = true;
    };
  }, [applied, page, reloadKey]);

  function set<K extends keyof IngressosFilters>(key: K, value: IngressosFilters[K]) {
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
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <h2 className="mb-6 text-lg font-semibold">Logs · Ingressos</h2>

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
          <Input
            placeholder="Nome do evento"
            value={filters.eventName}
            onChange={(e) => set("eventName", e.target.value)}
          />
        </FilterField>
        <FilterField label="Status">
          <FilterSelect value={filters.status} onChange={(e) => set("status", e.target.value as IngressosFilters["status"])}>
            <option value="">Todos</option>
            <option value="success">Enviado</option>
            <option value="failed">Falhou</option>
          </FilterSelect>
        </FilterField>
        <FilterField label="Canal">
          <FilterSelect value={filters.channel} onChange={(e) => set("channel", e.target.value as IngressosFilters["channel"])}>
            <option value="">Todos</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">E-mail</option>
          </FilterSelect>
        </FilterField>
        <FilterField label="Origem">
          <FilterSelect value={filters.origin} onChange={(e) => set("origin", e.target.value as IngressosFilters["origin"])}>
            <option value="">Todas</option>
            <option value="store">Loja</option>
            <option value="panel">Painel</option>
          </FilterSelect>
        </FilterField>
        <FilterField label="Provedor">
          <FilterSelect value={filters.provider} onChange={(e) => set("provider", e.target.value as IngressosFilters["provider"])}>
            <option value="">Todos</option>
            <option value="smsbarato">SMS Barato</option>
            <option value="zapi">Z-API</option>
            <option value="email">E-mail</option>
          </FilterSelect>
        </FilterField>
        <FilterField label="Erro (código ou texto)">
          <Input placeholder="Ex.: SMSBARATO_NUMERO_EXCLUIDO" value={filters.error} onChange={(e) => set("error", e.target.value)} />
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
                  <TableHead>Comprador</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Provedor</TableHead>
                  <TableHead>Fallback</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-sm text-neutral-500">
                      Nenhum log no período
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((log) => (
                  <TableRow key={log.id} className={cn(log.status === "failed" && "bg-red-50 hover:bg-red-100")}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(log.sent_at)}
                    </TableCell>
                    <TableCell>{log.client.name ?? "—"}</TableCell>
                    <TableCell>{log.event.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{log.reference ?? log.order_id}</TableCell>
                    <TableCell>{log.buyer_name}</TableCell>
                    <TableCell className="whitespace-nowrap">{log.recipient}</TableCell>
                    <TableCell>{CHANNEL_LABEL[log.channel]}</TableCell>
                    <TableCell>{ORIGIN_LABEL[log.origin]}</TableCell>
                    <TableCell>{PROVIDER_LABEL[log.provider]}</TableCell>
                    <TableCell title={log.fallback_reason?.text}>{log.used_fallback ? "Sim" : "Não"}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === "failed" ? "destructive" : "secondary"}>
                        {log.status === "failed" ? "Falhou" : "Enviado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-56">
                      {log.error ? (
                        <>
                          <p className="text-sm text-red-700">{log.error.text}</p>
                          <p className="font-mono text-xs text-neutral-500">{log.error.code}</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={data.page} pageSize={data.limit} total={data.total} onChange={setPage} />
        </>
      )}
    </div>
  );
}

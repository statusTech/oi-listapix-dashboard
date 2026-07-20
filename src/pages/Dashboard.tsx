import { Fragment, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import type { DashboardOverview, ClientOverview } from "../types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";
import { useAuth } from "../context/AuthContext";
import { BarChart, type BarChartEntry } from "../components/BarChart";

type SplitFilter = "all" | "split" | "notSplit";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCount(value: number) {
  return value.toLocaleString("pt-BR");
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
  const { logout } = useAuth();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [splitFilter, setSplitFilter] = useState<SplitFilter>("all");

  useEffect(() => {
    api
      .get<DashboardOverview>("/admin/listapix-dashboard/overview")
      .then((response) => setData(response.data))
      .catch(() => setError("Não foi possível carregar o dashboard."));
  }, []);

  function toggleExpanded(clientId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  }

  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (!data) {
    return (
      <div className="p-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const filteredClients = data.clients
    .filter((client) => {
      const matchesSearch = client.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesSplit =
        splitFilter === "all" || (splitFilter === "split" ? client.split : !client.split);
      return matchesSearch && matchesSplit;
    })
    .sort((a, b) => b.totalVendido - a.totalVendido);

  const clientEntries = (metric: "totalVendido" | "totalTaxas" | "totalTransacoes"): BarChartEntry[] =>
    filteredClients.map((client) => ({
      id: client.clientId,
      label: client.name,
      value: client[metric],
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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Lista Pix — Dashboard</h1>
        <Button onClick={logout} variant="outline">
          Sair
        </Button>
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

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant={splitFilter === "all" ? "default" : "outline"}
            onClick={() => setSplitFilter("all")}
          >
            Todos
          </Button>
          <Button
            type="button"
            variant={splitFilter === "split" ? "default" : "outline"}
            onClick={() => setSplitFilter("split")}
          >
            Splitados
          </Button>
          <Button
            type="button"
            variant={splitFilter === "notSplit" ? "default" : "outline"}
            onClick={() => setSplitFilter("notSplit")}
          >
            Não splitados
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Eventos ativos</TableHead>
            <TableHead>Transações</TableHead>
            <TableHead>Total vendido</TableHead>
            <TableHead>Total de taxas</TableHead>
            <TableHead>Split</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-neutral-500">
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
              </TableRow>
              {expanded.has(client.clientId) &&
                client.events.map((event) => (
                  <TableRow key={event.eventId} className="bg-neutral-50 hover:bg-neutral-50">
                    <TableCell className="pl-8 text-sm text-neutral-600">{event.name}</TableCell>
                    <TableCell />
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
                  </TableRow>
                ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm text-neutral-500">
            Gráficos — {filteredClients.length} {filteredClients.length === 1 ? "cliente filtrado" : "clientes filtrados"}
          </CardTitle>
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
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
          <BarChart title="Total vendido" entries={clientEntries("totalVendido")} formatValue={formatCurrency} />
          <BarChart
            title="Total de taxas"
            entries={clientEntries("totalTaxas")}
            formatValue={formatCurrency}
            note="Ordenado por total de taxas — pode diferir da ordem da tabela"
          />
          <BarChart title="Transações por cliente" entries={clientEntries("totalTransacoes")} formatValue={formatCount} />
          <BarChart
            title="Total vendido por evento"
            entries={eventEntries}
            formatValue={formatCurrency}
            note="Cada barra é um evento, agrupado por cliente — ingresso e mesa/camarote somados"
          />
        </CardContent>
      </Card>
    </div>
  );
}

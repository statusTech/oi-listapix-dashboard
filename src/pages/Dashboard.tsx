import { Fragment, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { DashboardOverview, ClientOverview } from "../types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";
import { useAuth } from "../context/AuthContext";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function Dashboard() {
  const { logout } = useAuth();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

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

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Lista Pix — Dashboard</h1>
        <Button onClick={logout} variant="outline">
          Sair
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-neutral-500">Clientes ativos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.summary.totalClientesAtivos}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-neutral-500">Splitados</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.summary.totalSplitados}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-neutral-500">Não splitados</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{data.summary.totalNaoSplitados}</CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Eventos ativos</TableHead>
            <TableHead>Total vendido</TableHead>
            <TableHead>Total de taxas</TableHead>
            <TableHead>Split</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.clients.map((client: ClientOverview) => (
            <Fragment key={client.clientId}>
              <TableRow className="cursor-pointer" onClick={() => toggleExpanded(client.clientId)}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.events.length}</TableCell>
                <TableCell>{formatCurrency(client.totalVendido)}</TableCell>
                <TableCell>{formatCurrency(client.totalTaxas)}</TableCell>
                <TableCell>
                  <Badge variant={client.split ? "default" : "secondary"}>{client.split ? "Sim" : "Não"}</Badge>
                </TableCell>
              </TableRow>
              {expanded.has(client.clientId) &&
                client.events.map((event) => (
                  <TableRow key={event.eventId} className="bg-neutral-50">
                    <TableCell className="pl-8 text-sm text-neutral-600">{event.name}</TableCell>
                    <TableCell />
                    <TableCell className="text-sm">{formatCurrency(event.totalVendido)}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(event.totalTaxas)}</TableCell>
                    <TableCell />
                  </TableRow>
                ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

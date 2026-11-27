import { createContext, useContext, useState } from "react";
import type { ColumnDef, OnChangeFn, PaginationState, Row, SortingState } from "@tanstack/react-table";
import { ChevronRight, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ClientOverview, EventTotals } from "@/types/dashboard";
import { eventDayKey, formatCount, formatCurrency, formatDayKey, isEventEncerrado } from "./utils";

interface TableActions {
  expanded: Set<string>;
  onExclude: (clientId: string) => void;
}

// As colunas são fixas; o que muda entre renders chega por contexto, para as
// células não serem recriadas (e o botão de expandir não perder o foco).
const TableActionsContext = createContext<TableActions>({ expanded: new Set(), onExclude: () => {} });

function Transacoes({ total, mesaCamarote, ingresso }: { total: number; mesaCamarote: number; ingresso: number }) {
  return (
    <>
      <span className="tabular-nums">{formatCount(total)}</span>
      {mesaCamarote > 0 && (
        <span className="block text-xs text-muted-foreground">
          ({ingresso} ingresso, {mesaCamarote} mesa/camarote)
        </span>
      )}
    </>
  );
}

function ClientNameCell({ client }: { client: ClientOverview }) {
  const { expanded } = useContext(TableActionsContext);
  const open = expanded.has(client.clientId);
  return (
    // O clique sobe para a linha, que expande; o botão dá acesso por teclado.
    <button
      type="button"
      aria-expanded={open}
      className="flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left"
    >
      <ChevronRight
        className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
        aria-hidden="true"
      />
      {client.name}
    </button>
  );
}

function ExcludeCell({ client }: { client: ClientOverview }) {
  const { onExclude } = useContext(TableActionsContext);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 text-destructive hover:text-destructive"
      aria-label={`Excluir ${client.name}`}
      onClick={(e) => {
        e.stopPropagation();
        onExclude(client.clientId);
      }}
    >
      <Trash2 className="h-4 w-4" />
      Excluir
    </Button>
  );
}

function sortableHeader(title: string): ColumnDef<ClientOverview>["header"] {
  return ({ column }) => <DataTableColumnHeader column={column} title={title} />;
}

const activeEventsCount = (client: ClientOverview) => client.events.filter((event) => event.ativo).length;

const columns: ColumnDef<ClientOverview>[] = [
  {
    id: "name",
    accessorFn: (c) => c.name,
    sortingFn: (a: Row<ClientOverview>, b: Row<ClientOverview>) =>
      a.original.name.localeCompare(b.original.name, "pt-BR", { sensitivity: "base" }),
    header: sortableHeader("Cliente"),
    cell: ({ row }) => <ClientNameCell client={row.original} />,
  },
  {
    id: "totalEventos",
    accessorFn: (c) => c.events.length,
    header: sortableHeader("Total de eventos"),
    cell: ({ row }) => row.original.events.length,
  },
  {
    id: "eventosAtivos",
    accessorFn: activeEventsCount,
    header: sortableHeader("Eventos ativos"),
    cell: ({ row }) => activeEventsCount(row.original),
  },
  {
    id: "totalTransacoes",
    accessorFn: (c) => c.totalTransacoes,
    header: sortableHeader("Ingressos"),
    cell: ({ row }) => (
      <Transacoes
        total={row.original.totalTransacoes}
        mesaCamarote={row.original.transacoesMesaCamarote}
        ingresso={row.original.transacoesIngresso}
      />
    ),
  },
  {
    id: "totalVendido",
    accessorFn: (c) => c.totalVendido,
    header: sortableHeader("Total vendido"),
    cell: ({ row }) => formatCurrency(row.original.totalVendido),
  },
  {
    id: "totalTaxas",
    accessorFn: (c) => c.totalTaxas,
    header: sortableHeader("Total de taxas"),
    cell: ({ row }) => formatCurrency(row.original.totalTaxas),
  },
  {
    id: "split",
    accessorFn: (c) => (c.split ? 1 : 0),
    header: sortableHeader("Split"),
    cell: ({ row }) => (
      <Badge
        variant={row.original.split ? "default" : "secondary"}
        // O cinza padrão do "secondary" some na linha zebrada.
        className={row.original.split ? "bg-oi-blue hover:bg-oi-blue" : "bg-oi-border hover:bg-oi-border"}
      >
        {row.original.split ? "Sim" : "Não"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Ações",
    enableSorting: false,
    cell: ({ row }) => <ExcludeCell client={row.original} />,
  },
];

// Mesma ordem das colunas acima.
function EventRow({ event, today }: { event: EventTotals; today: string }) {
  const day = eventDayKey(event.date_ini);
  const encerrado = isEventEncerrado(event, today);
  // Fundo branco e filete azul: o cinza agora é da zebra das linhas de cliente.
  return (
    <TableRow className="bg-white hover:bg-white">
      <TableCell className="border-l-2 border-l-oi-blue !pl-8 text-oi-text-muted">
        {event.name}
        {day && <span className="ml-2 text-xs">{formatDayKey(day)}</span>}
      </TableCell>
      <TableCell />
      <TableCell>
        {encerrado ? (
          <Badge variant="secondary">Encerrado</Badge>
        ) : (
          <Badge variant={event.ativo ? "default" : "outline"} className={cn(event.ativo && "bg-oi-blue hover:bg-oi-blue")}>
            {event.ativo ? "Ativo" : "Inativo"}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Transacoes
          total={event.totalTransacoes}
          mesaCamarote={event.transacoesMesaCamarote}
          ingresso={event.transacoesIngresso}
        />
      </TableCell>
      <TableCell className="tabular-nums">{formatCurrency(event.totalVendido)}</TableCell>
      <TableCell className="tabular-nums">{formatCurrency(event.totalTaxas)}</TableCell>
      <TableCell />
      <TableCell />
    </TableRow>
  );
}

interface ClientsTableProps {
  clients: ClientOverview[];
  today: string;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onExclude: (clientId: string) => void;
}

export function ClientsTable({ clients, today, onExclude, sorting, onSortingChange, pagination, onPaginationChange }: ClientsTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(clientId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  }

  return (
    <TableActionsContext.Provider value={{ expanded, onExclude }}>
      <DataTable
        columns={columns}
        data={clients}
        // Só a primeira coluna quebra linha; assim a tabela cabe no desktop.
        className="[&_td:first-child]:min-w-[11rem] [&_td:first-child]:whitespace-normal [&_td]:whitespace-nowrap [&_td]:px-2 [&_td]:py-3 [&_th]:px-2 [&_th_button]:h-auto [&_th_button]:gap-0 [&_th_button]:whitespace-normal [&_th_button]:py-1 [&_th_button]:text-left"
        numberCellClassName="tabular-nums"
        empty="Nenhum cliente encontrado."
        getRowId={(client) => client.clientId}
        onRowClick={(client) => toggleExpanded(client.clientId)}
        renderSubRows={(client) =>
          expanded.has(client.clientId)
            ? client.events.map((event) => <EventRow key={event.eventId} event={event} today={today} />)
            : null
        }
        sortingState={sorting}
        onSortingChange={onSortingChange}
        paginationState={pagination}
        onPaginationChange={onPaginationChange}
      />
    </TableActionsContext.Provider>
  );
}

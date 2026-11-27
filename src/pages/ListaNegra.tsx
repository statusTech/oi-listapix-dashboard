import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
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
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/logs";
import type { BlacklistEntry, BlacklistResponse } from "@/types/dashboard";

export function ListaNegra() {
  const [entries, setEntries] = useState<BlacklistEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // O alvo fica guardado enquanto o diálogo fecha, pro texto não sumir na animação.
  const [restoreTarget, setRestoreTarget] = useState<BlacklistEntry | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoadError(null);
    api
      .get<BlacklistResponse>("/admin/listapix-dashboard/blacklist", { signal: controller.signal })
      .then((response) => setEntries(response.data.entries))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        const message = errorMessage(err, "Não foi possível carregar a lista negra.");
        setLoadError(message);
        toast({ variant: "destructive", title: message });
      });
    return () => controller.abort();
  }, [reloadKey]);

  async function confirmRestore() {
    if (!restoreTarget) return;
    const restored = restoreTarget;
    setRestoring(true);
    try {
      await api.delete(`/admin/listapix-dashboard/blacklist/${encodeURIComponent(restored.clientId)}`);
      setRestoreOpen(false);
      setEntries((prev) => prev && prev.filter((entry) => entry.clientId !== restored.clientId));
      toast({
        variant: "success",
        title: "Cliente restaurado",
        description: `"${restored.name}" voltou para a Home.`,
      });
    } catch (err) {
      toast({ variant: "destructive", title: errorMessage(err, "Não foi possível restaurar o cliente.") });
    } finally {
      setRestoring(false);
    }
  }

  const columns = useMemo<ColumnDef<BlacklistEntry>[]>(
    () => [
      {
        id: "name",
        accessorFn: (entry) => entry.name,
        sortingFn: (a, b) => a.original.name.localeCompare(b.original.name, "pt-BR", { sensitivity: "base" }),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Cliente" />,
        cell: ({ row }) => row.original.name,
      },
      {
        id: "actions",
        header: "Ações",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8"
            aria-label={`Restaurar ${row.original.name}`}
            onClick={() => {
              setRestoreTarget(row.original);
              setRestoreOpen(true);
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restaurar
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <PageLayout breadcrumb={[{ label: "Dashboard", to: "/" }, { label: "Lista Negra" }]} title="Lista Negra">
      <SectionCard className="min-w-0">
        {loadError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-oi-border p-4">
            <span className="text-sm text-destructive">{loadError}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => setReloadKey((k) => k + 1)}>
              Tentar novamente
            </Button>
          </div>
        ) : !entries ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={entries}
            getRowId={(entry) => entry.clientId}
            empty="Nenhum cliente na lista negra."
            numberCellClassName="tabular-nums"
          />
        )}
      </SectionCard>

      <AlertDialog open={restoreOpen} onOpenChange={(open) => !restoring && setRestoreOpen(open)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar cliente</AlertDialogTitle>
            <AlertDialogDescription>"{restoreTarget?.name}" volta a aparecer no dashboard Home.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Cancelar</AlertDialogCancel>
            <Button type="button" disabled={restoring} onClick={confirmRestore}>
              {restoring ? "Aguarde..." : "Restaurar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}

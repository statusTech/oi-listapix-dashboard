import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { BlacklistEntry, BlacklistResponse } from "../types/dashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { ConfirmDialog } from "../components/ConfirmDialog";

// reason sempre termina em "... em <ISO timestamp>" (gerado pelo backend, ver blacklist.js)
const REASON_TIMESTAMP_RE = /em (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)$/;

function formatReasonDate(reason: string) {
  const match = reason.match(REASON_TIMESTAMP_RE);
  if (!match) return reason;
  const date = new Date(match[1]);
  if (Number.isNaN(date.getTime())) return reason;
  return date.toLocaleString("pt-BR");
}

export function ListaNegra() {
  const [entries, setEntries] = useState<BlacklistEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<BlacklistEntry | null>(null);
  const [restoring, setRestoring] = useState(false);

  function loadBlacklist() {
    return api
      .get<BlacklistResponse>("/admin/listapix-dashboard/blacklist")
      .then((response) => setEntries(response.data.entries))
      .catch(() => setError("Não foi possível carregar a lista negra."));
  }

  useEffect(() => {
    loadBlacklist();
  }, []);

  async function handleConfirmRestore() {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      await api.delete(`/admin/listapix-dashboard/blacklist/${encodeURIComponent(restoreTarget.clientId)}`);
      setRestoreTarget(null);
      await loadBlacklist();
    } catch {
      setError("Não foi possível restaurar o cliente.");
    } finally {
      setRestoring(false);
    }
  }

  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (!entries) {
    return (
      <div className="p-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <h2 className="mb-6 text-lg font-semibold">Lista Negra</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-sm text-neutral-500">
                Nenhum cliente na lista negra.
              </TableCell>
            </TableRow>
          )}
          {entries.map((entry) => (
            <TableRow key={entry.clientId}>
              <TableCell>{entry.name}</TableCell>
              <TableCell className="text-sm text-neutral-600">{formatReasonDate(entry.reason)}</TableCell>
              <TableCell>
                <Button type="button" variant="outline" size="sm" onClick={() => setRestoreTarget(entry)}>
                  Restaurar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={restoreTarget !== null}
        title="Restaurar cliente"
        description={
          restoreTarget ? `"${restoreTarget.name}" volta a aparecer no dashboard Home.` : ""
        }
        confirmLabel="Restaurar"
        confirmVariant="default"
        confirming={restoring}
        onConfirm={handleConfirmRestore}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
}

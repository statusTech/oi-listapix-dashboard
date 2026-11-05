// DADOS MOCADOS — substituir por GET /admin/listapix-dashboard/logs/split
// quando a rota do backend estiver disponível (ver fetchSplitLogs).
import type { Paginated, SplitFilters, SplitLog } from "../../types/logs";

const CLIENTS = ["Status Tech", "Sociedade Vera Cruz", "Casa Aurora", "Clube Atlântico"];
const EVENTS = ["Festa Junina 2026", "Baile de Gala", "Show Acústico", "Noite Retrô", "Feijoada Solidária"];

export const MOCK_SPLIT_REASONS = [
  "Conta do organizador bloqueada",
  "Conta do organizador não encontrada",
  "Dados bancários inválidos",
  "Cadastro do organizador pendente",
];

// Gerador pseudo-aleatório determinístico: o mock é igual a cada reload.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildMock(): SplitLog[] {
  const rand = seeded(7);
  const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)];
  const now = Date.now();
  const logs: SplitLog[] = [];

  for (let i = 0; i < 60; i++) {
    const client = pick(CLIENTS);
    logs.push({
      id: `spl-${i + 1}`,
      occurredAt: new Date(now - i * 5 * 3600_000 - rand() * 3600_000).toISOString(),
      clientId: client.toLowerCase().replace(/\s+/g, "-"),
      clientName: client,
      eventName: pick(EVENTS),
      orderRef: `OT${100000 + Math.floor(rand() * 899999)}`,
      amount: Math.round((20 + rand() * 480) * 100) / 100,
      reason: pick(MOCK_SPLIT_REASONS),
    });
  }
  return logs;
}

const MOCK = buildMock();

export const MOCK_SPLIT_CLIENTS = CLIENTS;

/** Simula o endpoint: só o período e a paginação vão ao servidor. */
export async function fetchSplitLogs(
  filters: Pick<SplitFilters, "from" | "to">,
  page: number,
  pageSize = 20,
): Promise<Paginated<SplitLog>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const from = filters.from ? new Date(`${filters.from}T00:00:00`).getTime() : -Infinity;
  const to = filters.to ? new Date(`${filters.to}T23:59:59.999`).getTime() : Infinity;

  const filtered = MOCK.filter((log) => {
    const at = new Date(log.occurredAt).getTime();
    if (at < from || at > to) return false;
    return true;
  }).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const start = (page - 1) * pageSize;
  return { items: filtered.slice(start, start + pageSize), page, pageSize, total: filtered.length };
}

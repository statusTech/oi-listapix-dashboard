// DADOS MOCADOS — substituir por GET /admin/listapix-dashboard/logs/ingressos
// quando a rota do backend estiver disponível (ver fetchIngressosLogs).
import type { IngressoLog, IngressosFilters, Paginated } from "../../types/logs";

const CLIENTS = ["Status Tech", "Sociedade Vera Cruz", "Casa Aurora", "Clube Atlântico"];
const EVENTS = ["Festa Junina 2026", "Baile de Gala", "Show Acústico", "Noite Retrô", "Feijoada Solidária"];
const BUYERS = ["Ana Souza", "Bruno Lima", "Carla Dias", "Diego Rocha", "Elisa Prado", "Fábio Nunes"];

const ERRORS = [
  { code: "SMSBARATO_INVALID_NUMBER", message: "Número de telefone inválido." },
  { code: "ZAPI_NOT_CONNECTED", message: "Instância do Z-API desconectada." },
  { code: "SMTP_TIMEOUT", message: "Tempo esgotado ao enviar o e-mail." },
];

// Gerador pseudo-aleatório determinístico: o mock é igual a cada reload.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildMock(): IngressoLog[] {
  const rand = seeded(42);
  const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)];
  const now = Date.now();
  const logs: IngressoLog[] = [];

  for (let i = 0; i < 120; i++) {
    const channel = rand() < 0.75 ? "whatsapp" : "email";
    const failed = rand() < 0.25;
    const usedFallback = channel === "whatsapp" && rand() < 0.2;
    const provider = channel === "email" ? "email" : usedFallback ? "zapi" : failed && rand() < 0.5 ? "zapi" : "smsbarato";
    const error = failed
      ? channel === "email"
        ? ERRORS[2]
        : ERRORS[Math.floor(rand() * 2)]
      : null;
    const client = pick(CLIENTS);
    const digits = Math.floor(rand() * 9000 + 1000);

    logs.push({
      id: `ing-${i + 1}`,
      sentAt: new Date(now - i * 2.2 * 3600_000 - rand() * 3600_000).toISOString(),
      clientId: client.toLowerCase().replace(/\s+/g, "-"),
      clientName: client,
      eventName: pick(EVENTS),
      orderRef: `OT${100000 + Math.floor(rand() * 899999)}`,
      buyerName: pick(BUYERS),
      recipient: channel === "email" ? `a***@gmail.com` : `(11) 9****-${digits}`,
      channel,
      origin: rand() < 0.7 ? "store" : "panel",
      provider,
      usedFallback,
      status: failed ? "failed" : "success",
      error,
    });
  }
  return logs;
}

const MOCK = buildMock();

export const MOCK_INGRESSO_CLIENTS = CLIENTS;

/** Simula o endpoint: todos os filtros e a paginação vão ao servidor. */
export async function fetchIngressosLogs(
  filters: IngressosFilters,
  page: number,
  pageSize = 20,
): Promise<Paginated<IngressoLog>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const from = filters.from ? new Date(`${filters.from}T00:00:00`).getTime() : -Infinity;
  const to = filters.to ? new Date(`${filters.to}T23:59:59.999`).getTime() : Infinity;
  const event = filters.event.trim().toLowerCase();
  const error = filters.error.trim().toLowerCase();

  const filtered = MOCK.filter((log) => {
    const at = new Date(log.sentAt).getTime();
    if (at < from || at > to) return false;
    if (filters.client && log.clientName !== filters.client) return false;
    if (event && !log.eventName.toLowerCase().includes(event)) return false;
    if (filters.status && log.status !== filters.status) return false;
    if (filters.channel && log.channel !== filters.channel) return false;
    if (filters.origin && log.origin !== filters.origin) return false;
    if (filters.provider && log.provider !== filters.provider) return false;
    if (error) {
      if (!log.error) return false;
      if (!`${log.error.code} ${log.error.message}`.toLowerCase().includes(error)) return false;
    }
    return true;
  }).sort((a, b) => b.sentAt.localeCompare(a.sentAt));

  const start = (page - 1) * pageSize;
  return { items: filtered.slice(start, start + pageSize), page, pageSize, total: filtered.length };
}

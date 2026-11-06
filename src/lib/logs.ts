import { useEffect, useState } from "react";
import { api } from "./api";
import type { DashboardOverview } from "../types/dashboard";

const TZ = "America/Sao_Paulo";

/** AAAA-MM-DD no horário de Brasília. */
export function brasiliaDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
}

/** Padrão do backend: hoje e os 6 dias anteriores. */
export function defaultPeriod() {
  return { dateStart: brasiliaDate(new Date(Date.now() - 6 * 86_400_000)), dateEnd: brasiliaDate() };
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: TZ });
}

/** Remove filtros vazios antes de enviar como query string. */
export function cleanParams(params: Record<string, string | number>) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined));
}

export function errorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === "string" && message ? message : fallback;
}

export interface ClientOption {
  id: string;
  name: string;
}

/** Lista de clientes (mesmo clientId do overview) para o filtro de Cliente. */
export function useClientOptions(): ClientOption[] {
  const [clients, setClients] = useState<ClientOption[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    api
      .get<DashboardOverview>("/admin/listapix-dashboard/overview", { signal: controller.signal })
      .then((res) =>
        setClients(
          res.data.clients
            .map((c) => ({ id: c.clientId, name: c.name }))
            .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
        ),
      )
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return clients;
}

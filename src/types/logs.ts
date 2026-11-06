// Contrato com GET /admin/listapix-dashboard/logs/* (ver docs/FRONTEND_DASHBOARD_LOGS.md)

export interface LogsPeriod {
  dateStart: string; // AAAA-MM-DD (Brasília)
  dateEnd: string;
}

export interface Paginated<T> {
  success: boolean;
  items: T[];
  total: number;
  page: number;
  limit: number;
  period: LogsPeriod;
}

export type IngressoChannel = "whatsapp" | "email";
export type IngressoOrigin = "store" | "panel";
export type IngressoProvider = "smsbarato" | "zapi" | "email";
export type IngressoStatus = "success" | "failed";

export interface IngressoLog {
  id: string; // único entre clientes
  sent_at: string; // ISO UTC
  client: { id: string; name: string | null };
  event: { id: string; name: string };
  order_id: string;
  reference: string | null;
  buyer_name: string;
  recipient: string; // já mascarado pelo backend
  channel: IngressoChannel;
  origin: IngressoOrigin;
  status: IngressoStatus;
  provider: IngressoProvider;
  used_fallback: boolean;
  error: { code: string; text: string } | null;
  fallback_reason: { code: string; text: string } | null;
}

export interface IngressosFilters {
  dateStart: string;
  dateEnd: string;
  clientId: string;
  eventName: string;
  status: "" | IngressoStatus;
  channel: "" | IngressoChannel;
  origin: "" | IngressoOrigin;
  provider: "" | IngressoProvider;
  error: string;
}

export interface SplitLog {
  id: number;
  occurred_at: string; // ISO UTC
  client: { id: string; name: string | null };
  event: { id: string; name: string };
  order_id: string | null;
  amount: number; // em reais
  reason: string;
}

export interface SplitFilters {
  dateStart: string;
  dateEnd: string;
  clientId: string;
  eventName: string;
  reason: string;
}

// Contrato com GET /admin/listapix-dashboard/logs/* (ver docs/task-backend-1.md)

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type IngressoChannel = "whatsapp" | "email";
export type IngressoOrigin = "store" | "panel";
export type IngressoProvider = "smsbarato" | "zapi" | "email";
export type IngressoStatus = "success" | "failed";

export interface IngressoLog {
  id: string;
  sentAt: string; // ISO
  clientId: string;
  clientName: string;
  eventName: string;
  orderRef: string;
  buyerName: string;
  recipient: string; // já mascarado pelo backend
  channel: IngressoChannel;
  origin: IngressoOrigin;
  provider: IngressoProvider;
  usedFallback: boolean;
  status: IngressoStatus;
  error: { code: string; message: string } | null;
}

export interface IngressosFilters {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  client: string;
  event: string;
  status: "" | IngressoStatus;
  channel: "" | IngressoChannel;
  origin: "" | IngressoOrigin;
  provider: "" | IngressoProvider;
  error: string;
}

export interface SplitLog {
  id: string;
  occurredAt: string; // ISO
  clientId: string;
  clientName: string;
  eventName: string;
  orderRef: string;
  amount: number; // em reais
  reason: string;
}

export interface SplitFilters {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  client: string;
  event: string;
  reason: string;
}

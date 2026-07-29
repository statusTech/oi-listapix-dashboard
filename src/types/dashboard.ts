export interface EventTotals {
  eventId: string;
  name: string;
  ativo: boolean;
  totalVendido: number;
  totalTaxas: number;
  totalItens: number;
  totalTransacoes: number;
  transacoesMesaCamarote: number;
  transacoesIngresso: number;
}

export interface ClientOverview {
  clientId: string;
  name: string;
  split: boolean;
  totalVendido: number;
  totalTaxas: number;
  totalItens: number;
  totalTransacoes: number;
  transacoesMesaCamarote: number;
  transacoesIngresso: number;
  events: EventTotals[];
}

export interface DashboardOverview {
  success: boolean;
  summary: {
    totalClientesAtivos: number;
    totalSplitados: number;
    totalNaoSplitados: number;
    totalVendidoGeral: number;
    totalTaxasGeral: number;
  };
  clients: ClientOverview[];
}

export interface BlacklistEntry {
  clientId: string;
  name: string;
  reason: string;
}

export interface BlacklistResponse {
  success: boolean;
  entries: BlacklistEntry[];
}

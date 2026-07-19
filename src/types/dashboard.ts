export interface EventTotals {
  eventId: string;
  name: string;
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

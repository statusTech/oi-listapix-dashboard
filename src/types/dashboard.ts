export interface EventTotals {
  eventId: string;
  name: string;
  totalVendido: number;
  totalTaxas: number;
  totalItens: number;
}

export interface ClientOverview {
  clientId: string;
  name: string;
  split: boolean;
  totalVendido: number;
  totalTaxas: number;
  totalItens: number;
  events: EventTotals[];
}

export interface DashboardOverview {
  success: boolean;
  summary: {
    totalClientesAtivos: number;
    totalSplitados: number;
    totalNaoSplitados: number;
  };
  clients: ClientOverview[];
}

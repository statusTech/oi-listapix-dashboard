import type { ClientOverview } from "../types/dashboard";

interface ClientBarChartProps {
  title: string;
  clients: ClientOverview[];
  metric: "totalVendido" | "totalTaxas";
  formatValue: (value: number) => string;
}

const MAX_VISIBLE_HEIGHT = 320;
const DIRECT_LABEL_THRESHOLD = 15;
// Below this bar width the value label has no room to sit inside the bar
// (in white) — it renders outside the tip (in muted text) instead.
const INSIDE_LABEL_MIN_PCT = 30;

export function ClientBarChart({ title, clients, metric, formatValue }: ClientBarChartProps) {
  const sorted = [...clients].sort((a, b) => b[metric] - a[metric]);
  const maxValue = Math.max(1, ...sorted.map((c) => c[metric]));
  const directLabels = sorted.length <= DIRECT_LABEL_THRESHOLD;

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-neutral-700">{title}</h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-neutral-500">Sem dados para exibir.</p>
      ) : (
        <div className="space-y-2 overflow-y-auto overflow-x-hidden pr-1" style={{ maxHeight: MAX_VISIBLE_HEIGHT }}>
          {sorted.map((client) => {
            const widthPct = Math.max(2, (client[metric] / maxValue) * 100);
            const labelInside = directLabels && widthPct >= INSIDE_LABEL_MIN_PCT;
            const labelOutside = directLabels && !labelInside;
            return (
              <div key={client.clientId} className="group relative flex items-center gap-2">
                <span className="w-28 shrink-0 truncate text-xs text-neutral-600" title={client.name}>
                  {client.name}
                </span>
                <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-neutral-100">
                  <div
                    className={`flex h-5 items-center justify-end rounded-r-sm pr-2 transition-[filter] group-hover:brightness-90 group-focus-within:brightness-90 ${
                      client.split ? "bg-primary" : "bg-neutral-400"
                    }`}
                    style={{ width: `${widthPct}%` }}
                    tabIndex={0}
                    role="img"
                    aria-label={`${client.name}: ${formatValue(client[metric])}`}
                    title={`${client.name}: ${formatValue(client[metric])}`}
                  >
                    {labelInside && (
                      <span className="whitespace-nowrap text-[11px] font-medium text-white">
                        {formatValue(client[metric])}
                      </span>
                    )}
                  </div>
                  {labelOutside && (
                    <span
                      className="pointer-events-none absolute inset-y-0 flex items-center pl-2 text-[11px] text-neutral-700"
                      style={{ left: `${widthPct}%` }}
                    >
                      {formatValue(client[metric])}
                    </span>
                  )}
                </div>
                <div className="pointer-events-none absolute -top-8 left-28 z-10 hidden whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs text-white group-hover:block group-focus-within:block">
                  {client.name}: {formatValue(client[metric])}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

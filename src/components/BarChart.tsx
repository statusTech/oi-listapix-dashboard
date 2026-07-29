export interface BarChartEntry {
  id: string;
  label: string;
  value: number;
  highlighted: boolean;
}

interface BarChartProps {
  title: string;
  entries: BarChartEntry[];
  formatValue: (value: number) => string;
  note?: string;
}

const MAX_VISIBLE_HEIGHT = 320;
const DIRECT_LABEL_THRESHOLD = 15;
// Below this bar width the value label has no room to sit inside the bar
// (in white) — it renders outside the tip (in muted text) instead.
const INSIDE_LABEL_MIN_PCT = 30;
const MIN_BAR_WIDTH_PCT = 3;

export function BarChart({ title, entries, formatValue, note }: BarChartProps) {
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(1, ...sorted.map((e) => e.value));
  const directLabels = sorted.length <= DIRECT_LABEL_THRESHOLD;

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-neutral-700">{title}</h3>
      {note && <p className="-mt-2 mb-3 text-xs text-neutral-500">{note}</p>}
      {sorted.length === 0 ? (
        <p className="text-sm text-neutral-500">Sem dados para exibir.</p>
      ) : (
        <div
          role="list"
          aria-label={title}
          className="space-y-2 overflow-y-auto overflow-x-hidden pr-1"
          style={{ maxHeight: MAX_VISIBLE_HEIGHT }}
        >
          {sorted.map((entry) => {
            // Square-root scale: a linear scale collapses every value under ~4% of the max
            // to the same 2px floor once one entry dominates, hiding smaller outliers.
            const widthPct = Math.max(MIN_BAR_WIDTH_PCT, Math.sqrt(entry.value / maxValue) * 100);
            const labelInside = directLabels && widthPct >= INSIDE_LABEL_MIN_PCT;
            const labelOutside = directLabels && !labelInside;
            const statusLabel = entry.highlighted ? "splitado" : "não splitado";
            return (
              <div
                key={entry.id}
                role="listitem"
                aria-label={`${entry.label}: ${formatValue(entry.value)} — ${statusLabel}`}
                className="group flex items-center gap-2"
              >
                <span
                  className="max-w-[45%] shrink-0 truncate text-xs text-neutral-600 sm:max-w-[16rem] lg:max-w-[22rem]"
                  title={entry.label}
                >
                  {entry.label}
                </span>
                <div
                  className="relative h-5 flex-1 overflow-hidden rounded-sm bg-neutral-100"
                  title={`${entry.label}: ${formatValue(entry.value)}`}
                >
                  <div
                    aria-hidden="true"
                    className={`flex h-5 items-center justify-end rounded-r-sm pr-2 transition-[filter] group-hover:brightness-90 ${
                      entry.highlighted ? "bg-primary" : "bg-neutral-400"
                    }`}
                    style={{ width: `${widthPct}%` }}
                  >
                    {labelInside && (
                      <span className="whitespace-nowrap text-[11px] font-medium text-white">
                        {formatValue(entry.value)}
                      </span>
                    )}
                  </div>
                  {labelOutside && (
                    <span
                      className="pointer-events-none absolute inset-y-0 flex items-center pl-2 text-[11px] text-neutral-700"
                      style={{ left: `${widthPct}%` }}
                    >
                      {formatValue(entry.value)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

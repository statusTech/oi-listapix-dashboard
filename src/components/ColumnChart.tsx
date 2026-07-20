export interface ColumnChartEntry {
  id: string;
  label: string;
  value: number;
  highlighted: boolean;
}

interface ColumnChartProps {
  title: string;
  entries: ColumnChartEntry[];
  formatValue: (value: number) => string;
  note?: string;
}

const TRACK_HEIGHT = 140;
const BAR_WIDTH = 24;

export function ColumnChart({ title, entries, formatValue, note }: ColumnChartProps) {
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(1, ...sorted.map((e) => e.value));

  return (
    <div>
      <h3 className={note ? "text-sm font-medium text-neutral-700" : "mb-3 text-sm font-medium text-neutral-700"}>
        {title}
      </h3>
      {note && <p className="mb-3 text-xs text-neutral-500">{note}</p>}
      {sorted.length === 0 ? (
        <p className="text-sm text-neutral-500">Sem dados para exibir.</p>
      ) : (
        <div className="flex items-end gap-4 overflow-x-auto overflow-y-hidden pb-1" style={{ minHeight: TRACK_HEIGHT + 56 }}>
          {sorted.map((entry) => {
            const heightPx = Math.max(2, (entry.value / maxValue) * TRACK_HEIGHT);
            return (
              <div key={entry.id} className="group flex shrink-0 flex-col items-center" style={{ width: 64 }}>
                <span className="mb-1 whitespace-nowrap text-[11px] text-neutral-600">{formatValue(entry.value)}</span>
                <div
                  className="relative flex items-end border-b border-neutral-200"
                  style={{ height: TRACK_HEIGHT, width: BAR_WIDTH }}
                >
                  <div
                    className={`w-full rounded-t transition-[filter] group-hover:brightness-90 group-focus-within:brightness-90 ${
                      entry.highlighted ? "bg-primary" : "bg-neutral-400"
                    }`}
                    style={{ height: heightPx }}
                    tabIndex={0}
                    role="img"
                    aria-label={`${entry.label}: ${formatValue(entry.value)}`}
                  />
                  <div className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-xs text-white group-hover:block group-focus-within:block">
                    {entry.label}: {formatValue(entry.value)}
                  </div>
                </div>
                <span
                  className="mt-1.5 line-clamp-2 max-w-full text-center text-[11px] leading-tight text-neutral-600"
                  title={entry.label}
                >
                  {entry.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

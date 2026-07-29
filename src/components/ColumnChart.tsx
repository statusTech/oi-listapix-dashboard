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
const MIN_BAR_HEIGHT = 4;
// Reserved headroom above the tallest bar so its value label never clips
// (label is ~20.5px tall at text-[11px] + pb-1; 24 leaves a small margin).
const LABEL_GAP = 24;

export function ColumnChart({ title, entries, formatValue, note }: ColumnChartProps) {
  const maxValue = Math.max(1, ...entries.map((e) => e.value));

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-neutral-700">{title}</h3>
      {note && <p className="-mt-2 mb-3 text-xs text-neutral-500">{note}</p>}
      {entries.length === 0 ? (
        <p className="text-sm text-neutral-500">Sem dados para exibir.</p>
      ) : (
        <div
          role="list"
          aria-label={title}
          // px-8: value labels are wider than a column and overflow sideways over
          // neighbors — without this padding the scroll container clips the first/last
          // label at its own edge (labels sort largest-first, so this hit constantly).
          className="flex items-end gap-4 overflow-x-auto overflow-y-hidden px-8 pb-1"
          style={{ minHeight: TRACK_HEIGHT + LABEL_GAP + 34 }}
        >
          {entries.map((entry) => {
            // Square-root scale: a linear scale collapses every value under ~1.4% of the max
            // to the same 2px floor once one client dominates, hiding smaller outliers.
            const heightPx = Math.max(MIN_BAR_HEIGHT, Math.sqrt(entry.value / maxValue) * TRACK_HEIGHT);
            const statusLabel = entry.highlighted ? "splitado" : "não splitado";
            return (
              <div
                key={entry.id}
                role="listitem"
                aria-label={`${entry.label}: ${formatValue(entry.value)} — ${statusLabel}`}
                className="flex shrink-0 flex-col items-center"
                style={{ width: 64 }}
              >
                <div
                  className="relative"
                  style={{ height: TRACK_HEIGHT + LABEL_GAP, width: BAR_WIDTH }}
                  title={`${entry.label}: ${formatValue(entry.value)}`}
                >
                  <div
                    className="absolute inset-x-0 bottom-0 border-b border-neutral-200"
                    style={{ height: TRACK_HEIGHT }}
                  />
                  <div
                    aria-hidden="true"
                    className={`absolute bottom-0 w-full rounded-t transition-[filter] hover:brightness-90 ${
                      entry.highlighted ? "bg-primary" : "bg-neutral-400"
                    }`}
                    style={{ height: heightPx }}
                  />
                  <span
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pb-1 text-[11px] text-neutral-600"
                    style={{ bottom: heightPx }}
                  >
                    {formatValue(entry.value)}
                  </span>
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

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";
import SectionCard from "@/components/layout/SectionCard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ChartEntry {
  id: string;
  label: string;
  value: number;
  split: boolean;
}

const SPLIT_COLOR = "#3B94FF";
const NOT_SPLIT_COLOR = "#A3A3A3";

const ROW_HEIGHT = 32;
const MIN_HEIGHT = 96;
const BODY_HEIGHT = 320;

const statusLabel = (split: boolean) => (split ? "Splitado" : "Não splitado");

function Legend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-oi-text-muted">
      {[true, false].map((split) => (
        <li key={String(split)} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: split ? SPLIT_COLOR : NOT_SPLIT_COLOR }}
          />
          {statusLabel(split)}
        </li>
      ))}
    </ul>
  );
}

interface BarsCardProps {
  title: string;
  note?: string;
  entries: ChartEntry[];
  formatValue: (value: number) => string;
  loading: boolean;
}

/**
 * Barras horizontais, uma por linha: com muitos clientes o card rola na
 * vertical, sem rolagem horizontal no celular.
 */
export function BarsCard({ title, note, entries, formatValue, loading }: BarsCardProps) {
  const isMobile = useIsMobile();
  const labelWidth = isMobile ? 92 : 160;
  const maxChars = isMobile ? 13 : 24;

  const rows = [...entries].sort((a, b) => b.value - a.value);
  const labels = new Map(rows.map((row) => [row.id, row.label]));

  const tickLabel = (id: string) => {
    const label = labels.get(id) ?? "";
    return label.length > maxChars ? `${label.slice(0, maxChars - 1)}…` : label;
  };

  return (
    <SectionCard
      title={title}
      headerRight={<Legend />}
      className="min-w-0"
      headerClassName="flex-wrap"
    >
      {note && <p className="-mt-2 text-xs text-oi-text-muted">{note}</p>}
      {loading ? (
        <Skeleton className="h-[240px] w-full rounded-md" />
      ) : rows.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center text-[13px] text-oi-text-muted">Sem dados</div>
      ) : (
        <div className="w-full overflow-y-auto overflow-x-hidden" style={{ maxHeight: BODY_HEIGHT }}>
          <ChartContainer
            config={{ value: { label: title } }}
            className="aspect-auto w-full"
            style={{ height: Math.max(MIN_HEIGHT, rows.length * ROW_HEIGHT) }}
          >
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 0, right: 96, bottom: 0, left: 0 }}
              accessibilityLayer
            >
              {/* Raiz quadrada: na linear, um cliente dominante achata todos os outros. */}
              <XAxis type="number" hide scale="sqrt" domain={[0, (max: number) => (max > 0 ? max : 1)]} />
              <YAxis
                type="category"
                dataKey="id"
                width={labelWidth}
                interval={0}
                tickLine={false}
                axisLine={false}
                tick={({ y, payload }: { y: number; payload: { value: string } }) => (
                  <text x={0} y={y} dy={4} fontSize={11} fill="#6B7280">
                    <title>{labels.get(payload.value)}</title>
                    {tickLabel(payload.value)}
                  </text>
                )}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(59,148,255,0.06)" }}
                content={
                  <ChartTooltipContent
                    className="max-w-[16rem]"
                    labelFormatter={(_, payload) => (payload?.[0]?.payload as ChartEntry | undefined)?.label}
                    formatter={(value, _name, item) => (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">{statusLabel((item.payload as ChartEntry).split)}</span>
                        <span className="font-medium tabular-nums text-foreground">{formatValue(Number(value))}</span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="value" isAnimationActive={false} barSize={18} minPointSize={3} radius={[0, 4, 4, 0]}>
                {rows.map((row) => (
                  <Cell key={row.id} fill={row.split ? SPLIT_COLOR : NOT_SPLIT_COLOR} />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  fontSize={11}
                  fill="#1F2937"
                  formatter={(value: number) => formatValue(value)}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </SectionCard>
  );
}

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import PillToggle, { type PillOption } from "@/components/ui/pill-toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resolveDateRange, type DateFilter, type HomeFilters } from "./utils";

interface Option<T extends string> {
  value: T;
  label: string;
}

const STATUS_OPTIONS: Option<HomeFilters["status"]>[] = [
  { value: "all", label: "Status: todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

const SPLIT_OPTIONS: Option<HomeFilters["split"]>[] = [
  { value: "all", label: "Split: todos" },
  { value: "split", label: "Splitados" },
  { value: "notSplit", label: "Não splitados" },
];

const ACTIVE_EVENTS_OPTIONS: Option<HomeFilters["activeEvents"]>[] = [
  { value: "all", label: "Eventos ativos: todos" },
  { value: "withActive", label: "Com eventos ativos" },
];

const ENCERRADO_OPTIONS: Option<HomeFilters["encerrado"]>[] = [
  { value: "all", label: "Encerrados: todos" },
  { value: "yes", label: "Somente encerrados" },
  { value: "no", label: "Não encerrados" },
];

const PERIOD_OPTIONS: PillOption<DateFilter>[] = [
  { value: "today", label: "Hoje" },
  { value: "month", label: "Este mês" },
  { value: "custom", label: "Personalizado" },
];

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger className="h-9 w-full text-[13px]" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface FiltersProps {
  filters: HomeFilters;
  today: string;
  onChange: (patch: Partial<HomeFilters>) => void;
}

export function Filters({ filters, today, onChange }: FiltersProps) {
  const { period, customStart, customEnd } = filters;
  const invalidRange = period === "custom" && customStart !== "" && customEnd !== "" && customStart > customEnd;

  function selectPeriod(value: DateFilter) {
    // Personalizado começa preenchido com o período que estava selecionado.
    if (value === "custom" && !customStart && !customEnd) {
      const current = resolveDateRange(period, "", "");
      if (current) {
        onChange({ period: value, customStart: current.start, customEnd: current.end });
        return;
      }
    }
    onChange({ period: value });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <FilterSelect label="Status do cliente" value={filters.status} options={STATUS_OPTIONS} onChange={(status) => onChange({ status })} />
        <FilterSelect label="Split" value={filters.split} options={SPLIT_OPTIONS} onChange={(split) => onChange({ split })} />
        <FilterSelect
          label="Eventos ativos"
          value={filters.activeEvents}
          options={ACTIVE_EVENTS_OPTIONS}
          onChange={(activeEvents) => onChange({ activeEvents })}
        />
        <FilterSelect
          label="Eventos encerrados"
          value={filters.encerrado}
          options={ENCERRADO_OPTIONS}
          onChange={(encerrado) => onChange({ encerrado })}
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div role="group" aria-label="Período das vendas" className="flex min-h-9 items-center">
          <PillToggle options={PERIOD_OPTIONS} value={period} onChange={selectPeriod} />
        </div>
        {period === "custom" && (
          <>
            <FormField label="De" htmlFor="home-date-start" className="w-full sm:w-44">
              <Input
                id="home-date-start"
                type="date"
                value={customStart}
                max={today}
                onChange={(e) => {
                  const value = e.target.value;
                  // Início passou do fim: empurra o fim junto pra não ficar um período inválido.
                  const pushEnd = value && customEnd && value > customEnd;
                  onChange(pushEnd ? { customStart: value, customEnd: value } : { customStart: value });
                }}
                className="h-9 text-[13px]"
              />
            </FormField>
            <FormField label="Até" htmlFor="home-date-end" className="w-full sm:w-44">
              <Input
                id="home-date-end"
                type="date"
                value={customEnd}
                min={customStart || undefined}
                max={today}
                onChange={(e) => onChange({ customEnd: e.target.value })}
                className="h-9 text-[13px]"
              />
            </FormField>
          </>
        )}
        {invalidRange && (
          <p role="alert" className="flex min-h-9 items-center text-sm text-destructive">
            Data inicial depois da final.
          </p>
        )}
      </div>
    </div>
  );
}

import { useId } from "react";
import { Search, X } from "lucide-react";
import { FILTER_BAR_CLASS, FilterField } from "@/components/layout/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PillToggle, { type PillOption } from "@/components/ui/pill-toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resolveDateRange, type DateFilter, type HomeFilters } from "./utils";

interface Option<T extends string> {
  value: T;
  label: string;
}

const STATUS_OPTIONS: Option<HomeFilters["status"]>[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

const SPLIT_OPTIONS: Option<HomeFilters["split"]>[] = [
  { value: "all", label: "Todos" },
  { value: "split", label: "Splitados" },
  { value: "notSplit", label: "Não splitados" },
];

const ACTIVE_EVENTS_OPTIONS: Option<HomeFilters["activeEvents"]>[] = [
  { value: "all", label: "Todos" },
  { value: "withActive", label: "Com eventos ativos" },
];

const ENCERRADO_OPTIONS: Option<HomeFilters["encerrado"]>[] = [
  { value: "all", label: "Todos" },
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
  const id = useId();
  return (
    <FilterField label={label} htmlFor={id} className="w-44">
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger id={id} className="h-9">
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
    </FilterField>
  );
}

interface FiltersProps {
  filters: HomeFilters;
  today: string;
  onChange: (patch: Partial<HomeFilters>) => void;
  /** Informado só quando há filtro ativo: mostra o botão "Limpar filtros". */
  onClear?: () => void;
}

export function Filters({ filters, today, onChange, onClear }: FiltersProps) {
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
    <div className={FILTER_BAR_CLASS}>
      <FilterField label="Buscar" htmlFor="home-search" className="w-64">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="home-search"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Buscar cliente..."
            className="h-9 pl-8"
          />
        </div>
      </FilterField>

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

      <div role="group" aria-labelledby="home-period-label" className="flex flex-col gap-1">
        <span id="home-period-label" className="text-xs font-medium leading-none text-oi-text-muted">
          Período das vendas
        </span>
        <div className="flex min-h-9 items-center">
          <PillToggle options={PERIOD_OPTIONS} value={period} onChange={selectPeriod} />
        </div>
      </div>
      {period === "custom" && (
        <>
          <FilterField label="De" htmlFor="home-date-start" className="w-40">
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
              className="h-9"
            />
          </FilterField>
          <FilterField label="Até" htmlFor="home-date-end" className="w-40">
            <Input
              id="home-date-end"
              type="date"
              value={customEnd}
              min={customStart || undefined}
              max={today}
              onChange={(e) => onChange({ customEnd: e.target.value })}
              className="h-9"
            />
          </FilterField>
        </>
      )}
      {invalidRange && (
        <p role="alert" className="flex min-h-9 items-center text-sm text-destructive">
          Data inicial depois da final.
        </p>
      )}
      {onClear && (
        <Button type="button" size="sm" variant="ghost" className="h-9" onClick={onClear}>
          <X className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

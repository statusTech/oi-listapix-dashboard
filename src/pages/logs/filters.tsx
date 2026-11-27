import { useId, type ReactNode } from "react";
import { FILTER_BAR_CLASS, FilterField } from "@/components/layout/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// O Select do Radix não aceita item com valor vazio; o "todos" usa este.
const ALL = "__all__";
const CONTROL_CLASS = "h-9";

export function FiltersForm({
  children,
  onSearch,
  onClear,
}: {
  children: ReactNode;
  onSearch: () => void;
  onClear: () => void;
}) {
  return (
    <form
      className={FILTER_BAR_CLASS}
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      {children}
      <Button type="submit" size="sm" className="h-9 bg-oi-blue text-white hover:bg-oi-blue/90">
        Buscar
      </Button>
      <Button type="button" size="sm" variant="ghost" className="h-9" onClick={onClear}>
        Limpar filtros
      </Button>
    </form>
  );
}

export function TextFilter({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  className,
}: {
  label: string;
  type?: "text" | "date";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  /** Largura do campo no desktop. */
  className?: string;
}) {
  const id = useId();
  return (
    <FilterField label={label} htmlFor={id} className={cn(type === "date" ? "w-40" : "w-52", className)}>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={CONTROL_CLASS}
      />
    </FilterField>
  );
}

export function SelectFilter<T extends string>({
  label,
  allLabel = "Todos",
  value,
  options,
  onChange,
}: {
  label: string;
  allLabel?: string;
  value: T | "";
  options: { value: T; label: string }[];
  onChange: (value: T | "") => void;
}) {
  const id = useId();
  return (
    <FilterField label={label} htmlFor={id} className="w-44">
      <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? "" : (v as T))}>
        <SelectTrigger id={id} className={CONTROL_CLASS}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
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

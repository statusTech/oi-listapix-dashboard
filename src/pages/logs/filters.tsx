import { useId, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// O Select do Radix não aceita item com valor vazio; o "todos" usa este.
const ALL = "__all__";
const CONTROL_CLASS = "h-9 text-[13px]";

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
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      {children}
      {/* Em 4 colunas, as duas telas deixam um campo na última linha: os botões ocupam o resto. */}
      <div className="col-span-full flex flex-wrap items-end justify-end gap-2 lg:col-span-3">
        <Button type="button" size="sm" variant="ghost" onClick={onClear}>
          Limpar filtros
        </Button>
        <Button type="submit" size="sm" className="bg-oi-blue text-white hover:bg-oi-blue/90">
          Buscar
        </Button>
      </div>
    </form>
  );
}

export function TextFilter({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: "text" | "date";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <FormField label={label} htmlFor={id} className="min-w-0">
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={CONTROL_CLASS}
      />
    </FormField>
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
    <FormField label={label} htmlFor={id} className="min-w-0">
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
    </FormField>
  );
}

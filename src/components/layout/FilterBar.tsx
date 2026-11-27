import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Barra de filtros do painel; no celular, um campo por linha. */
export const FILTER_BAR_CLASS = "flex flex-wrap items-end gap-3 max-md:flex-col max-md:items-stretch";

export function FilterField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  /** Largura do campo no desktop (no celular ocupa a linha toda). */
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className, "max-md:w-full")}>
      <Label htmlFor={htmlFor} className="text-xs font-medium text-oi-text-muted">
        {label}
      </Label>
      {children}
    </div>
  );
}

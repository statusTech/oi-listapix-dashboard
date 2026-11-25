import type { ComponentProps, ReactNode } from "react";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

export function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-neutral-600">{label}</Label>
      {children}
    </div>
  );
}

export function FilterSelect({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

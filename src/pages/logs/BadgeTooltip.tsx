import { useState } from "react";
import { Portal } from "@radix-ui/react-tooltip";
import { badgeVariants, type BadgeProps } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BadgeTooltipProps {
  label: string;
  /** Texto completo e código, mostrados no tooltip. */
  text: string;
  code: string;
  variant?: BadgeProps["variant"];
}

export function BadgeTooltip({ label, text, code, variant }: BadgeTooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        className={cn(badgeVariants({ variant }), "max-w-[14rem] cursor-pointer")}
        // O Radix fecha o tooltip no clique; no toque é o clique que precisa abrir.
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        <span className="truncate">{label}</span>
      </TooltipTrigger>
      <Portal>
        <TooltipContent className="z-[1302] max-w-[18rem] break-words">
          <p>{text}</p>
          <p className="font-mono text-xs text-muted-foreground">{code}</p>
        </TooltipContent>
      </Portal>
    </Tooltip>
  );
}

"use client"

import { AlertCircle, CheckCircle2, type LucideIcon } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastProps,
} from "@/components/ui/toast"

const VARIANT_ICON: Partial<Record<NonNullable<ToastProps["variant"]>, LucideIcon>> = {
  destructive: AlertCircle,
  success: CheckCircle2,
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={3000}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon = variant ? VARIANT_ICON[variant] : undefined
        return (
          <Toast key={id} variant={variant} {...props}>
            {Icon && <Icon className="h-5 w-5 shrink-0" />}
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

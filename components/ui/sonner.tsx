"use client"

import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/** Dark-only toasts styled with Neon Pink tokens. */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-np-success" />,
        info: <InfoIcon className="size-4 text-np-text-secondary" />,
        warning: <TriangleAlertIcon className="size-4 text-np-warning" />,
        error: <OctagonXIcon className="size-4 text-np-danger" />,
        loading: <Loader2Icon className="size-4 animate-spin text-np-accent-text" />,
      }}
      style={
        {
          "--normal-bg": "var(--np-bg-3)",
          "--normal-text": "var(--np-text-primary)",
          "--normal-border": "var(--np-border-subtle)",
          "--border-radius": "var(--np-radius-lg)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast shadow-np-popover",
          description: "text-np-text-secondary",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

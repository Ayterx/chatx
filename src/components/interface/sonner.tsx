"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

export const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="dark"
    className="toaster group"
    style={
      {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)"
      } as React.CSSProperties
    }
    {...props}
  />
)

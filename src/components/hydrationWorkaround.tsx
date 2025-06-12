"use client"

// ! Fixes the first paint store hydration issue at the cost of a small content flash
import dynamic from "next/dynamic"

export const __internal_HydrationWorkaround = ({ children }: { children: React.ReactNode }) =>
  children

export const HydrationWorkaround = dynamic(
  () => import("./hydrationWorkaround").then((mod) => mod.__internal_HydrationWorkaround),
  {
    ssr: false
  }
)

"use client"

import { ConvexAuthProvider } from "@convex-dev/auth/react"
import { ConvexReactClient } from "convex/react"

import { env } from "~/env"

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL)

export const ConvexClientProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConvexAuthProvider client={convex} storageNamespace="main">
      {children}
    </ConvexAuthProvider>
  )
}

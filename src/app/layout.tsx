import type { Metadata } from "next"

import "~/styles/globals.css"

import clsx from "clsx"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

import { HydrationWorkaround } from "~/components/hydrationWorkaround"
import { Sidebar } from "~/components/sidebar"
import { ConvexClientProvider } from "~/providers/convex"

export const metadata: Metadata = {
  title: "ChatX"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={clsx(
          "relative flex overflow-x-hidden bg-neutral-950 font-sans text-neutral-100 antialiased lg:bg-neutral-900",
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        <ConvexClientProvider>
          <HydrationWorkaround>
            <Sidebar />

            <div className="h-svh flex-1 max-lg:pt-2 lg:p-2 lg:ps-0">
              <main className="flex h-full flex-col rounded-2xl border-neutral-800 px-2 lg:border lg:bg-neutral-950 lg:p-2">
                {children}
              </main>
            </div>
          </HydrationWorkaround>
        </ConvexClientProvider>
      </body>
    </html>
  )
}

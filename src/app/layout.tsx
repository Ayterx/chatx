import type { Metadata } from "next"

import "~/styles/globals.css"

import clsx from "clsx"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

import { HydrationWorkaround } from "~/components/hydrationWorkaround"

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
        <HydrationWorkaround>
          <header className="h-svh w-64 rounded-se-2xl border-e border-t border-neutral-800 bg-neutral-900 p-4 max-lg:fixed max-lg:-translate-x-100 lg:border-none">
            <span className="block text-center text-xl font-bold text-blue-500">ChatX</span>

            <hr className="my-2 border-neutral-800" />
          </header>

          <div className="h-svh flex-1 p-2 ps-0 max-lg:p-0">
            <main className="flex h-full flex-col rounded-2xl border-neutral-800 px-2 lg:border lg:bg-neutral-950 lg:p-2">
              {children}
            </main>
          </div>
        </HydrationWorkaround>
      </body>
    </html>
  )
}

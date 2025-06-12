import type { Metadata } from "next"

import "~/styles/globals.css"

import clsx from "clsx"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

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
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}

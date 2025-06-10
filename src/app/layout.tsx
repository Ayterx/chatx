import type { Metadata } from "next"

import "~/styles/globals.css"

import clsx from "clsx"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

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
          "relative overflow-x-hidden bg-zinc-950 font-sans text-zinc-100 antialiased",
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}

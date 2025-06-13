import { HydrationWorkaround } from "~/components/hydrationWorkaround"
import { Sidebar } from "~/components/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <HydrationWorkaround>
      <Sidebar />

      <div className="h-svh flex-1 max-lg:pt-2 lg:ps-0 lg:pt-2">
        <main className="flex h-full flex-col rounded-ss-2xl border-neutral-800 px-2 lg:border-t lg:border-l lg:bg-neutral-950 lg:p-2">
          {children}
        </main>
      </div>
    </HydrationWorkaround>
  )
}

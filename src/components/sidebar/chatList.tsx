import { useMemo } from "react"
import Link, { useLinkStatus } from "next/link"
import { usePathname } from "next/navigation"
import { api } from "api"
import clsx from "clsx"
import { useSpinDelay } from "spin-delay"

const LoadingIndicator = () => {
  const { pending } = useLinkStatus()

  const showSpinner = useSpinDelay(pending, { delay: 500, minDuration: 200 })

  return (
    showSpinner && (
      <div className="absolute end-2 size-4 animate-spin rounded-full border-2 border-neutral-100 border-t-transparent" />
    )
  )
}

type Chat = (typeof api.chat.getChats)["_returnType"][number]

export const ChatList = ({ chats }: { chats: Chat[] }) => {
  const pathname = usePathname()

  const organizedChats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterday = today - 24 * 60 * 60 * 1000
    const last7Days = today - 7 * 24 * 60 * 60 * 1000
    const last30Days = today - 30 * 24 * 60 * 60 * 1000

    const categories = {
      pinned: [] as Chat[],
      today: [] as Chat[],
      yesterday: [] as Chat[],
      last7Days: [] as Chat[],
      last30Days: [] as Chat[],
      older: [] as Chat[]
    }

    chats.forEach((chat) => {
      if (chat.pinned) {
        categories.pinned.unshift(chat)
      } else if (chat.createdAt >= today) {
        categories.today.unshift(chat)
      } else if (chat.createdAt >= yesterday) {
        categories.yesterday.unshift(chat)
      } else if (chat.createdAt >= last7Days) {
        categories.last7Days.unshift(chat)
      } else if (chat.createdAt >= last30Days) {
        categories.last30Days.unshift(chat)
      } else {
        categories.older.unshift(chat)
      }
    })

    return categories
  }, [chats])

  const renderCategory = (title: string, chats: Chat[]) => {
    if (chats.length === 0) return null

    return (
      <div className="w-full">
        <span className="mb-1 block px-2 text-xs font-medium text-neutral-400">{title}</span>
        <ol className="flex flex-col gap-1">
          {chats.map((chat) => (
            <li key={chat.docId}>
              <Link
                href={`/chat/${chat.chatId}`}
                className={clsx(
                  "relative flex w-full items-center rounded-md py-2 ps-2 pe-8 text-sm transition-colors",
                  {
                    "bg-neutral-800": pathname === `/chat/${chat.chatId}`,
                    "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 focus:bg-neutral-800 focus:text-neutral-100":
                      pathname !== `/chat/${chat.chatId}`
                  }
                )}
              >
                {chat.title}
                <LoadingIndicator />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    )
  }

  return (
    <>
      {renderCategory("Pinned", organizedChats.pinned)}
      {renderCategory("Today", organizedChats.today)}
      {renderCategory("Yesterday", organizedChats.yesterday)}
      {renderCategory("Last 7 days", organizedChats.last7Days)}
      {renderCategory("Last 30 days", organizedChats.last30Days)}
      {renderCategory("Older", organizedChats.older)}
    </>
  )
}

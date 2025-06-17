import { useMemo, useState } from "react"
import Link, { useLinkStatus } from "next/link"
import { usePathname } from "next/navigation"
import { EllipsisHorizontalIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid"
import { api } from "api"
import clsx from "clsx"
import { useMutation } from "convex/react"
import { PinIcon } from "lucide-react"
import { useSpinDelay } from "spin-delay"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "~/components/interface/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/interface/dropdown-menu"
import { Button } from "../interface/button"

const LoadingIndicator = () => {
  const { pending } = useLinkStatus()

  const showSpinner = useSpinDelay(pending, { delay: 500, minDuration: 200 })

  return (
    showSpinner && (
      <div className="size-4 animate-spin rounded-full border-2 border-neutral-100 border-t-transparent" />
    )
  )
}

type Chat = (typeof api.chat.getChats)["_returnType"][number]

export const ChatList = ({ chats }: { chats: Chat[] }) => {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const pathname = usePathname()

  const updateChat = useMutation(api.chat.updateTitle)
  const deleteChat = useMutation(api.chat.deleteChat)
  const togglePin = useMutation(api.chat.togglePin)

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
            <li key={chat.docId} className="relative">
              <Link
                href={`/chat/${chat.chatId}`}
                className={clsx(
                  "group relative flex w-full items-center gap-1 overflow-hidden rounded-md py-2 ps-2 pe-8 text-sm transition-colors",
                  {
                    "bg-neutral-800": pathname === `/chat/${chat.chatId}`,
                    "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 focus:bg-neutral-800 focus:text-neutral-100":
                      pathname !== `/chat/${chat.chatId}`
                  }
                )}
              >
                {chat.parentChatId && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4 text-neutral-400"
                  >
                    <path d="M6.02,5.78m0,15.31V4.55m0,0v-1.91m0,3.14v-1.23m0,1.23c0,1.61,1.21,3.11,3.2,3.94l4.58,1.92c1.98,.83,3.2,2.32,3.2,3.94v3.84" />
                    <path d="M20.53,17.59l-3.41,3.66-3.66-3.41" />
                  </svg>
                )}
                <span className="truncate">{chat.title}</span>
                <div className="absolute end-0 flex h-full items-center gap-2 px-2 transition-colors group-hover:bg-neutral-800/50">
                  <LoadingIndicator />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="relative rounded-sm group-hover:opacity-100 group-focus:opacity-100 lg:opacity-0">
                        <EllipsisHorizontalIcon className="size-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onSelect={(e) => {
                          e.preventDefault()
                          togglePin({ id: chat.docId })
                        }}
                      >
                        <PinIcon className="size-4" />
                        {chat.pinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onSelect={(e) => {
                              e.preventDefault()
                              setIsRenameDialogOpen(true)
                            }}
                          >
                            <PencilIcon className="size-4" />
                            Rename
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Rename Chat</DialogTitle>
                            <form
                              onSubmit={async (event) => {
                                event.preventDefault()

                                const formData = new FormData(event.currentTarget)
                                const title = formData.get("title")

                                if (title === chat.title) return

                                await updateChat({ id: chat.docId, title: title as string })
                                setIsRenameDialogOpen(false)
                              }}
                            >
                              <input
                                type="text"
                                name="title"
                                className="w-full rounded-md bg-neutral-800 px-2 py-1 outline-none"
                                defaultValue={chat.title}
                              />
                            </form>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            className="flex items-center gap-2"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <TrashIcon className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Chat</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete &quot;{chat.title}&quot;? This action
                              cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button
                                variant="destructive"
                                onClick={() => deleteChat({ id: chat.docId })}
                              >
                                Delete
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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

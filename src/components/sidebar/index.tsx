"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { api } from "api"
import clsx from "clsx"
import { useQuery } from "convex/react"
import { EllipsisVerticalIcon, LogInIcon, PanelLeft, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "../interface/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../interface/dialog"
import { Tooltipy } from "../interface/tooltip"
import { ChatList } from "./chatList"

export const UserInfo = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [apiKey] = useState(() => localStorage.getItem("openrouter-api-key") ?? "")

  const [isPending, startTransition] = useTransition()

  const session = useQuery(api.account.me)

  if (session === undefined) return null

  if (session === "unauthorized")
    return (
      <Link
        href="/auth"
        className="flex items-center gap-2 rounded-md p-2 font-medium transition-colors hover:bg-neutral-800"
      >
        <LogInIcon className="size-5" />
        Sign In
      </Link>
    )

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center justify-between gap-2 rounded-md p-2 transition-colors hover:bg-neutral-800">
          <div className="flex items-center gap-2">
            <Image
              src={session.image}
              alt={session.name}
              width={32}
              height={32}
              className="size-8 min-w-8 rounded-sm"
            />
            <span className="block max-h-12 overflow-hidden text-left text-sm leading-none font-medium">
              {session.name}
            </span>
          </div>

          <EllipsisVerticalIcon className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OpenRouter API Key</DialogTitle>
          <DialogDescription>
            Your OpenRouter API key is saved in your browser&apos;s local storage and sent with
            every request.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={async (event) => {
            event.preventDefault()

            const formData = new FormData(event.currentTarget)
            const formApiKey = formData.get("apiKey") as string

            if (!formApiKey || formApiKey === apiKey) return

            startTransition(async () => {
              const request = await fetch("https://openrouter.ai/api/v1/key", {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${formApiKey}`
                }
              })

              const data = await request.json()

              console.log(data)

              if (!request.ok) {
                toast.error("Invalid API key", { position: "top-center" })
                return
              }

              localStorage.setItem("openrouter-api-key", formApiKey)

              toast.success("API key saved", { position: "top-center" })
              setIsDialogOpen(false)
            })
          }}
          className="flex flex-col gap-2"
        >
          <input
            type="password"
            name="apiKey"
            placeholder="Key"
            defaultValue={apiKey}
            className="w-full rounded-md bg-neutral-800 px-2 py-1 outline-none"
          />
          <Button type="submit" className="self-end" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const chats = useQuery(api.chat.getChats)

  const pathname = usePathname()

  const clickOutSideRef = useRef<HTMLElement>(null)

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        clickOutSideRef.current &&
        !clickOutSideRef.current.contains(target) &&
        target.tagName.toLowerCase() !== "html"
      ) {
        setIsMenuOpen(false)
      }
    },
    [setIsMenuOpen]
  )

  useEffect(() => {
    const controller = new AbortController()

    document.addEventListener("mousedown", handleClickOutside, { signal: controller.signal })

    return () => controller.abort()
  }, [handleClickOutside])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname, setIsMenuOpen])

  useLayoutEffect(() => {
    setIsDesktop(window.innerWidth > 1024)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const handleResize = () => setIsDesktop(window.innerWidth > 1024)

    window.addEventListener("resize", handleResize, { signal: controller.signal })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true)
    }, 500)
  }, [])

  return (
    <>
      {!isDesktop && (
        <div className="fixed top-2 left-2 z-49 flex items-center gap-2 rounded-md bg-neutral-900 px-2 py-1.5">
          <button className="block" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <PanelLeft className="size-4" />
          </button>
          <Link href="/">
            <PlusIcon className="size-4" />
          </Link>
        </div>
      )}
      <header
        ref={clickOutSideRef}
        className={clsx(
          "z-50 h-svh w-64 rounded-se-2xl border-e border-t border-neutral-800 bg-neutral-900 px-2.5 py-1 max-lg:fixed lg:border-none lg:p-4",
          {
            "translate-x-0": isMenuOpen && !isDesktop,
            "-translate-x-full": !isMenuOpen && !isDesktop,
            "transition-transform": isMounted
          }
        )}
      >
        <div className="grid grid-cols-3 items-center">
          <div />

          <div className="block text-center text-xl font-bold text-blue-500">ChatX</div>

          {!isDesktop ? (
            <button className="block justify-self-end" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <PanelLeft className="size-4" />
            </button>
          ) : (
            <Tooltipy content="New chat">
              <Link
                href="/"
                className="justify-self-end rounded-sm p-0.5 transition-colors hover:bg-neutral-800"
              >
                <PlusIcon className="size-4" />
              </Link>
            </Tooltipy>
          )}
        </div>

        <hr className="my-2 border-neutral-800" />

        <div className="h-[calc(100svh-7.875rem)] overflow-y-auto *:not-[:nth-child(1)]:mt-4 lg:h-[calc(100svh-8.875rem)]">
          {chats &&
            (chats.length > 0 ? (
              <ChatList chats={chats} />
            ) : (
              <div className="text-muted-foreground text-center text-sm">No chats yet</div>
            ))}
        </div>

        <hr className="my-2 border-neutral-800" />

        <UserInfo />
      </header>
    </>
  )
}

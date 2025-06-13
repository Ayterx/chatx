"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { api } from "api"
import clsx from "clsx"
import { useQuery } from "convex/react"
import { LogInIcon, PanelLeft, PlusIcon } from "lucide-react"

export const UserInfo = () => {
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
    <Link
      href="/settings"
      className="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-neutral-800"
    >
      <div className="flex gap-2">
        <Image
          src={session.image}
          alt={session.name}
          width={32}
          height={32}
          className="size-8 min-w-8 rounded-sm"
        />
        <div>
          <span className="block max-h-12 overflow-hidden text-sm leading-none font-medium">
            {session.name}
          </span>
        </div>
      </div>
    </Link>
  )
}

export const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

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
          {!isDesktop && (
            <button className="block justify-self-end" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <PanelLeft className="size-4" />
            </button>
          )}
        </div>

        <hr className="my-2 border-neutral-800" />

        <UserInfo />
      </header>
    </>
  )
}

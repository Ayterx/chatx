"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import { PanelLeft, PlusIcon } from "lucide-react"

export const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

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

  return (
    <>
      {!isDesktop && (
        <div className="fixed top-2 left-2 z-50 flex items-center gap-2 rounded-md bg-neutral-900 px-2 py-1.5">
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
          "h-svh w-64 rounded-se-2xl border-e border-t border-neutral-800 bg-neutral-900 px-2.5 py-1 transition-transform max-lg:fixed lg:border-none lg:p-4",
          {
            "translate-x-0": isMenuOpen && !isDesktop,
            "-translate-x-full": !isMenuOpen && !isDesktop
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
      </header>
    </>
  )
}

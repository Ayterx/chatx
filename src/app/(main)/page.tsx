"use client"

import { useEffect, unstable_ViewTransition as ViewTransition } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

import { Chat } from "~/components/chat"

export default function Page() {
  // Safari Safari Safari
  const pageId = uuidv4()

  const router = useRouter()

  useEffect(() => {
    router.prefetch(`/chat/${pageId}`)
  }, [pageId, router])

  return (
    <section className="flex flex-[1_1_0] flex-col items-center justify-center">
      <h1 className="pb-4 text-3xl font-medium">What can I help with?</h1>

      <ViewTransition name="input">
        <Chat
          chatStatus="ready"
          submitHandler={(state) => {
            localStorage.setItem("draft_message", state.input.prompt)
            router.push(`/chat/${pageId}`)
          }}
        />
      </ViewTransition>
    </section>
  )
}

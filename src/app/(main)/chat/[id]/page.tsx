"use client"

import { useEffect, unstable_ViewTransition as ViewTransition } from "react"
import { useParams } from "next/navigation"
import { api } from "api"
import { useQuery } from "convex/react"

import { Chat } from "~/components/chat"
import { chatStore } from "~/components/chat/lib/store"
import { ChatMessages } from "./_components/chatMessages"
import { useChat } from "./_lib/useChat"

export default function Page() {
  const params = useParams()

  const chatMessages = useQuery(api.chat.getMessages, {
    chatId: params.id as string
  })

  const chat = useChat({
    chatId: params.id as string,
    initialMessages: chatMessages?.messages ?? []
  })

  useEffect(() => {
    const draft = localStorage.getItem("draft_message")

    if (draft) {
      localStorage.removeItem("draft_message")

      void chat.handleSubmit({
        ...chatStore.getState(),
        input: {
          ...chatStore.getState().input,
          prompt: draft
        }
      })
    }
  }, [chat])

  return (
    <>
      <div
        id="scrollable"
        className="scrollbar-gutter w-full flex-[1_1_0] justify-center overflow-y-auto"
      >
        <ChatMessages {...chat} />
      </div>

      <div className="relative z-49 flex w-full flex-[0_0_auto] justify-center before:pointer-events-none before:absolute before:bottom-full before:h-12 before:w-full before:max-w-3xl before:bg-gradient-to-b before:from-neutral-950/0 before:to-neutral-950 max-lg:pb-2">
        <ViewTransition name="input">
          <Chat
            chatStatus={chat.status}
            submitHandler={chat.handleSubmit}
            stopRequest={chat.stop}
          />
        </ViewTransition>
      </div>
    </>
  )
}

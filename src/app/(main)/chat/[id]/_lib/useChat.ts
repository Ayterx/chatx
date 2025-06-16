import type { UIMessage } from "ai"
import { useCallback, useState } from "react"
import { useChat as useChatSDK } from "@ai-sdk/react"

import { ChatStore, chatStore } from "~/components/chat/lib/store"

const fetcher: typeof fetch = async (url, options) => {
  const { body, ...remainingOptions } = options ?? {}

  let newBody = {}

  if (body)
    try {
      newBody = typeof body === "string" ? (JSON.parse(body) as Record<string, unknown>) : body
    } catch (error) {
      console.error("Failed to parse options.body", error)
    }

  return await fetch(url, {
    ...remainingOptions,
    body: JSON.stringify({
      ...newBody,
      options: {
        model: chatStore.getState().model.id,
        reasoningEffort: chatStore.getState().options.reasoningEffort
      },
      userInfo: {
        apiKey: localStorage.getItem("openrouter-api-key"),
        jwtToken: localStorage.getItem("__convexAuthJWT_main"),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    })
  })
}

export const useChat = ({
  chatId,
  initialMessages
}: {
  chatId: string
  initialMessages: UIMessage[]
}) => {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)

  const { append, error, messages, reload, setMessages, status, stop } = useChatSDK({
    id: chatId,
    initialMessages,
    fetch: fetcher
  })

  const handleEditMessage = useCallback(
    async ({
      editedMessage,
      message,
      messageIndex
    }: {
      messageIndex: number
      message: string
      editedMessage: string
    }) => {
      if (editedMessage === message) {
        setEditingMessageId(null)
        return
      }

      const newText = editedMessage.trim()

      const slicedMessages = messages.slice(0, messageIndex)

      const msg = messages[messageIndex]

      if (!msg) return

      const newMessage = {
        ...msg,
        content: newText,
        parts: msg.parts.map((part) => {
          if (part.type === "text") return { type: "text", text: newText }
          return part
        })
      } satisfies UIMessage

      setMessages([...slicedMessages, newMessage])

      setEditingMessageId(null)

      await reload({
        body: {
          message: newText,
          deleteFrom: messageIndex,
          deleteMode: "edit"
        }
      })
    },
    [messages, reload, setMessages]
  )

  const handleSubmit = useCallback(
    async (state: ChatStore) => {
      const content = state.input.prompt.trim()
      if (content === "") return

      const scroller = document.getElementById("scrollable")

      // wait until the next frame so layout is flushed
      requestAnimationFrame(() => {
        scroller?.scrollTo({
          top: scroller.scrollHeight,
          behavior: "smooth"
        })
      })

      await append({ content, role: "user" }, { body: { message: content } })
    },
    [append]
  )

  const retryMessage = useCallback(
    async (messageIndex: number) => {
      const messageBefore = messages[messageIndex - 1]

      const slicedMessages = messages.slice(0, messageIndex)

      setMessages(slicedMessages)

      await reload({
        body: {
          message: messageBefore?.content,
          deleteFrom: messageIndex,
          deleteMode: "retry"
        }
      })
    },
    [messages, reload, setMessages]
  )

  const retryErroredMessage = useCallback(async () => {
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage) return

    const msgs = messages.slice(0, messages.length - 1)
    setMessages(msgs)

    const store = chatStore.getState()

    await handleSubmit({
      ...store,
      input: {
        ...store.input,
        prompt: messages[messages.length - 1].content
      }
    })
  }, [messages, setMessages, handleSubmit])

  return {
    editingMessageId,
    error,
    handleEditMessage,
    handleSubmit,
    messages,
    retryErroredMessage,
    retryMessage,
    setEditingMessageId,
    status,
    stop
  }
}

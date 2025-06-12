import type { ComponentProps, RefObject } from "react"

import type { ChatProps } from "."
import { chatStore } from "./lib/store"

export const Form = ({
  chatStatus,
  children,
  submitHandler,
  textareaRef
}: ComponentProps<"form"> &
  Pick<ChatProps, "chatStatus" | "submitHandler"> & {
    textareaRef: RefObject<HTMLTextAreaElement | null>
  }) => (
  <form
    onSubmit={(event) => {
      event.preventDefault()
      if (chatStatus !== "ready") return

      const state = chatStore.getState()

      chatStore.setState((state) => ({
        input: {
          ...state.input,
          prompt: "",
          hasTyped: false
        }
      }))

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          Object.assign(textareaRef.current.style, {
            height: ""
          })
          Object.assign(textareaRef.current.style, {
            height: `${textareaRef.current.scrollHeight}px`
          })
        }
      })

      void submitHandler(state)
    }}
  >
    {children}
  </form>
)

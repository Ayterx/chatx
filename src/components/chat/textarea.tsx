import type { ChangeEvent, KeyboardEvent, RefObject } from "react"
import { useStore } from "zustand"

import { isMobile } from "~/lib/utils"
import { chatStore } from "./lib/store"

export const Textarea = ({
  textareaRef
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>
}) => {
  const prompt = useStore(chatStore, (state) => state.input.prompt)

  const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    chatStore.setState((state) => ({
      input: {
        ...state.input,
        prompt: event.target.value
      }
    }))

    if (event.target.value.trim().length > 0)
      chatStore.setState((state) => ({
        input: {
          ...state.input,
          hasTyped: true
        }
      }))
    else
      chatStore.setState((state) => ({
        input: {
          ...state.input,
          hasTyped: false
        }
      }))

    if (textareaRef.current) {
      Object.assign(textareaRef.current.style, {
        height: ""
      })
      Object.assign(textareaRef.current.style, {
        height: `${textareaRef.current.scrollHeight}px`
      })
    }
  }

  const handleOnKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isMobile() && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      const form = event.currentTarget.form
      if (!form) return

      // modern way – will fire React’s onSubmit
      if (typeof form.requestSubmit === "function") {
        form.requestSubmit()
      } else {
        // fallback for older browsers
        form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
      }
    }
  }

  return (
    <textarea
      ref={textareaRef}
      autoFocus
      placeholder="Ask anything"
      className="block h-auto max-h-[60svh] w-full resize-none overflow-hidden overflow-y-auto px-1 pt-1 pb-2 outline-none"
      rows={1}
      value={prompt}
      onChange={handleOnChange}
      onKeyDown={handleOnKeyDown}
    />
  )
}

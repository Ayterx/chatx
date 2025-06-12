import { useRef } from "react"
import { UseChatHelpers } from "@ai-sdk/react"

import { Form } from "./form"
import { ChatStore } from "./lib/store"
import { Options } from "./options"
import { SubmitButton } from "./submitButton"
import { Textarea } from "./textarea"

export interface ChatProps {
  chatStatus: UseChatHelpers["status"]
  submitHandler: (state: ChatStore) => void | Promise<void>
  stopRequest?: () => void
}

export const Chat = ({ chatStatus, submitHandler, stopRequest }: ChatProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div className="w-full max-w-3xl rounded-xl border border-neutral-800/50 bg-neutral-900 p-1">
      <Form chatStatus={chatStatus} submitHandler={submitHandler} textareaRef={textareaRef}>
        <Textarea textareaRef={textareaRef} />
        <div className="flex justify-between pt-2">
          <Options />
          <div className="flex items-end gap-2">
            <SubmitButton chatStatus={chatStatus} stopRequest={stopRequest} />
          </div>
        </div>
      </Form>
    </div>
  )
}

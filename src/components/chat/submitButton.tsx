import { ArrowUpIcon, StopIcon } from "@heroicons/react/24/solid"
import clsx from "clsx"
import { useStore } from "zustand"

import { ChatProps } from "."
import { chatStore } from "./lib/store"

export const SubmitButton = ({
  chatStatus,
  stopRequest
}: Pick<ChatProps, "chatStatus" | "stopRequest">) => {
  const hasTyped = useStore(chatStore, (state) => state.input.hasTyped)

  return (
    <button
      type={chatStatus === "ready" ? "submit" : "button"}
      disabled={!hasTyped && chatStatus === "ready"}
      data-active={hasTyped || chatStatus === "streaming" || chatStatus === "submitted"}
      onMouseDown={() => {
        if (chatStatus === "streaming" && stopRequest) stopRequest()
      }}
      className={clsx(
        "flex items-center gap-2 rounded-md p-2 transition-colors",
        "data-[active=false]:bg-neutral-800 data-[active=false]:hover:bg-neutral-700",
        "data-[active=true]:bg-neutral-100 data-[active=true]:text-neutral-900 data-[active=true]:hover:bg-neutral-400 data-[active=true]:focus:bg-neutral-400"
      )}
    >
      {chatStatus === "submitted" ? (
        <div className="size-5 animate-spin rounded-full border-3 border-neutral-900 border-t-transparent" />
      ) : chatStatus === "streaming" ? (
        <StopIcon className="size-5" />
      ) : (
        <ArrowUpIcon className="size-5" />
      )}
    </button>
  )
}

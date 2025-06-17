import { RefreshCcwIcon } from "lucide-react"

import { chatStore } from "~/components/chat/lib/store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "~/components/interface/dropdown-menu"
import { Tooltipy } from "~/components/interface/tooltip"
import { featureIcon, models } from "~/lib/models"
import { useChat } from "../_lib/useChat"
import { actionButtonStyle } from "./chatMessages"

export const RetryMessage = ({
  retryMessage,
  messageIndex
}: {
  retryMessage: Pick<ReturnType<typeof useChat>, "retryMessage">["retryMessage"]
  messageIndex: number
}) => {
  return (
    <DropdownMenu>
      <Tooltipy content="Retry">
        <DropdownMenuTrigger asChild>
          <button className={actionButtonStyle}>
            <RefreshCcwIcon className="size-4" />
          </button>
        </DropdownMenuTrigger>
      </Tooltipy>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Models</DropdownMenuLabel>
        {Object.values(models).map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={async () => {
              chatStore.setState((state) => {
                return {
                  ...state,
                  model: model
                }
              })
              await retryMessage(messageIndex)
            }}
          >
            {model.name}
            {model.subName && <span className="text-xs text-neutral-400">({model.subName})</span>}
            <DropdownMenuShortcut>
              {model.features
                ?.filter((f) => f !== "reasoningEffort")
                .map((i) => {
                  const Icon = featureIcon[i]

                  return <Icon key={i} className="size-4" />
                })}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

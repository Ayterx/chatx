import clsx from "clsx"
import { Brain } from "lucide-react"
import { useStore } from "zustand"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "~/components/interface/select"
import { selectTriggerStyle } from "."
import { chatStore } from "../lib/store"

export const ReasoningEffortsOption = () => {
  const model = useStore(chatStore, (state) => state.model)

  if (model.features?.includes("reasoningEffort"))
    return (
      <Select
        defaultValue="high"
        onValueChange={(value) =>
          chatStore.setState((state) => ({
            options: { ...state.options, reasoningEffort: value }
          }))
        }
      >
        <SelectTrigger className={clsx(selectTriggerStyle, "border-none capitalize")}>
          <Brain className="size-4" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent onCloseAutoFocus={(event) => event.preventDefault()}>
          <SelectGroup>
            <SelectLabel>Efforts</SelectLabel>
            {["high", "medium", "low"].map((effort) => (
              <SelectItem
                key={`model ${model.id} effort ${effort}`}
                value={effort}
                className="capitalize"
              >
                {effort}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
}

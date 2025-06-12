import clsx from "clsx"

import { ModelOption } from "./model"
import { ReasoningEffortsOption } from "./reasoningEfforts"

export const selectTriggerStyle = clsx(
  "bg-input/30 hover:bg-input/50 flex h-fit items-center gap-1 rounded-lg py-2 ps-3 pe-4 text-sm font-medium transition-colors outline-none"
)

export const Options = () => (
  <div className="flex items-end gap-1">
    <ModelOption />
    <ReasoningEffortsOption />
  </div>
)

import clsx from "clsx"
import { ArrowUpIcon } from "lucide-react"

import { isMobile } from "~/lib/utils"

interface EditMessageProps {
  defaultValue: string
  handleEditMessage: (editedMessage: string) => Promise<void>
}

export const EditMessage = ({ defaultValue, handleEditMessage }: EditMessageProps) => (
  <form
    className="relative block w-full pb-7"
    onSubmit={async (event) => {
      event.preventDefault()

      const formData = new FormData(event.currentTarget)

      const editedMessage = formData.get("editedMessage") as string

      if (!editedMessage) return

      await handleEditMessage(editedMessage)
    }}
  >
    <textarea
      ref={(ref) => {
        if (ref) {
          // reset height on mount to match content
          ref.style.height = ""
          ref.style.height = `${ref.scrollHeight}px`

          ref.focus()

          // move selection to end
          const length = ref.value.length
          ref.setSelectionRange(length, length)
        }
      }}
      name="editedMessage"
      defaultValue={defaultValue}
      rows={1}
      onChange={(event) => {
        event.target.style.height = ""
        event.target.style.height = `${event.target.scrollHeight}px`
      }}
      onKeyDown={(event) => {
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
      }}
      className="block h-fit w-full resize-none overflow-hidden outline-none disabled:opacity-50"
    />
    <button
      type="submit"
      className={clsx(
        "absolute -end-1 bottom-0 flex items-center gap-2 rounded-full p-1 transition-colors",
        "bg-neutral-100 text-neutral-900 hover:bg-neutral-400 focus:bg-neutral-400"
      )}
    >
      <ArrowUpIcon className="size-5" />
    </button>
  </form>
)

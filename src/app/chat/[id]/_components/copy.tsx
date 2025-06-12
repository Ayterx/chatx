import { useState } from "react"
import { Check, CopyIcon } from "lucide-react"

import { actionButtonStyle } from "~/app/chat/[id]/_components/chatMessages"

export const Copy = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  return (
    <button className={actionButtonStyle} onClick={handleCopy}>
      {copied ? <Check className="size-4" /> : <CopyIcon className="size-4" />}
    </button>
  )
}

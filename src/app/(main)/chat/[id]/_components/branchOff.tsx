import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { api } from "api"
import { useMutation } from "convex/react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { actionButtonStyle } from "./chatMessages"

export const BranchOff = ({ chatId, messageIndex }: { chatId: string; messageIndex: number }) => {
  const [isPending, startTransition] = useTransition()

  const branchOff = useMutation(api.chat.branchOff)

  const router = useRouter()

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const data = await branchOff({ chatId, messageIndex })

          console.log(data)

          if (!data) toast.error("Failed to branch off")
          else router.push(`/chat/${data.chatId}`)
        })
      }
      className={actionButtonStyle}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="M6.02,5.78m0,15.31V4.55m0,0v-1.91m0,3.14v-1.23m0,1.23c0,1.61,1.21,3.11,3.2,3.94l4.58,1.92c1.98,.83,3.2,2.32,3.2,3.94v3.84" />
          <path d="M20.53,17.59l-3.41,3.66-3.66-3.41" />
        </svg>
      )}
    </button>
  )
}

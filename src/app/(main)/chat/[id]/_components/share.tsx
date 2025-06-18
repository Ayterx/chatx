import { useState, useTransition } from "react"
import { api } from "api"
import { useMutation } from "convex/react"
import { ShareIcon } from "lucide-react"

import { Button } from "~/components/interface/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "~/components/interface/dialog"
import { Input } from "~/components/interface/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/interface/select"
import { Tooltipy } from "~/components/interface/tooltip"
import { actionButtonStyle } from "./chatMessages"
import { Copy } from "./copy"

export const Share = ({ chatId, messageIndex }: { chatId: string; messageIndex: number }) => {
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const createShareLink = useMutation(api.share.createShareLink)

  return (
    <Dialog>
      <Tooltipy content="Share from this point">
        <DialogTrigger asChild>
          <button className={actionButtonStyle}>
            <ShareIcon className="size-4" />
          </button>
        </DialogTrigger>
      </Tooltipy>

      <DialogContent>
        <DialogHeader>
          {shareLink ? (
            <>
              <DialogTitle>Share Link</DialogTitle>
              <DialogDescription className="flex w-full gap-2">
                <Input defaultValue={`${window.location.origin}/share/${shareLink}`} readOnly />
                <Copy text={`${window.location.origin}/share/${shareLink}`} />
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>Share</DialogTitle>
              <DialogDescription>
                Share the current message and all subsequent messages.
              </DialogDescription>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target as HTMLFormElement)
                  const validFor = formData.get("validFor")

                  startTransition(async () => {
                    const shareLink = await createShareLink({
                      chatId,
                      messageIndex,
                      validFor: Number(validFor)
                    })
                    setShareLink(shareLink)
                  })
                }}
              >
                <Select name="validFor" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Valid for" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="mt-2" disabled={isPending}>
                  {isPending ? "Creating..." : "Create share link"}
                </Button>
              </form>
            </>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

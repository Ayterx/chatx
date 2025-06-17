import { ShareIcon } from "lucide-react"

import { Tooltipy } from "~/components/interface/tooltip"
import { actionButtonStyle } from "./chatMessages"

export const Share = () => {
  return (
    <Tooltipy content="Share from this point">
      <button className={actionButtonStyle}>
        <ShareIcon className="size-4" />
      </button>
    </Tooltipy>
  )
}

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger
} from "@radix-ui/react-accordion"
import { BrainIcon, ChevronDownIcon } from "lucide-react"

export const Reasoning = ({ children }: { children: React.ReactNode }) => {
  return (
    <Accordion type="single" collapsible className="mb-4 rounded-lg border">
      <AccordionItem value="thinking">
        <AccordionHeader>
          <AccordionTrigger className="group relative flex h-10 w-full items-center justify-between gap-2 px-3 font-medium">
            <div className="flex items-center gap-2">
              <BrainIcon className="size-4" />
              <span className="block leading-none font-medium">Reasoning</span>
              <ChevronDownIcon className="size-4 translate-y-0.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden px-3 pt-0 pb-2 text-sm text-neutral-400">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

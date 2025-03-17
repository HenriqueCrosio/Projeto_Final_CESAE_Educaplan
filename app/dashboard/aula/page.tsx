"use client"
import { ChatForm } from "@/components/chat-form"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function Aula() {
  return (
    <div className="grid grid-cols-4 h-[calc(100dvh-3.5rem)]">
      <div className="col-span-3"></div>
      <div className="col-span-1 bg-gray-100 pt-8">
        <TooltipProvider delayDuration={0}>
          <div className="h-full overflow-hidden">
            <ChatForm className="h-full w-full" />
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}


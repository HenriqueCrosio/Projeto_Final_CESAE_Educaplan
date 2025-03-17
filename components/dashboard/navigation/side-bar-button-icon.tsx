import type React from "react"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import type { IconName } from "./side-bar-button-icons"

const DynamicIcon = dynamic(() => import("./side-bar-button-icons"), {
  loading: () => <div className="h-6 w-6 bg-gray-300 animate-pulse rounded-full" />,
})

export const SideBarButtonIcon: React.FC<{ name: IconName; size?: number; className?: string }> = ({
  name,
  size,
  className,
}) => {
  return (
    <Suspense fallback={<div className="h-6 w-6 bg-gray-300 animate-pulse " />}>
      <DynamicIcon name={name} size={size} className={className || "h-6 w-6 mb-1"} />
    </Suspense>
  )
}


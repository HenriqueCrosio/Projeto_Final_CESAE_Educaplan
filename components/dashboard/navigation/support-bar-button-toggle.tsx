"use client"

import type React from "react"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigationStore } from "@/store/navigation.store"

export const SupportBarButtonToggle: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  ...props
}) => {
  const { isSecondaryNavCollapsed, toggleSecondaryNav } = useNavigationStore()

  return (
    <button
      onClick={toggleSecondaryNav}
      className={cn(
        "p-2 rounded-full bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200",
        "transition-all",
        isSecondaryNavCollapsed ? "-mr-4" : "",
        className,
      )}
      aria-label={isSecondaryNavCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      {...props}
    >
      {isSecondaryNavCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
    </button>
  )
}

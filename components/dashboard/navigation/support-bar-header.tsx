import type React from "react"
import { cn } from "@/lib/utils"
import type { NavGroup } from "@/types/navigation.types"
import { ChevronDown, ChevronRight } from "lucide-react"

interface SupportBarHeaderProps {
  group: NavGroup
  isOpen: boolean
  toggleGroup: () => void
}

export const SupportBarHeader: React.FC<SupportBarHeaderProps> = ({ group, isOpen, toggleGroup }) => {
  return (
    <>
      <div className={cn("flex items-center", group.type === "body" && "cursor-pointer")} onClick={toggleGroup}>
        {group.color &&
          <div className={cn(`bg-[${group.color}]`, "h-40 w-40 mb-2")}></div>
        }
        <h3
          className={cn(
            "font-medium mb-2 flex-grow",
            group.type === "header" ? "text-md text-gray-700" : "text-sm text-gray-500",
          )}
        >
          {group.name}
        </h3>
        {group.type === "body" && (
          <span className="ml-2">
            {isOpen ? (
              <ChevronDown className="h-3 w-3 fill-current text-gray-400" />
            ) : (
              <ChevronRight className="h-3 w-3 fill-current text-gray-400" />
            )}
          </span>
        )}
      </div>
      {group.description && <p className="text-xs text-gray-400 mb-2">{group.description}</p>}
    </>
  )
}


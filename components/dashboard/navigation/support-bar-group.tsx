"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { NavGroup, NavGroupItem } from "@/types/navigation.types"
import { SupportBarItem } from "./support-bar-item"
import { SupportBarHeader } from "./support-bar-header"

interface SupportBarGroupProps {
  group: NavGroup
  onItemClick: (item: NavGroupItem) => void
  activeCollapsibleSidebarItem: NavGroupItem | null
}

export const SupportBarGroup: React.FC<SupportBarGroupProps> = ({
  group,
  onItemClick,
  activeCollapsibleSidebarItem,
}) => {
  const [isOpen, setIsOpen] = useState(group.type !== "body")

  useEffect(() => {
    if (group.type === "body" && activeCollapsibleSidebarItem) {
      const containsActiveItem = group.children.some(
        (item) =>
          item.id === activeCollapsibleSidebarItem.id ||
          (item.children && item.children.some((child) => child.id === activeCollapsibleSidebarItem.id)),
      )
      if (containsActiveItem) {
        setIsOpen(true)
      }
    }
  }, [group, activeCollapsibleSidebarItem])

  const toggleGroup = useCallback(() => {
    if (group.type === "body") {
      setIsOpen((prev) => !prev)
    }
  }, [group.type])

  return (
    <div className={cn("w-full", group.type === "header" ? "mb-6 pb-4 border-b border-gray-200" : "mb-4")}>
      <SupportBarHeader group={group} isOpen={isOpen} toggleGroup={toggleGroup} />
      {isOpen && (
        <ul className="w-full">
          {group.children.map((item) => (
            <SupportBarItem key={item.id} item={item} onItemClick={onItemClick} />
          ))}
        </ul>
      )}
    </div>
  )
}


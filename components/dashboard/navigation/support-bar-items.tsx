"use client"

import type React from "react"
import { useCallback } from "react"
import { useNavigation } from "@/providers/navigation-provider"
import type { NavGroup, NavGroupItem } from "@/types/navigation.types"
import { SupportBarGroup } from "./support-bar-group"

interface SupportBarItemsProps {
  groups: NavGroup[]
}

export const SupportBarItems: React.FC<SupportBarItemsProps> = ({ groups }) => {
  const { activeCollapsibleSidebarItem, setActiveCollapsibleSidebarItem } = useNavigation()

  const handleItemClick = useCallback(
    (item: NavGroupItem) => {
      setActiveCollapsibleSidebarItem(item)
    },
    [setActiveCollapsibleSidebarItem]
  )

  return (
    <>
      {groups.length > 0 ? (
        groups.map((group: NavGroup) => (
          <SupportBarGroup
            key={group.id}
            group={group}
            onItemClick={handleItemClick}
            activeCollapsibleSidebarItem={activeCollapsibleSidebarItem}
          />
        ))
      ) : (
        <p className="text-gray-500 p-4">Nenhum item disponível</p>
      )}
    </>
  )
}

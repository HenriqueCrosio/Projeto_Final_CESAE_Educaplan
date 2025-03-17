"use client"

import { memo, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SideBarButtonIcon } from "./side-bar-button-icon"
import { useNavigationStore } from "@/store/navigation.store"
import { useNavigation } from "@/providers/navigation-provider"
import type { NavItem } from "@/types/navigation.types"

export const SideBarItem = memo(({ item }: { item: NavItem }) => {
  const { setActiveNavItem } = useNavigationStore()
  const { lastClickedSidebarItem, setLastClickedSidebarItem } = useNavigation()

  const isActive = lastClickedSidebarItem?.id === item.id

  useEffect(() => {
    if (!lastClickedSidebarItem) {
      setLastClickedSidebarItem(item)
    }
  }, [lastClickedSidebarItem, item, setLastClickedSidebarItem])

  const handleClick = async () => {
    await setActiveNavItem(item.id)
    setLastClickedSidebarItem(item)
  }

  return (
    <Link href={item.href} onClick={handleClick}>
      <button
        className={cn(
          "flex flex-col items-center justify-center p-4 text-xs text-gray-600 hover:bg-gray-200 transition-colors w-full",
          isActive && "bg-gray-200 text-blue-400 ",
        )}
      >
        <SideBarButtonIcon name={item.icon} />
        <span className="text-center whitespace-nowrap">{item.name}</span>
      </button>
    </Link>
  )
})

SideBarItem.displayName = "SideBarItem"


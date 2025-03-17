"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useNavigationStore } from "@/store/navigation.store"
import type { NavItem, NavGroup, NavGroupItem } from "@/types/navigation.types"

type LastClickedItems = Record<string, NavGroupItem>

type NavigationContextType = {
  isSecondaryNavCollapsed: boolean
  toggleSecondaryNav: () => void
  activeMainSidebarItem: NavItem | null
  supportBarGroups: Record<string, NavGroup[]>
  activeCollapsibleSidebarItem: NavGroupItem | null
  setActiveCollapsibleSidebarItem: (item: NavGroupItem | null) => void
  lastClickedSidebarItem: NavItem | null
  setLastClickedSidebarItem: (item: NavItem) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider")
  }
  return context
}

interface NavigationProviderProps extends React.PropsWithChildren {
  tenant: string
}

export function NavigationProvider({ tenant, children }: NavigationProviderProps) {
  const {
    fetchNavigationConfig,
    activeMainSidebarItem,
    supportBarGroups,
    toggleSecondaryNav,
    isSecondaryNavCollapsed,
  } = useNavigationStore()

  const [activeCollapsibleSidebarItem, setActiveCollapsibleSidebarItem] = useState<NavGroupItem | null>(null)
  const [lastClickedItems, setLastClickedItems] = useState<LastClickedItems>({})
  const [lastClickedSidebarItem, setLastClickedSidebarItem] = useState<NavItem | null>(null)

  useEffect(() => {
    fetchNavigationConfig()
  }, [tenant, fetchNavigationConfig])

  useEffect(() => {
    if (activeMainSidebarItem) {
      if (!lastClickedSidebarItem || lastClickedSidebarItem.id !== activeMainSidebarItem.id) {
        setLastClickedSidebarItem(activeMainSidebarItem)
      }
    }
  }, [activeMainSidebarItem, lastClickedSidebarItem])

  useEffect(() => {
    if (activeMainSidebarItem) {
      const groups = supportBarGroups[activeMainSidebarItem.id] || []

      if (lastClickedItems[activeMainSidebarItem.id]) {
        setActiveCollapsibleSidebarItem(lastClickedItems[activeMainSidebarItem.id])
      } else {
        const firstBodyGroup = groups.find((group) => group.type === "body")
        if (firstBodyGroup?.children.length) {
          setActiveCollapsibleSidebarItem(firstBodyGroup.children[0])
        }
      }
    }
  }, [activeMainSidebarItem, supportBarGroups, lastClickedItems])

  const handleSetActiveCollapsibleSidebarItem = (item: NavGroupItem | null) => {
    if (item && activeMainSidebarItem) {
      setLastClickedItems((prev) => ({
        ...prev,
        [activeMainSidebarItem.id]: item,
      }))
    }
    setActiveCollapsibleSidebarItem(item)
  }
  useEffect(() => {
    console.log("Active Main Sidebar Item:", activeMainSidebarItem);
    console.log("Last Clicked Sidebar Item:", lastClickedSidebarItem);
    console.log("Support Bar Groups:", supportBarGroups);
  }, [activeMainSidebarItem, lastClickedSidebarItem, supportBarGroups]);
  

  return (
    <NavigationContext.Provider
      value={{
        isSecondaryNavCollapsed,
        toggleSecondaryNav,
        activeMainSidebarItem,
        supportBarGroups,
        activeCollapsibleSidebarItem,
        setActiveCollapsibleSidebarItem: handleSetActiveCollapsibleSidebarItem,
        lastClickedSidebarItem,
        setLastClickedSidebarItem,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}


import React, { useCallback } from "react"
import { redirect } from "next/navigation"
import { SideBarButtonIcon } from "./side-bar-button-icon"

export const SideBarButtonLogout: React.FC = () => {
  const handleLogout = useCallback(() => {
    redirect("/api/auth/logout")
  }, [])

  return (
    <a
      className="flex flex-col items-center justify-center p-3 text-xs text-gray-600 hover:bg-gray-200 transition-colors w-full"
      href="/api/auth/logout"
    >
      <SideBarButtonIcon name="logout" />
      <span className="text-center">Logout</span>
    </a>
  )
}

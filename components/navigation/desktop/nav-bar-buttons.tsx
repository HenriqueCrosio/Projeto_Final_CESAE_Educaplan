"use client"

import { useUser } from "@auth0/nextjs-auth0/client"
import React from "react"
import { SignupButton } from "@/components/buttons/signup-button"
import { LoginButton } from "@/components/buttons/login-button"
import { NavBarAvatarMenu } from "./nav-bar-avatar-menu"
import { NotificationBell } from "../../ui/notification-bell"

export const NavBarButtons = () => {
  const { user } = useUser()

  return (
    <div className="flex items-center h-full space-x-6">
      {!user && (
        <>
          <SignupButton />
          <LoginButton />
        </>
      )}
      {user && (
        <>
          <NotificationBell />
          <NavBarAvatarMenu user={user} />
        </>
      )}
    </div>
  )
}


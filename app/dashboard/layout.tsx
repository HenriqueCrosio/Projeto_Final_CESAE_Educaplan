"use client"

import { Suspense, useEffect, type ReactNode } from "react"
import DesktopNavigationLayout from "@/components/dashboard/navigation/desktop/desktop-navigation-layout"
import { NavigationProvider } from "@/providers/navigation-provider"
import { useAuthStore } from "@/store/auth.store"
import { LoginButton } from "@/components/buttons/login-button"
import { useCentralStore } from "@/store/central.store"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { teacherId, isLoading, fetchTeacherId } = useAuthStore()
  const loadInitialData = useCentralStore((state) => state.loadInitialData)

  useEffect(() => {
    fetchTeacherId()
    loadInitialData()
  }, [fetchTeacherId, loadInitialData])
    

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100dvh-3.5rem)]">Loading...</div>
  }

  if (!teacherId) {
    return (
      <>
        <div className="flex justify-center items-center min-h-[calc(100dvh-3.5rem)]">Teacher ID not found. Please log in.</div>
        <LoginButton />
      </>
    )
  }
    
  return (
    <NavigationProvider tenant={teacherId}>
      <DesktopNavigationLayout>
        <div className="flex flex-col max-h-[calc(100vh-3.5rem)]">
          <Toaster />
          <div className="flex-1 overflow-y-auto">
            <Suspense>{children}</Suspense>
          </div>
        </div>
      </DesktopNavigationLayout>
    </NavigationProvider>
  )
}


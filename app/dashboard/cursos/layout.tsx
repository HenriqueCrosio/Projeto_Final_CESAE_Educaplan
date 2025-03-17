"use client"

import { Suspense, useEffect, useState, type ReactNode } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { GoBackButton } from "@/components/buttons/go-back-button"

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isSearchBarHidden, setIsSearchBarHidden] = useState(false)
  const searchQuery = searchParams.get("q") || ""


    
  useEffect(() => {
    setIsSearchBarHidden(pathname.includes("-"))
  }, [pathname])



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = e.target.value
    const currentPath = window.location.pathname
    const newUrl = `${currentPath}?q=${encodeURIComponent(newSearchQuery)}`
    router.push(newUrl)
  }

  return (

        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
          {!isSearchBarHidden ? (
            <div className="p-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Pesquisar..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
          ):(
            <div className="absolute m-4 left-0 top-0 z-10 bg-gray-100 rounded-md">
                <GoBackButton />
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-8 py-4">
            <Suspense>{children}</Suspense>
          </div>

        </div>

  )
}


"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useGoBack } from "@/lib/hooks/use-go-back"

interface GoBackButtonProps {
  className?: string
}

export const GoBackButton: React.FC<GoBackButtonProps> = ({ className }) => {
  const { goBack } = useGoBack()

  return (
    <Button variant="ghost" onClick={goBack} className={className}>
      <ChevronLeft className="mr-2 h-4 w-4" />
      Voltar
    </Button>
  )
}

import type React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: number | string
  icon?: LucideIcon
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, className }) => (
  <div
    className={cn(
      "group rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
      className,
    )}
  >
    {Icon && (
      <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 transition-colors group-hover:bg-primary/15">
        <Icon className="h-[18px] w-[18px]" />
      </span>
    )}
    <p className="font-display text-3xl font-semibold leading-none tracking-tight text-foreground">{value}</p>
    <p className="mt-1.5 text-sm text-muted-foreground">{title}</p>
  </div>
)

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap, Palette, Gift, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/student", label: "Início", icon: Home, exact: true },
  { href: "/student/turmas", label: "Turmas", icon: GraduationCap, exact: false },
  { href: "/student/hub", label: "Hub de Estudos", icon: Palette, exact: false },
  { href: "/student/recompensas", label: "Recompensas", icon: Gift, exact: false },
  { href: "/student/ambiente", label: "Ambiente", icon: Headphones, exact: false },
];

export function StudentSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-muted/30 h-[calc(100dvh-3.5rem)] p-3">
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

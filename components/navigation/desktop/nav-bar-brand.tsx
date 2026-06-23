import React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export const NavBarBrand: React.FC = () => {
  return (
    <div className="flex items-center">
      <Link href="/" className="flex items-center gap-2" aria-label="Educaplan — início">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Educa<span className="text-primary">plan</span>
        </span>
      </Link>
    </div>
  );
};

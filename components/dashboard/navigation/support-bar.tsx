"use client";

import React from "react";
import { useNavigationStore } from "@/store/navigation.store";
import { cn } from "@/lib/utils";
import { SupportBarItems } from "./support-bar-items";
import { SupportBarButtonToggle } from "./support-bar-button-toggle";

export const SupportBar: React.FC = () => {
  const { isSecondaryNavCollapsed, supportBarGroups } = useNavigationStore();

  if (!Object.keys(supportBarGroups).length) return null;

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)]">
      <nav className={cn("relative border-r bg-gray-50 transition-all overflow-hidden", isSecondaryNavCollapsed ? "w-0" : "w-64")}>
        <div className="p-4 pb-16 w-full h-full flex flex-col overflow-y-auto">
          <div className="flex-grow overflow-y-auto">
            {Object.entries(supportBarGroups).map(([key, groups]) => (
              <SupportBarItems key={key} groups={groups} />
            ))}
          </div>
        </div>
      </nav>
      <div className="absolute bottom-4 left-4 z-10">
        <SupportBarButtonToggle />
      </div>
    </div>
  );
};

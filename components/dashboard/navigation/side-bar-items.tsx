"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNavigationStore } from "@/store/navigation.store";
import { SideBarItem } from "./side-bar-item";
import { NavItem } from "@/types/navigation.types";

export const SideBarItems: React.FC = () => {
  const { topNav, bottomNav, fetchNavigationConfig } = useNavigationStore();
  const pathname = usePathname();

  useEffect(() => {
    fetchNavigationConfig();
  }, []);

  return (
    <div className="w-full flex flex-col justify-between h-full">
      <div className="w-full flex flex-col">
        {topNav.map((item: NavItem) => (
          <SideBarItem key={item.id} item={item} />
        ))}
      </div>
      <div className="w-full h-px bg-gray-200 my-2" aria-hidden="true" />
      <div className="w-full flex flex-col">
        {bottomNav.map((item: NavItem) => (
          <SideBarItem key={item.id} item={item}/>
        ))}
      </div>
    </div>
  );
};

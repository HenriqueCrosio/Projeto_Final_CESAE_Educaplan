"use client";

import React, { useEffect } from "react";
import { useNavigationStore } from "@/store/navigation.store";
import { SideBarItems } from "./side-bar-items";
import { SideBarButtonLogout } from "./side-bar-button-logout";

export const SideBar: React.FC = () => {
  const { topNav, fetchNavigationConfig } = useNavigationStore();

  useEffect(() => {
    fetchNavigationConfig();
  }, []);

  if (!topNav.length) {
    return <div className="bg-gray-100 h-[calc(100vh-3.5rem)] animate-pulse" />;
  }

  return (
    <nav className="bg-gray-100 h-[calc(100vh-3.5rem)] flex flex-col justify-between">
      <SideBarItems />
      <div className="w-full h-px bg-gray-200 my-2" aria-hidden="true" />
      <SideBarButtonLogout />
    </nav>
  );
};

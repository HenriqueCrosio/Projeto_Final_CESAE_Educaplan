import React from "react";
import { NavBarButtons } from "./nav-bar-buttons";
import { NavBarBrand } from "./nav-bar-brand";

export const NavBar: React.FC = () => {
  return (
    <div className="flex w-full bg-gray-200 z-50">
      <nav className="flex flex-row w-full justify-between px-6 h-[3.5rem]">
        <NavBarBrand />
        <NavBarButtons />
      </nav>
    </div>
  );
};
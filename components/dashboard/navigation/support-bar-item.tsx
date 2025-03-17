"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useNavigation } from "@/providers/navigation-provider";
import type { NavGroupItem } from "@/types/navigation.types";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SupportBarItemProps {
  item: NavGroupItem;
  depth?: number;
  onItemClick: (item: NavGroupItem) => void;
}

export const SupportBarItem: React.FC<SupportBarItemProps> = ({ item, depth = 0, onItemClick }) => {
  const { activeCollapsibleSidebarItem, setActiveCollapsibleSidebarItem } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (activeCollapsibleSidebarItem?.id === item.id) {
      setIsOpen(true);
    }
  }, [activeCollapsibleSidebarItem, item.id]);

  const handleClick = useCallback(() => {
    setActiveCollapsibleSidebarItem(item);
    onItemClick(item);
    if (item.children && item.children.length > 0) {
      setIsOpen((prev) => !prev);
    }
  }, [item, onItemClick, setActiveCollapsibleSidebarItem]);

  return (
    <div className="w-full">
      <Link
        href={item.href}
        className={`flex items-center w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-200 transition-colors ${
          activeCollapsibleSidebarItem?.id === item.id ? "bg-gray-100 font-semibold text-blue-400" : ""
        }`}
        onClick={handleClick}
      >
        <span className="flex-grow truncate">{item.name}</span>
        {item.children && item.children.length > 0 && (
          <span className="ml-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </span>
        )}
      </Link>
      {item.children && isOpen && (
        <div className="ml-4">
          {item.children.map((child) => (
            <SupportBarItem key={child.id} item={child} depth={depth + 1} onItemClick={onItemClick} />
          ))}
        </div>
      )}
    </div>
  );
};

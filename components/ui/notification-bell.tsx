"use client";

import { NotificationService as n, useNotifications } from "@/services/data-services/notification.service";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils"; // Utility for better class handling
import { Button } from "@/components/ui/button"; // ✅ Using ShadCN Button

export const NotificationBell = () => {
    const notifications = useNotifications();
    const [unreadCount, setUnreadCount] = useState(n.getUnreadCount());

    useEffect(() => {
        setUnreadCount(n.getUnreadCount());
    }, [notifications]);

    // ✅ Mark all notifications as read when dropdown opens
    const handleDropdownOpen = (open: boolean) => {
        if (open) {
            n.markAllAsRead();
            setUnreadCount(0);
        }
    };

    return (
        <DropdownMenu onOpenChange={handleDropdownOpen}>
            <DropdownMenuTrigger asChild>
                {/* ✅ Completely removed focus ring & ensured a clean look */}
                <Button
                    size="lg"
                    variant="ghost"
                    className={cn(
                        "relative flex items-center justify-center p-2 h-10 w-10 rounded-sm hover:bg-gray-200 transition",
                        "focus:outline-none focus-visible:ring-0 active:ring-0"
                    )}
                >
                    <Bell className="h-8 w-8 text-gray-700" /> {/* ✅ Bigger bell */}
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-2 flex items-center justify-center w-3 h-3 text-[9px] font-bold text-white bg-red-500 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white shadow-lg rounded-lg p-2">
                {notifications.length === 0 ? (
                    <DropdownMenuItem className="text-gray-500 text-sm text-center w-full">
                        No new notifications
                    </DropdownMenuItem>
                ) : (
                    [...notifications].reverse().map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className="flex flex-col p-3 border-b border-gray-200 last:border-none cursor-pointer hover:bg-gray-100"
                        >
                            <p className={`text-sm ${notification.read ? "text-gray-500" : "text-black font-semibold"}`}>
                                {notification.message}
                            </p>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

"use client";

import { Bell } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getUnseenNotifications, markNotificationsAsSeen } from "@/actions/notification.actions";

type DbNotification = Awaited<ReturnType<typeof getUnseenNotifications>>[number];

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<DbNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const load = useCallback(async () => {
        try {
            const items = await getUnseenNotifications();
            setNotifications(items);
            setUnreadCount(items.length);
        } catch {
            // Sessão sem professor (ex.: aluno/onboarding) → sino vazio.
            setNotifications([]);
            setUnreadCount(0);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Marca como vistas ao abrir o dropdown (limpa o contador, mantém a lista visível).
    const handleDropdownOpen = async (open: boolean) => {
        if (open && unreadCount > 0) {
            setUnreadCount(0); // limpa o badge já (otimista)
            try {
                await markNotificationsAsSeen();
            } catch {
                // ignora — recarrega na próxima montagem
            }
        }
    };

    return (
        <DropdownMenu onOpenChange={handleDropdownOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    size="lg"
                    variant="ghost"
                    className={cn(
                        "relative flex items-center justify-center p-2 h-10 w-10 rounded-sm hover:bg-gray-200 transition",
                        "focus:outline-none focus-visible:ring-0 active:ring-0"
                    )}
                >
                    <Bell className="h-8 w-8 text-gray-700" />
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
                        Sem notificações novas
                    </DropdownMenuItem>
                ) : (
                    notifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className="flex flex-col items-start p-3 border-b border-gray-200 last:border-none cursor-pointer hover:bg-gray-100"
                        >
                            {notification.title && (
                                <p className="text-sm font-semibold text-black">{notification.title}</p>
                            )}
                            <p className="text-sm text-gray-600">{notification.message}</p>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

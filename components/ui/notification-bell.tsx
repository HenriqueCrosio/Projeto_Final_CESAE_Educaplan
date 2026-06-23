"use client";

import { Bell } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getMyUnseenNotifications, markMyNotificationsAsSeen } from "@/actions/notification.actions";

type DbNotification = Awaited<ReturnType<typeof getMyUnseenNotifications>>[number];

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<DbNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const load = useCallback(async () => {
        try {
            const items = await getMyUnseenNotifications();
            setNotifications(items);
            setUnreadCount(items.length);
        } catch {
            // Sessão sem destinatário (ex.: onboarding) → sino vazio.
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
                await markMyNotificationsAsSeen();
            } catch {
                // ignora — recarrega na próxima montagem
            }
        }
    };

    return (
        <DropdownMenu onOpenChange={handleDropdownOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Notificações"
                    className="relative"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-1">
                {notifications.length === 0 ? (
                    <DropdownMenuItem className="w-full justify-center py-3 text-sm text-muted-foreground" disabled>
                        Sem notificações novas
                    </DropdownMenuItem>
                ) : (
                    notifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className="flex cursor-pointer flex-col items-start gap-0.5 border-b border-border p-3 last:border-none"
                        >
                            {notification.title && (
                                <p className="text-sm font-semibold">{notification.title}</p>
                            )}
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

import { useCentralStore } from "@/store/central.store";
import { generateId, showToast } from "@/lib/utils";
import { useNavigationStore } from "@/store/navigation.store";

export interface Notification {
    id: string;
    type: "success" | "error" | "info";
    message: string;
    sendTo?: string;
    createdBy?: string;
    read: boolean;
    timestamp: number;
}

export const useNotifications = () => useCentralStore((state) => state.getData("notifications") || []);

export const NotificationService = {
    addNotification: (type: "success" | "error" | "info", message: string) => {
        const addData = useCentralStore.getState().addData;
        const setActiveNavItem = useNavigationStore.getState().setActiveNavItem; // ✅ Get function to refresh sidebar


        const newNotification: Notification = {
            id: generateId(),
            type,
            message,
            read: false,
            timestamp: Date.now(),
        };

        addData("notifications", newNotification);
        setActiveNavItem("dashboard");
        showToast(type, type === "error" ? "Error" : "Notification", message);
    },

    getNotifications: () => {
        return useCentralStore.getState().getData("notifications");
    },

    getUnreadCount: () => {
        return NotificationService.getNotifications().filter((n: Notification) => !n.read).length;
    },

    markAllAsRead: () => {
        const updateData = useCentralStore.getState().updateData;
        const notifications = NotificationService.getNotifications();

        notifications
            .filter((n: Notification) => !n.read)
            .forEach((notification) => updateData("notifications", notification.id, { read: true }));
    },
};

import { showToast } from "@/lib/utils";

/**
 * Feedback transitório (toasts) das operações dos data-services.
 *
 * As notificações PERSISTENTES (sino + "Atividade Recente") foram migradas para
 * o Postgres — ver `actions/notification.actions.ts`. Este serviço ficou só com
 * o toast efémero; já não escreve no store Zustand.
 */
export const NotificationService = {
    addNotification: (type: "success" | "error" | "info", message: string) => {
        showToast(type, type === "error" ? "Error" : "Notification", message);
    },
};

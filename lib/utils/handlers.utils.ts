/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "@/lib/hooks/use-toast";

type ToastType = "success" | "error" | "info";

export const showToast = (type: ToastType, title: string, description?: string) => {
    toast({
        title,
        description,
        variant: type === "error" ? "destructive" : "default",
    });
};

export const handleServiceErrorWithToast = (error: any, contextMessage: string) => {
    console.error(`${contextMessage}:`, error);

    const message = `${contextMessage}. ${error?.message || "Something went wrong."}`;

    // ✅ Only show toast, no persistent notification
    showToast("error", "Error", message);

    return { success: false, message };
};

export const handleServiceError = (error: unknown, message: string) => {
    console.error(`${message}:`, error);
    return { success: false, message };
};





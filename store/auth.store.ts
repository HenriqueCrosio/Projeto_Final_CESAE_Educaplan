import { create } from "zustand";

interface AuthState {
  teacherId: string | null;
  isLoading: boolean;
  fetchTeacherId: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  teacherId: null,
  isLoading: true,

  fetchTeacherId: async () => {
    set({ isLoading: true });

    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) throw new Error("Failed to fetch session");

      const data = await res.json();
      set({ teacherId: data.teacherId, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch teacherId:", error);
      set({ teacherId: null, isLoading: false });
    }
  },
}));

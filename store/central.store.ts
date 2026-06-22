/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { scheduleService } from "@/services/wrapper-services/enrollment-schedule.wrapper-service";

// Referência estável de array vazio: evita que selectors do Zustand recebam
// uma nova referência a cada render (causa de loops infinitos de re-render).
const EMPTY_ARRAY: any[] = [];

interface CentralStoreState {
  data: Record<string, any[]>; // Stores all mock data
  addData: (fileKey: string, newData: any) => void;
  updateData: (fileKey: string, itemId: string, updates: Partial<any>) => void;
  deleteData: (fileKey: string, itemId: string) => void;
  setData: (fileKey: string, newData: any[]) => void;
  getData: (fileKey: string) => any[];
}

export const useCentralStore = create<CentralStoreState>()(
  persist(
    (set, get) => ({
      data: {},

      getData: (fileKey) => get().data[fileKey] || EMPTY_ARRAY,

      addData: (fileKey, newData) => {
        set((state) => {
          const existingItems = state.data[fileKey] || [];
          const itemExists = existingItems.some((item) => item.id === newData.id);
          return itemExists
            ? state
            : { data: { ...state.data, [fileKey]: [...existingItems, newData] } };
        });
      },

      updateData: (fileKey, itemId, updates) => {
        set((state) => {
          if (!state.data[fileKey]) return state;
          return {
            data: {
              ...state.data,
              [fileKey]: state.data[fileKey].map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            },
          };
        });
      },

      deleteData: (fileKey, itemId) => {
        set((state) => {
          if (!state.data[fileKey]) return state;
          return {
            data: {
              ...state.data,
              [fileKey]: state.data[fileKey].filter((item) => item.id !== itemId),
            },
          };
        });
      },

      setData: (fileKey, newData) => {
        set((state) => {
          const newDataState = { ...state.data, [fileKey]: newData };

          if (fileKey === "classScheduleLessons") {
            scheduleService.refreshLessons();
          }

          return { data: newDataState };
        });
      },
    }),
    {
      name: "central-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { loadMockData } from "@/lib/utils/general.utils";
import { scheduleService } from "@/services/wrapper-services/enrollment-schedule.wrapper-service";

interface CentralStoreState {
  data: Record<string, any[]>; // Stores all mock data
  loadInitialData: () => Promise<void>; // Loads mock data at startup
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

      loadInitialData: async () => {
        const users = await loadMockData("user");
        const notifications = await loadMockData("notifications");
        const courses = await loadMockData("course");
        const modules = await loadMockData("module");
        const topics = await loadMockData("topic");
        const lessons = await loadMockData("lesson");
        const courseModules = await loadMockData("coursemodule");
        const moduleTopics = await loadMockData("moduletopic");
        const moduleLessons = await loadMockData("modulelesson");
        const classes = await loadMockData("class");
        const teams = await loadMockData("team");
        const moduleAssignments = await loadMockData("moduleassignment");
        const enrollments = await loadMockData("enrollment");
        const classStudents = await loadMockData("classstudent");
        const moduleTeams = await loadMockData("moduleteam");
        const classScheduleLessons = await loadMockData("classschedulelessons");

        set({ 
          data: {
            users, notifications, courses, modules, topics, lessons,
            courseModules, moduleTopics, moduleLessons, classes, teams,
            moduleAssignments, enrollments, classStudents, moduleTeams,
            classScheduleLessons, 
            
          } 
        });
        scheduleService.refreshLessons();

      },

      getData: (fileKey) => get().data[fileKey] || [],

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

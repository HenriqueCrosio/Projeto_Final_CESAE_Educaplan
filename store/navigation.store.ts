import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NavigationConfig, NavItem, NavGroup } from "@/types/navigation.types";
import { NavigationDataService } from "@/services/navigation-data.service";
import { shallow } from "zustand/shallow";

interface NavigationState {
  topNav: NavItem[];
  bottomNav: NavItem[];
  supportBarGroups: Record<string, NavGroup[]>; 
  isSecondaryNavCollapsed: boolean;
  activeMainSidebarItem: NavItem | null;
  setNavigation: (config: NavigationConfig) => void;
  setActiveNavItem: (id: string) => Promise<void>;
  toggleSecondaryNav: () => void;
  fetchNavigationConfig: () => Promise<void>;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      topNav: [],
      bottomNav: [],
      supportBarGroups: {},

      isSecondaryNavCollapsed: false,
      activeMainSidebarItem: null,

      setNavigation: (config) => {
        if (shallow(config.topNav, get().topNav) && shallow(config.bottomNav, get().bottomNav)) {
          return;
        }
        set({ topNav: config.topNav, bottomNav: config.bottomNav });
      },

      setActiveNavItem: async (id) => {
        const { topNav, bottomNav } = get();
        const selectedNavItem = topNav.find((item) => item.id === id) || bottomNav.find((item) => item.id === id) || null;
        
        if (!selectedNavItem) return;

        set({
          activeMainSidebarItem: selectedNavItem,
          supportBarGroups: {},
        });

        let supportBarData: Record<string, NavGroup[]> = {};

        switch (id) {
          case "dashboard":
            supportBarData = { dashboard: await NavigationDataService.getDashboardGroups() };
            break;
          case "gestao":
            supportBarData = { gestao: await NavigationDataService.getGestaoGroups() };
            break;
          case "cursos":
            supportBarData = { cursos: await NavigationDataService.getCursosGroups() };
            break;
          case "classes":
            supportBarData = { classes: await NavigationDataService.getClassesGroups() };
            break;
        }

        set({ supportBarGroups: supportBarData });
      },

      toggleSecondaryNav: () => set((state) => ({ isSecondaryNavCollapsed: !state.isSecondaryNavCollapsed })),

      fetchNavigationConfig: async () => {
        const config = await NavigationDataService.getNavigationConfig();
        set({ topNav: config.topNav, bottomNav: config.bottomNav });
      },
    }),
    {
      name: "navigation-storage",
      // Bump quando a forma/labels do menu mudarem: descarta caches antigos no browser.
      version: 1,
      // Persistir APENAS preferências de UI. topNav/bottomNav/supportBarGroups são
      // dados derivados (rótulos, itens vindos do Postgres) e têm de ser sempre
      // recalculados — persistir isso causava menu/labels obsoletos após mudanças.
      partialize: (state) => ({ isSecondaryNavCollapsed: state.isSecondaryNavCollapsed }),
    }
  )
);

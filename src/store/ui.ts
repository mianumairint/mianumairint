import { create } from "zustand";

interface UIState {
  isSideNavOpen: boolean;
  isSearchOpen: boolean;
  openSideNav: () => void;
  closeSideNav: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSideNavOpen: false,
  isSearchOpen: false,
  openSideNav: () => set({ isSideNavOpen: true }),
  closeSideNav: () => set({ isSideNavOpen: false }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
}));

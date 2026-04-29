'use client';

import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  collapseSidebar: () => set({ isCollapsed: true }),
  expandSidebar: () => set({ isCollapsed: false }),
}));

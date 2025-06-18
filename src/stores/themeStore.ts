import { create } from 'zustand';

interface ThemeState {
  isDaltonic: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDaltonic: false,
  toggleTheme: () => set((state) => ({ isDaltonic: !state.isDaltonic })),
}));
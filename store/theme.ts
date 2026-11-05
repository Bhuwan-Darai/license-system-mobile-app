import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "system" | "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
}

// The appearance choice is kept on the device so it survives restarts.
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "system",
      hydrated: false,
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "theme-mode",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ mode: s.mode }),
      onRehydrateStorage: () => () => useThemeStore.setState({ hydrated: true }),
    }
  )
);

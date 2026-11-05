import { useColorScheme } from "react-native";

import { DarkColors, LightColors, ThemeColors } from "@/constants/theme";
import { useThemeStore } from "@/store/theme";

/** The scheme in use: the user's choice, or the device setting for "system". */
export function useScheme(): "light" | "dark" {
  const mode = useThemeStore((s) => s.mode);
  const system = useColorScheme();
  if (mode === "system") return system === "dark" ? "dark" : "light";
  return mode;
}

/** Colours for the current scheme. */
export function useColors(): ThemeColors {
  return useScheme() === "dark" ? DarkColors : LightColors;
}

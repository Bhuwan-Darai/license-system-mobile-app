import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/context/auth";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="practice/mcq" />
          <Stack.Screen name="more/blog" />
          <Stack.Screen name="more/blogpost" />
          <Stack.Screen name="more/status" />
          <Stack.Screen name="more/signs" />
          <Stack.Screen name="more/ishihara" />
          <Stack.Screen name="more/emergency" />
          <Stack.Screen name="more/busfare" />
          <Stack.Screen name="more/logout" options={{ presentation: 'transparentModal' }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal", headerShown: true }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

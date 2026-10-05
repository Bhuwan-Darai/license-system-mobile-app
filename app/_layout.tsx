import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/context/auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect, useState } from "react";

import Splash from "@/components/ui/Loading";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  const colorScheme = useColorScheme();

  useEffect(() => {
    async function doAsyncStuff() {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    doAsyncStuff();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hide();
    }
  }, [isReady]);

  if (!isReady) {
    return <Splash />;
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack
            screenOptions={{ headerShown: false }}
            initialRouteName="login"
          >
            {/* <Stack.Screen name="index" /> */}
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            {/* <Stack.Screen name="practice/mcq" /> */}
            {/* <Stack.Screen name="more/blog" />
            <Stack.Screen name="more/blogpost" />
            <Stack.Screen name="more/status" />
            <Stack.Screen name="more/signs" />
            <Stack.Screen name="more/ishihara" />
            <Stack.Screen name="more/emergency" />
            <Stack.Screen name="more/busfare" />
            <Stack.Screen
              name="more/logout"
              options={{ presentation: "transparentModal" }}
            /> */}
            {/* <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                title: "Modal",
                headerShown: true,
              }}
            /> */}
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

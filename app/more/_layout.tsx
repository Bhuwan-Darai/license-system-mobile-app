import { Stack } from "@/.expo/types/router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="more/signs" />
      <Stack.Screen name="more/status" />
      <Stack.Screen name="more/emergency" />
      <Stack.Screen name="more/busfare" />
      <Stack.Screen name="more/blog" />
      <Stack.Screen name="more/blogpost" />
      <Stack.Screen
        name="more/logout"
        options={{ presentation: "transparentModal" }}
      />
    </Stack>
  );
}

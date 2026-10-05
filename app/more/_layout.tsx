import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="/signs" />
      <Stack.Screen name="/status" />
      <Stack.Screen name="/emergency" />
      <Stack.Screen name="/busfare" />
      <Stack.Screen name="/blog" />
      <Stack.Screen name="/blogpost" />
      <Stack.Screen
        name="/more/logout"
        options={{ presentation: "transparentModal" }}
      />
    </Stack>
  );
}

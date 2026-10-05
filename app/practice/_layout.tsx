import { Stack } from "expo-router";

export default function PracticeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="mcq" />
    </Stack>
  );
}

import { Stack } from "expo-router";
import { stackScreenOptions } from "@/constants/navigation";

export default function PracticeLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="mcq" options={{ title: "Question sets" }} />
      <Stack.Screen name="quiz" options={{ title: "Practice" }} />
      <Stack.Screen name="history" options={{ title: "My attempts" }} />
      <Stack.Screen name="attempt" options={{ title: "Attempt review" }} />
    </Stack>
  );
}

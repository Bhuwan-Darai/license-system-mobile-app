import { Stack } from "expo-router";
import { useStackScreenOptions } from "@/constants/navigation";

export default function ServiceLayout() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="add-bike" options={{ title: "Add bike" }} />
      <Stack.Screen name="add-fuel" options={{ title: "Add fuel" }} />
      <Stack.Screen name="add-service" options={{ title: "Add service record" }} />
    </Stack>
  );
}

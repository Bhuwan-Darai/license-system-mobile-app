import { Stack } from "expo-router";
import { stackScreenOptions } from "@/constants/navigation";

export default function MoreLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="blog" options={{ title: "Blog and guides" }} />
      <Stack.Screen name="blogpost" options={{ title: "Article" }} />
      <Stack.Screen name="signs" options={{ title: "Traffic symbols" }} />
      <Stack.Screen name="ishihara" options={{ title: "Ishihara plates" }} />
      <Stack.Screen name="status" options={{ title: "License status" }} />
      <Stack.Screen name="emergency" options={{ title: "Emergency numbers" }} />
      <Stack.Screen name="busfare" options={{ title: "Bus fare list" }} />
      <Stack.Screen name="driving-schools" options={{ title: "Driving schools" }} />
      <Stack.Screen name="mileage-calculator" options={{ title: "Mileage calculator" }} />
      <Stack.Screen name="fuel-calculator" options={{ title: "Fuel calculator" }} />
      <Stack.Screen name="policies" options={{ title: "Policies" }} />
      <Stack.Screen name="policy" options={{ title: "Policy" }} />
      <Stack.Screen name="about-us" options={{ title: "About us" }} />
    </Stack>
  );
}

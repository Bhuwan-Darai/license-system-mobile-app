import React from "react";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";

import AppHeader from "@/components/ui/AppHeader";
import { BrandColors } from "./theme";

// Every pushed screen gets the shared AppHeader (back arrow + title).
// A screen sets its title with <Stack.Screen options={{ title }} />, and may
// use headerRight / headerBackVisible like it would with the default header.
export const stackScreenOptions = {
  headerShown: true,
  contentStyle: { backgroundColor: BrandColors.paper },
  header: ({ options, route, back, navigation }: NativeStackHeaderProps) => (
    <AppHeader
      title={
        typeof options.headerTitle === "string"
          ? options.headerTitle
          : (options.title ?? route.name)
      }
      back={!!back && options.headerBackVisible !== false}
      onBack={navigation.goBack}
      right={options.headerRight?.({ canGoBack: !!back, tintColor: BrandColors.ink })}
      bell={false}
    />
  ),
};

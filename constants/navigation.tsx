import React from "react";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";

import AppHeader from "@/components/ui/AppHeader";
import { useColors } from "@/hooks/use-theme";

// Every pushed screen gets the shared AppHeader (back arrow + title).
// A screen sets its title with <Stack.Screen options={{ title }} />, and may
// use headerRight / headerBackVisible like it would with the default header.
function StackHeader({ options, route, back, navigation }: NativeStackHeaderProps) {
  const colors = useColors();
  return (
    <AppHeader
      title={
        typeof options.headerTitle === "string"
          ? options.headerTitle
          : (options.title ?? route.name)
      }
      back={!!back && options.headerBackVisible !== false}
      onBack={navigation.goBack}
      right={options.headerRight?.({ canGoBack: !!back, tintColor: colors.ink })}
      bell={false}
    />
  );
}

/** Stack options for the feature folders; call inside a layout component. */
export function useStackScreenOptions() {
  const colors = useColors();
  return {
    headerShown: true,
    contentStyle: { backgroundColor: colors.paper },
    header: (props: NativeStackHeaderProps) => <StackHeader {...props} />,
  };
}

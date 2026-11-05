import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type ThemeColors } from "@/constants/theme";
import { useDrawer } from "@/components/Drawer/DrawerContext";
import NotificationBell from "@/components/ui/NotificationBell";
import { useColors } from "@/hooks/use-theme";

// Home header: menu button (opens the drawer), LY mark + app name, bell.
export default function HomeHeader() {
  const BrandColors = useColors(); const styles = useMemo(() => createStyles(BrandColors), [BrandColors]);

  const insets = useSafeAreaInsets();
  const { open } = useDrawer();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <TouchableOpacity accessibilityLabel="Open menu" onPress={open} hitSlop={8} style={styles.btn}>
        <Ionicons name="menu" size={26} color={BrandColors.ink} />
      </TouchableOpacity>
      <View style={styles.logo}>
        <Text style={styles.logoText}>LY</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        License Yatra
      </Text>
      <NotificationBell />
    </View>
  );
}

const createStyles = (BrandColors: ThemeColors) => StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 10,
    backgroundColor: BrandColors.paper,
  },
  btn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: BrandColors.crimson,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#fff", fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  name: { flex: 1, fontSize: 19, fontWeight: "700", color: BrandColors.ink },
});

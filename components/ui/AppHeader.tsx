import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandColors } from "@/constants/theme";
import NotificationBell from "./NotificationBell";

interface Props {
  title: string;
  subtitle?: string;
  /** Show the back arrow. */
  back?: boolean;
  /** Custom back handler; defaults to router.back(). */
  onBack?: () => void;
  /** Extra actions, shown left of the notification bell. */
  right?: React.ReactNode;
  /** Show the notification bell (default true). */
  bell?: boolean;
}

// The one header used across the app: optional back arrow in the brand red,
// a title (and subtitle), and the notification bell on the right.
export default function AppHeader({
  title,
  subtitle,
  back,
  onBack,
  right,
  bell = true,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <View style={styles.row}>
        {back ? (
          <TouchableOpacity
            accessibilityLabel="Go back"
            onPress={goBack}
            hitSlop={8}
            style={styles.backBtn}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={24} color={BrandColors.crimson} />
          </TouchableOpacity>
        ) : null}

        <View style={[styles.titleWrap, !back && styles.titleWrapNoBack]}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          {right}
          {bell ? <NotificationBell /> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: BrandColors.paper,
    paddingBottom: 10,
    paddingHorizontal: 8,
  },
  row: { flexDirection: "row", alignItems: "center", minHeight: 44 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  titleWrap: { flex: 1, paddingHorizontal: 4 },
  titleWrapNoBack: { paddingLeft: 12 },
  title: { fontSize: 20, fontWeight: "700", color: BrandColors.ink },
  subtitle: { fontSize: 13, color: BrandColors.inkSoft, marginTop: 2, lineHeight: 18 },
  actions: { flexDirection: "row", alignItems: "center", gap: 4 },
});

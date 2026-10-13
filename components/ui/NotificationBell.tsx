import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { BrandColors } from "@/constants/theme";
import { useQueryNews } from "@/hooks/mobile/useMobileContent";
import { useNotificationSeen } from "@/hooks/notifications/useNotificationSeen";

// Bell shown in headers. Opens the notifications screen and shows how many
// news items were published since it was last opened.
export default function NotificationBell() {
  const router = useRouter();
  const { data } = useQueryNews(undefined, 20);
  const lastSeen = useNotificationSeen((s) => s.lastSeen);

  const unread = (data ?? []).filter(
    (n) => !lastSeen || new Date(n.published_at).getTime() > new Date(lastSeen).getTime()
  ).length;

  return (
    <TouchableOpacity
      accessibilityLabel="Notifications"
      onPress={() => router.push("/notifications" as any)}
      hitSlop={8}
      style={styles.btn}
      activeOpacity={0.6}
    >
      <Ionicons name="notifications-outline" size={23} color={BrandColors.ink} />
      {unread > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  badge: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: BrandColors.crimson,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#ffffff", fontSize: 10, fontWeight: "700" },
});

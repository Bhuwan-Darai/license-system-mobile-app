import React, { useMemo, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useColors } from "@/hooks/use-theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
type Item = { label: string; icon: IconName; route: string };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Services",
    items: [
      { label: "Apply for a new license", icon: "document-text-outline", route: "/more/register-license" },
      { label: "Send an inquiry", icon: "chatbubble-outline", route: "/more/inquiry" },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Blog and guides", icon: "book-outline", route: "/more/blog" },
      { label: "Traffic symbols", icon: "warning-outline", route: "/more/signs" },
      { label: "Ishihara plates", icon: "eye-outline", route: "/more/ishihara" },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "Driving schools", icon: "school-outline", route: "/more/driving-schools" },
      { label: "Mileage calculator", icon: "speedometer-outline", route: "/more/mileage-calculator" },
      { label: "Fuel calculator", icon: "water-outline", route: "/more/fuel-calculator" },
    ],
  },
  {
    title: "Information",
    items: [
      { label: "License status", icon: "id-card-outline", route: "/more/status" },
      { label: "Bus fare list", icon: "bus-outline", route: "/more/busfare" },
      { label: "Emergency numbers", icon: "call-outline", route: "/more/emergency" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "Policies", icon: "shield-checkmark-outline", route: "/more/policies" },
      { label: "About us", icon: "information-circle-outline", route: "/more/about-us" },
    ],
  },
];

const WIDTH = Math.min(Dimensions.get("window").width * 0.82, 320);

export default function AppDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const BrandColors = useColors(); const styles = useMemo(() => createStyles(BrandColors), [BrandColors]);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const progress = useRef(new Animated.Value(0)).current;
  // stay mounted while the closing animation runs
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) setMounted(true);
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
  }, [visible, progress]);

  if (!mounted) return null;

  const go = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, { opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          {
            width: WIDTH,
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 8,
            transform: [
              { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-WIDTH, 0] }) },
            ],
          },
        ]}
      >
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>LY</Text>
          </View>
          <Text style={styles.brandName}>License Yatra</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
          {SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionLabel}>{section.title}</Text>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.item}
                  activeOpacity={0.6}
                  onPress={() => go(item.route)}
                >
                  <Ionicons name={item.icon} size={20} color={BrandColors.inkSoft} />
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.item, styles.logout]}
          activeOpacity={0.6}
          onPress={() => {
            onClose();
            signOut();
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={BrandColors.crimson} />
          <Text style={[styles.itemLabel, { color: BrandColors.crimson }]}>Log out</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const createStyles = (BrandColors: ThemeColors) => StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: BrandColors.paper,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: BrandColors.line,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 14,
    marginBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BrandColors.line,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: BrandColors.crimson,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#fff", fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  brandName: { fontSize: 18, fontWeight: "700", color: BrandColors.ink },
  section: { marginTop: 12 },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: BrandColors.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 18,
    marginBottom: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  itemLabel: { fontSize: 14.5, color: BrandColors.ink },
  logout: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BrandColors.line,
    marginTop: 4,
  },
});

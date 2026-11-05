import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandColors } from "@/constants/theme";
import AppHeader from "./AppHeader";

// Shared building blocks so every screen uses the same spacing, borders and
// type scale. Colours come only from BrandColors.

export const Space = { page: 20, gap: 12, radius: 12 };

/** Top padding that clears the status bar / notch. */
export function useTopInset(extra = 12) {
  const insets = useSafeAreaInsets();
  return insets.top + extra;
}

export const PageHeader = AppHeader;

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.card, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

/** A group of rows inside one bordered container, separated by hairlines. */
export function ListGroup({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.group}>
      {items.map((child, i) => (
        <View key={i} style={i > 0 ? styles.groupDivider : undefined}>
          {child}
        </View>
      ))}
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  value,
  onPress,
  destructive,
  chevron = true,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  chevron?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      disabled={!onPress}
      style={styles.row}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, destructive && { color: BrandColors.crimson }]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress && chevron ? (
        <Ionicons name="chevron-forward" size={16} color={BrandColors.inkSoft} />
      ) : null}
    </TouchableOpacity>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyText}>{message}</Text> : null}
      {actionLabel ? (
        <TouchableOpacity style={styles.emptyBtn} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.emptyBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: BrandColors.ink },
  sectionAction: { fontSize: 13, fontWeight: "600", color: BrandColors.himalaya },

  card: {
    backgroundColor: BrandColors.card,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: BrandColors.line,
    borderRadius: Space.radius,
    padding: 14,
  },

  group: {
    backgroundColor: BrandColors.card,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: BrandColors.line,
    borderRadius: Space.radius,
    overflow: "hidden",
  },
  groupDivider: {
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: BrandColors.line,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowTitle: { fontSize: 15, fontWeight: "500", color: BrandColors.ink },
  rowSub: { fontSize: 12.5, color: BrandColors.inkSoft, marginTop: 2 },
  rowValue: { fontSize: 13, color: BrandColors.inkSoft },

  chip: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: BrandColors.line,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: BrandColors.card,
  },
  chipActive: { backgroundColor: BrandColors.crimson, borderColor: BrandColors.crimson },
  chipText: { fontSize: 13, fontWeight: "600", color: BrandColors.ink },
  chipTextActive: { color: "#ffffff" },

  tag: {
    alignSelf: "flex-start",
    backgroundColor: BrandColors.paperDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: { fontSize: 11, fontWeight: "600", color: BrandColors.inkSoft },

  empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: BrandColors.ink },
  emptyText: {
    fontSize: 13.5,
    color: BrandColors.inkSoft,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },
  emptyBtn: {
    marginTop: 18,
    backgroundColor: BrandColors.crimson,
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: Space.radius,
  },
  emptyBtnText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
});

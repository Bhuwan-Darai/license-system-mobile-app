import React, { useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { type ThemeColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { Chip, ListGroup, ListRow, PageHeader, Space } from "@/components/ui/kit";
import { ThemeMode, useThemeStore } from "@/store/theme";
import { useQueryProfile } from "@/hooks/mobile/useProfile";
import { useQueryMyRegistration } from "@/hooks/mobile/useApplication";
import { useColors } from "@/hooks/use-theme";

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const titleCase = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");
const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

export default function ProfileScreen() {
  const BrandColors = useColors(); const styles = useMemo(() => createStyles(BrandColors), [BrandColors]);

  const router = useRouter();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const profile = useQueryProfile();
  const registration = useQueryMyRegistration();

  const me = profile.data ?? user;
  const name = me?.name || me?.email || "User";
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U";
  const reg = registration.data;
  const refreshing = profile.isRefetching || registration.isRefetching;

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["mobile-profile"] });
    queryClient.invalidateQueries({ queryKey: ["my-registration"] });
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Profile" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          {me?.email ? <Text style={styles.email}>{me.email}</Text> : null}
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <ListGroup>
          <ListRow title="Name" value={me?.name || "-"} />
          <ListRow title="Email" value={me?.email || "-"} />
          <ListRow title="Account type" value={titleCase(profile.data?.role_name || me?.role) || "-"} />
          {profile.data?.language ? <ListRow title="Language" value={profile.data.language} /> : null}
          {profile.data?.fiscal_year_id ? (
            <ListRow title="Fiscal year" value={profile.data.fiscal_year_id} />
          ) : null}
        </ListGroup>

        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.chips}>
          {THEME_OPTIONS.map((o) => (
            <Chip key={o.value} label={o.label} active={themeMode === o.value} onPress={() => setThemeMode(o.value)} />
          ))}
        </View>

        <Text style={styles.sectionLabel}>License application</Text>
        <ListGroup>
          {reg ? (
            <>
              <ListRow title="Status" value={titleCase(reg.status)} />
              <ListRow title="Category" value={reg.license_category || "-"} />
              <ListRow title="Applied on" value={formatDate(reg.created_at) || "-"} />
              <ListRow title="Last updated" value={formatDate(reg.updated_at) || "-"} />
              {reg.remarks ? <ListRow title="Remarks" subtitle={reg.remarks} /> : null}
              <ListRow title="View full status" onPress={() => router.push("/more/status" as any)} />
            </>
          ) : (
            <ListRow
              title="Apply for a new license"
              subtitle={registration.isLoading ? "Loading..." : "You have not applied yet"}
              onPress={() => router.push("/more/register-license" as any)}
            />
          )}
        </ListGroup>

        <Text style={styles.sectionLabel}>More</Text>
        <ListGroup>
          <ListRow title="My practice attempts" onPress={() => router.push("/practice/history" as any)} />
          <ListRow title="Log out" destructive chevron={false} onPress={() => signOut()} />
        </ListGroup>
      </ScrollView>
    </View>
  );
}

const createStyles = (BrandColors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { paddingHorizontal: Space.page, paddingBottom: 40 },
  chips: { flexDirection: "row", gap: 8 },
  hero: { alignItems: "center", paddingVertical: 18 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: BrandColors.crimson,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  name: { fontSize: 19, fontWeight: "700", color: BrandColors.ink, marginTop: 10 },
  email: { fontSize: 13.5, color: BrandColors.inkSoft, marginTop: 2 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: BrandColors.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
});

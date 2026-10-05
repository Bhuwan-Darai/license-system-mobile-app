import { BrandColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MoreScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const menuTiles = [
    { label: "Blog / Guide", emoji: "📖", route: "/more/blog" },
    { label: "License Status", emoji: "🎫", route: "/more/status" },
    { label: "Traffic Symbols", emoji: "🔺", route: "/more/signs" },
    { label: "Ishihara Test", emoji: "🎨", route: "/more/ishihara" },
    { label: "Emergency Numbers", emoji: "🚑", route: "/more/emergency" },
    { label: "Bus Fare List", emoji: "🚌", route: "/more/busfare" },
  ];

  const handlePressTile = (route: string) => {
    router.push(route as any);
  };

  const handlePressLogout = async () => {
    await signOut();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      {/* Grid Menu */}
      <View style={styles.grid}>
        {menuTiles.map((tile, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tile}
            onPress={() => handlePressTile(tile.route)}
            activeOpacity={0.8}
          >
            <Text style={styles.tileEmoji}>{tile.emoji}</Text>
            <Text style={styles.tileLabel}>{tile.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handlePressLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutEmoji}>🚪</Text>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.paper,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: BrandColors.ink,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  tile: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: BrandColors.line,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  tileEmoji: {
    fontSize: 22,
    marginBottom: 8,
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BrandColors.ink,
    textAlign: "center",
  },
  section: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: BrandColors.line,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutEmoji: {
    fontSize: 18,
  },
  logoutText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: BrandColors.crimson,
  },
});

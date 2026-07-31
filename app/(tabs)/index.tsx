import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { BrandColors } from "@/constants/theme";

export default function HomeDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const notices = [
    { id: 1, title: "Written exam pattern", tag: "Notice", desc: "25 MCQs · 30 minutes · 60% to pass, per the official DoTM question bank." },
    { id: 2, title: "License validity", tag: "Notice", desc: "Category A & B cards are valid 5 years; renew before expiry to avoid retaking exams." },
    { id: 3, title: "Smart card rollout", tag: "Notice", desc: "Biometric and smart card printing updates are published per Transport Office." },
  ];

  const quickActions = [
    { label: "Practice MCQ", icon: "document-text-outline", emoji: "📝", route: "/(tabs)/practice" },
    { label: "Ishihara Test", icon: "color-palette-outline", emoji: "🎨", route: "/more/ishihara" },
    { label: "Traffic Signs", icon: "warning-outline", emoji: "🔺", route: "/more/signs" },
    { label: "License Status", icon: "card-outline", emoji: "🎫", route: "/more/status" },
  ];

  const handleAction = (route: string) => {
    router.push(route as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greeting}>नमस्ते 👋</Text>
          <Text style={styles.userName}>
            {user?.isGuest ? "Guest User" : user?.phone || "Sujata Rai"}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={20} color={BrandColors.ink} />
        </TouchableOpacity>
      </View>

      {/* Progress Card */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreHeader}>CATEGORY B · LAST SCORE</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>21/25</Text>
          <Text style={styles.scorePercentage}>84% · Passed ✓</Text>
        </View>
      </View>

      {/* Quick Action Grid */}
      <View style={styles.gridContainer}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.gridCard}
            onPress={() => handleAction(action.route)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardEmoji}>{action.emoji}</Text>
            <Text style={styles.cardLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* News Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Latest news</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/news")} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Notice Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
      >
        {notices.map((notice) => (
          <TouchableOpacity
            key={notice.id}
            style={styles.noticeCard}
            onPress={() => router.push("/(tabs)/news")}
            activeOpacity={0.8}
          >
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{notice.tag}</Text>
            </View>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            <Text style={styles.noticeDesc} numberOfLines={2}>
              {notice.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 12,
    color: BrandColors.inkSoft,
    fontWeight: "600",
  },
  userName: {
    fontSize: 17,
    fontWeight: "800",
    color: BrandColors.ink,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BrandColors.paperDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BrandColors.line,
  },
  scoreCard: {
    backgroundColor: BrandColors.himalaya,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: BrandColors.himalaya,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  scoreHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
    opacity: 0.85,
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 6,
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
  },
  scorePercentage: {
    fontSize: 12.5,
    color: "#ffffff",
    opacity: 0.9,
    fontWeight: "600",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  gridCard: {
    width: "48%",
    aspectRatio: 1.3,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: BrandColors.line,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: BrandColors.ink,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: BrandColors.ink,
  },
  seeAllText: {
    fontSize: 12,
    color: BrandColors.himalaya,
    fontWeight: "700",
  },
  carouselContainer: {
    gap: 10,
    paddingBottom: 4,
  },
  noticeCard: {
    width: 170,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: BrandColors.line,
    borderRadius: 16,
    padding: 14,
  },
  tagContainer: {
    alignSelf: "flex-start",
    backgroundColor: BrandColors.paperDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: BrandColors.inkSoft,
    textTransform: "uppercase",
  },
  noticeTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: BrandColors.ink,
    marginBottom: 4,
  },
  noticeDesc: {
    fontSize: 11.5,
    color: BrandColors.inkSoft,
    lineHeight: 15,
  },
});

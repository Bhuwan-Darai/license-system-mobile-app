import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BrandColors } from "@/constants/theme";

export default function NewsScreen() {
  const newsItems = [
    {
      title: "Written exam pattern",
      tag: "Notice",
      date: "July 2, 2026",
      desc: "25 MCQs · 30 minutes · 60% to pass, per the official DoTM question bank. Minimum score to pass is 15 out of 25. Results are published on the same day.",
    },
    {
      title: "Booking & results update",
      tag: "Schedule",
      date: "June 28, 2026",
      desc: "Exam routines and biometrics schedules are published per local Transport Office. Please check your local transport office bulletin board or SMS system for exact dates.",
    },
    {
      title: "License validity & renewal rules",
      tag: "Notice",
      date: "June 15, 2026",
      desc: "Category A & B cards are valid for 5 years. Renew before the expiry date to avoid late fees or having to retake the written and trial examinations.",
    },
    {
      title: "Smart card delivery status",
      tag: "Updates",
      date: "June 10, 2026",
      desc: "DoTM announces faster smart card printing machine updates. Check if your license card is printed using the online query status page.",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>News & notices</Text>
      </View>

      {/* List */}
      <View style={styles.list}>
        {newsItems.map((notice, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.metaRow}>
              <View style={styles.tagContainer}>
                <Text style={styles.tagText}>{notice.tag}</Text>
              </View>
              <Text style={styles.dateText}>{notice.date}</Text>
            </View>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            <Text style={styles.noticeDesc}>{notice.desc}</Text>
          </View>
        ))}
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
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: BrandColors.line,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tagContainer: {
    backgroundColor: BrandColors.paperDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: BrandColors.inkSoft,
    textTransform: "uppercase",
  },
  dateText: {
    fontSize: 11,
    color: BrandColors.inkSoft,
    fontWeight: "600",
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: BrandColors.ink,
    marginBottom: 6,
  },
  noticeDesc: {
    fontSize: 12.5,
    color: BrandColors.inkSoft,
    lineHeight: 18,
    fontWeight: "500",
  },
});

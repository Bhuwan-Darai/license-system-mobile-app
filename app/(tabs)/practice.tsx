import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { BrandColors } from "@/constants/theme";

export default function PracticeScreen() {
  const router = useRouter();

  const categories = [
    { code: "A", name: "Motorcycle / Scooter", age: "16+", color: BrandColors.himalaya },
    { code: "B", name: "Car / Jeep / Delivery Van", age: "18+", color: BrandColors.crimson },
    { code: "C", name: "Tempo / Auto Rickshaw", age: "18+", color: BrandColors.himalaya },
    { code: "D", name: "Heavy Bus / Truck / Tipper", age: "21+", color: BrandColors.crimson },
    { code: "K", name: "Tractor / Power Tiller", age: "18+", color: BrandColors.himalaya },
  ];

  const handleSelectCategory = (categoryCode: string) => {
    router.push({
      pathname: "/practice/mcq",
      params: { category: categoryCode },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose vehicle type</Text>
        <Text style={styles.subtitle}>
          Step 1 of 2 — pick a category to load its official DoTM question bank.
        </Text>
      </View>

      {/* Grid List */}
      <View style={styles.grid}>
        {categories.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => handleSelectCategory(item.code)}
            activeOpacity={0.8}
          >
            <View style={[styles.badgeCircle, { borderColor: item.color }]}>
              <Text style={[styles.badgeText, { color: item.color }]}>{item.code}</Text>
            </View>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardAge}>Age {item.age}</Text>
          </TouchableOpacity>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    color: BrandColors.inkSoft,
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: BrandColors.line,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: "800",
  },
  cardName: {
    fontSize: 13,
    fontWeight: "800",
    color: BrandColors.ink,
    textAlign: "center",
    marginBottom: 2,
    height: 36, // Ensure alignment with multiline
  },
  cardAge: {
    fontSize: 11,
    color: BrandColors.inkSoft,
    fontWeight: "600",
  },
});

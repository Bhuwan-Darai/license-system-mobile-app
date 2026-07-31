import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BrandColors } from "@/constants/theme";

export default function CategoryScreen() {
  const [search, setSearch] = useState("");
  const [expandedCode, setExpandedCode] = useState<string | null>("B");

  const categories = [
    { code: "A", name: "Motorcycle & Scooter", age: "16+", detail: "Fee ≈ NPR 1,500 · Valid 5 years · Requires written exam + trial test on motorcycle." },
    { code: "B", name: "Car, Jeep & Van", age: "18+", detail: "Fee ≈ NPR 2,000 · Valid 5 years · Requires written exam + trial test on light car." },
    { code: "C", name: "Tempo / Auto Rickshaw", age: "18+", detail: "Fee ≈ NPR 2,000 · Valid 5 years · Requires written exam + trial test." },
    { code: "D", name: "Power Tiller / Tractor", age: "18+", detail: "Fee ≈ NPR 2,000 · Valid 5 years · Requires basic controls check." },
    { code: "E", name: "Heavy Bus / Truck / Tipper", age: "21+", detail: "Fee ≈ NPR 3,000 · Valid 5 years · Requires Category B license held for 2+ years before applying." },
    { code: "F", name: "Minibus / Mini Truck", age: "21+", detail: "Fee ≈ NPR 2,500 · Valid 5 years · Requires Category B held for 1+ years." },
    { code: "K", name: "Scooter / Moped", age: "16+", detail: "Fee ≈ NPR 1,500 · Valid 5 years · Simplified trial layout." },
  ];

  const filteredCategories = categories.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (code: string) => {
    setExpandedCode(expandedCode === code ? null : code);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>License categories</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchField}
          placeholder="🔍 Search category"
          placeholderTextColor={BrandColors.inkSoft}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredCategories.map((item, index) => {
          const isExpanded = expandedCode === item.code;
          return (
            <View key={index} style={styles.cardContainer}>
              <TouchableOpacity
                style={[
                  styles.card,
                  isExpanded && styles.expandedCardBorder,
                ]}
                onPress={() => toggleExpand(item.code)}
                activeOpacity={0.8}
              >
                <View style={styles.badgeCircle}>
                  <Text style={styles.badgeText}>{item.code}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardAge}>Minimum age {item.age}</Text>
                </View>
                <Text style={styles.arrowText}>{isExpanded ? "▾" : "▸"}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.detailContainer}>
                  <Text style={styles.detailText}>{item.detail}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.paper,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: BrandColors.ink,
  },
  searchContainer: {
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  searchField: {
    width: "100%",
    padding: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BrandColors.line,
    fontSize: 14,
    backgroundColor: "#ffffff",
    color: BrandColors.ink,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    gap: 8,
  },
  cardContainer: {
    marginBottom: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: BrandColors.line,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  expandedCardBorder: {
    borderColor: BrandColors.himalaya,
  },
  badgeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: BrandColors.crimson,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: BrandColors.crimson,
  },
  infoContainer: {
    flex: 1,
  },
  cardName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: BrandColors.ink,
    marginBottom: 2,
  },
  cardAge: {
    fontSize: 11.5,
    color: BrandColors.inkSoft,
    fontWeight: "600",
  },
  arrowText: {
    fontSize: 16,
    color: BrandColors.inkSoft,
    fontWeight: "800",
  },
  detailContainer: {
    backgroundColor: BrandColors.paperDim,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: BrandColors.line,
  },
  detailText: {
    fontSize: 12,
    color: BrandColors.inkSoft,
    lineHeight: 18,
    fontWeight: "600",
  },
});

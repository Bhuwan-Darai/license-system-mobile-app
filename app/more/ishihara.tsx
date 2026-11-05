import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BrandColors } from "@/constants/theme";
import {
  IshiharaCategory,
  useQueryIshiharaCategories,
  useQueryIshiharaPlates,
} from "@/hooks/mobile/useMobileContent";

// Step 1: pick a category. Step 2: view that category's plates.
export default function Ishihara() {
  const [selected, setSelected] = useState<IshiharaCategory | null>(null);
  const categories = useQueryIshiharaCategories();
  const plates = useQueryIshiharaPlates(selected?.ishihara_category_id);

  if (selected) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backRow} onPress={() => setSelected(null)}>
          <Text style={styles.backText}>‹ All categories</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>{selected.title}</Text>
        {plates.isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color={BrandColors.crimson} />
        ) : (
          <FlatList
            contentContainerStyle={styles.list}
            data={plates.data ?? []}
            keyExtractor={(p) => p.plate_id}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {plates.error ? "Could not load plates." : "No plates in this category yet."}
              </Text>
            }
            renderItem={({ item, index }) => (
              <View style={styles.plateCard}>
                <Text style={styles.plateTitle}>
                  {index + 1}. {item.title}
                </Text>
                <Image source={{ uri: item.image_url }} style={styles.plate} resizeMode="contain" />
              </View>
            )}
          />
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.list}>
      <Text style={styles.subtitle}>Pick a category to view its Ishihara plates.</Text>
      {categories.isLoading ? (
        <ActivityIndicator size="large" color={BrandColors.crimson} />
      ) : (categories.data ?? []).length === 0 ? (
        <Text style={styles.empty}>
          {categories.error ? "Could not load categories." : "No categories available yet."}
        </Text>
      ) : (
        <View style={styles.grid}>
          {(categories.data ?? []).map((c) => (
            <TouchableOpacity
              key={c.ishihara_category_id}
              style={styles.catCard}
              activeOpacity={0.8}
              onPress={() => setSelected(c)}
            >
              {c.image ? <Image source={{ uri: c.image }} style={styles.catImage} /> : null}
              <Text style={styles.catName} numberOfLines={2}>
                {c.title}
              </Text>
              <Text style={styles.catMeta}>
                {c.plate_count} {c.plate_count === 1 ? "plate" : "plates"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  list: { padding: 18, gap: 12 },
  subtitle: { fontSize: 12.5, color: BrandColors.inkSoft, lineHeight: 18 },
  empty: { textAlign: "center", color: BrandColors.inkSoft, marginTop: 40 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catCard: {
    width: "48%",
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  catImage: { width: 72, height: 72, borderRadius: 36 },
  catName: { fontSize: 13, fontWeight: "700", color: BrandColors.ink, textAlign: "center" },
  catMeta: { fontSize: 11, color: BrandColors.inkSoft, fontWeight: "600" },
  backRow: { paddingHorizontal: 18, paddingTop: 14 },
  backText: { color: BrandColors.himalaya, fontWeight: "700", fontSize: 14 },
  heading: { fontSize: 18, fontWeight: "700", color: BrandColors.ink, paddingHorizontal: 18, paddingTop: 8 },
  plateCard: {
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    alignItems: "center",
  },
  plateTitle: { fontSize: 14, fontWeight: "700", color: BrandColors.ink, alignSelf: "flex-start" },
  plate: { width: "100%", height: 260 },
});

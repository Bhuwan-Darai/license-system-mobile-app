import { BrandColors } from "@/constants/theme";
import { useQueryVehicleCategories } from "@/hooks/category/useCategoryQuery";
import { Card, EmptyState, PageHeader, Space } from "@/components/ui/kit";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface VehicleCategory {
  ID: number;
  VehicleCategoryID: string;
  Title: string;
  Description: string;
  Image: string;
  CreatedAt: string;
  CreatedBy: string;
  UpdatedAt: string;
  UpdatedBy?: string | null;
}

export default function CategoryScreen() {
  const [search, setSearch] = useState("");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const { categories, isLoading } = useQueryVehicleCategories();

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category: VehicleCategory) =>
      category.Title.toLowerCase().includes(query)
    );
  }, [categories, search]);

  const toggleExpand = (id: string) => {
    setExpandedCode((current) => (current === id ? null : id));
  };

  return (
    <View style={styles.container}>
      <PageHeader
        title="License categories"
        subtitle="Vehicle classes and what each one allows."
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchField}
          placeholder="Search categories"
          placeholderTextColor={BrandColors.inkSoft}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={BrandColors.crimson} />
      ) : filteredCategories.length === 0 ? (
        <EmptyState title="No categories found" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filteredCategories.map((item: VehicleCategory) => {
            const isExpanded = expandedCode === item.VehicleCategoryID;
            return (
              <Card key={item.VehicleCategoryID} style={styles.card}>
                <TouchableOpacity
                  style={styles.cardHead}
                  onPress={() => toggleExpand(item.VehicleCategoryID)}
                  activeOpacity={0.7}
                >
                  <View style={styles.thumb}>
                    {item.Image ? (
                      <Image
                        source={{ uri: item.Image }}
                        style={styles.vehicleImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.thumbText}>{item.Title.charAt(0)}</Text>
                    )}
                  </View>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {item.Title}
                  </Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={BrandColors.inkSoft}
                  />
                </TouchableOpacity>

                {isExpanded && item.Description ? (
                  <Text style={styles.detailText}>{item.Description}</Text>
                ) : null}
              </Card>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  searchContainer: { paddingHorizontal: Space.page, marginBottom: 14 },
  searchField: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Space.radius,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: BrandColors.line,
    fontSize: 15,
    backgroundColor: BrandColors.card,
    color: BrandColors.ink,
  },
  listContent: { paddingHorizontal: Space.page, paddingBottom: 40, gap: 10 },
  card: { padding: 12 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: BrandColors.paperDim,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  vehicleImage: { width: 40, height: 40 },
  thumbText: { fontSize: 17, fontWeight: "700", color: BrandColors.crimson },
  cardName: { flex: 1, fontSize: 15, fontWeight: "600", color: BrandColors.ink },
  detailText: {
    fontSize: 13.5,
    color: BrandColors.inkSoft,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: BrandColors.line,
  },
});

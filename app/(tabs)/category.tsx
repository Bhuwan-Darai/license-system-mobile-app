import { BrandColors } from "@/constants/theme";
import { useQueryVehicleCategories } from "@/hooks/category/useCategoryQuery";
import React, { useMemo, useState } from "react";
import {
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

type CategoryItem = {
  id: string;
  code: string;
  name: string;
  detail: string;
};

export default function CategoryScreen() {
  const [search, setSearch] = useState("");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const { categories, isLoading } = useQueryVehicleCategories();

  /**
   * Search categories
   */
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category: VehicleCategory) => {
      return category.Title.toLowerCase().includes(query);
    });
  }, [categories, search]);

  const toggleExpand = (id: string) => {
    setExpandedCode((current) => (current === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>License Categories</Text>
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

      {/* Loading */}
      {isLoading && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>Loading categories...</Text>
        </View>
      )}

      {/* Empty */}
      {!isLoading && filteredCategories.length === 0 && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>No categories found.</Text>
        </View>
      )}

      {/* List */}
      {!isLoading && filteredCategories.length > 0 && (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredCategories.map((item: VehicleCategory) => {
            const isExpanded = expandedCode === item.VehicleCategoryID;

            return (
              <View key={item.VehicleCategoryID} style={styles.cardContainer}>
                <TouchableOpacity
                  style={[styles.card, isExpanded && styles.expandedCardBorder]}
                  onPress={() => toggleExpand(item.VehicleCategoryID)}
                  activeOpacity={0.8}
                >
                  {/* Vehicle Image */}
                  <View style={styles.badgeCircle}>
                    {item.Image ? (
                      <Image
                        source={{ uri: item.Image }}
                        style={styles.vehicleImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.badgeText}>
                        {item.Title.charAt(0)}
                      </Text>
                    )}
                  </View>

                  {/* Information */}
                  <View style={styles.infoContainer}>
                    <Text style={styles.cardName} numberOfLines={2}>
                      {item.Title}
                    </Text>
                  </View>

                  {/* Arrow */}
                  <Text style={styles.arrowText}>{isExpanded ? "▾" : "▸"}</Text>
                </TouchableOpacity>

                {isExpanded && item.Description && (
                  <View style={styles.detailContainer}>
                    <Text style={styles.detailText}>{item.Description}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
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
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: BrandColors.crimson,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  vehicleImage: {
    width: 42,
    height: 42,
  },

  badgeText: {
    fontSize: 18,
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

  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  stateText: {
    fontSize: 14,
    color: BrandColors.inkSoft,
    fontWeight: "600",
  },
});

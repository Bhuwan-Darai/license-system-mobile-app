import React, { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { BrandColors } from "@/constants/theme";
import { useQueryBlogCategories, useQueryBlogs } from "@/hooks/mobile/useMobileContent";

export default function Blog() {
  const router = useRouter();
  const [category, setCategory] = useState<string | undefined>();
  const [searchInput, setSearchInput] = useState(""); // what the user types
  const [search, setSearch] = useState(""); // debounced value used for the query
  const applySearch = useMemo(() => debounce(setSearch, 400), []);
  useEffect(() => () => applySearch.cancel(), [applySearch]);

  const categories = useQueryBlogCategories();
  const blogs = useQueryBlogs(category, search.trim());

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search guides"
        placeholderTextColor={BrandColors.inkSoft}
        value={searchInput}
        onChangeText={(text) => {
          setSearchInput(text);
          applySearch(text);
        }}
      />
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" active={!category} onPress={() => setCategory(undefined)} />
          {(categories.data ?? []).map((c) => (
            <Chip
              key={c.blog_category_id}
              label={c.title}
              active={category === c.blog_category_id}
              onPress={() => setCategory(c.blog_category_id)}
            />
          ))}
        </ScrollView>
      </View>

      {blogs.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={BrandColors.crimson} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={blogs.data ?? []}
          keyExtractor={(b) => b.blog_id}
          refreshControl={<RefreshControl refreshing={blogs.isRefetching} onRefresh={blogs.refetch} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {blogs.error ? "Could not load guides." : "No guides available yet."}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                router.push({ pathname: "/more/blogpost", params: { id: item.blog_id } })
              }
            >
              {item.cover_image ? (
                <Image source={{ uri: item.cover_image }} style={styles.cover} />
              ) : null}
              <View style={styles.cardBody}>
                {item.category ? <Text style={styles.tag}>{item.category}</Text> : null}
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  search: {
    margin: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: BrandColors.card,
    color: BrandColors.ink,
  },
  chips: { paddingHorizontal: 18, paddingVertical: 8, gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: BrandColors.card,
  },
  chipActive: { backgroundColor: BrandColors.crimson, borderColor: BrandColors.crimson },
  chipText: { fontSize: 12.5, fontWeight: "700", color: BrandColors.ink },
  chipTextActive: { color: "#fff" },
  list: { padding: 18, gap: 12 },
  empty: { textAlign: "center", color: BrandColors.inkSoft, marginTop: 40 },
  card: {
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    overflow: "hidden",
  },
  cover: { width: "100%", height: 150 },
  cardBody: { padding: 14, gap: 4 },
  tag: { fontSize: 11, fontWeight: "700", color: BrandColors.himalaya },
  title: { fontSize: 15, fontWeight: "700", color: BrandColors.ink },
  subtitle: { fontSize: 12.5, color: BrandColors.inkSoft, lineHeight: 18 },
});

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

import { BrandColors } from "@/constants/theme";
import { useQuerySignalCategories, useQuerySignals } from "@/hooks/mobile/useMobileContent";

export default function Signs() {
  const [category, setCategory] = useState<string | undefined>();
  const [searchInput, setSearchInput] = useState(""); // what the user types
  const [search, setSearch] = useState(""); // debounced value used for the query
  const applySearch = useMemo(() => debounce(setSearch, 400), []);
  useEffect(() => () => applySearch.cancel(), [applySearch]);

  const categories = useQuerySignalCategories();
  const signals = useQuerySignals(category, search.trim());

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search traffic symbols"
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
              key={c.traffic_signal_category_id}
              label={c.title}
              active={category === c.traffic_signal_category_id}
              onPress={() => setCategory(c.traffic_signal_category_id)}
            />
          ))}
        </ScrollView>
      </View>

      {signals.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={BrandColors.crimson} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={signals.data ?? []}
          keyExtractor={(s) => s.traffic_signal_id}
          refreshControl={<RefreshControl refreshing={signals.isRefetching} onRefresh={signals.refetch} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {signals.error ? "Could not load traffic symbols." : "No traffic symbols found."}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
              ) : null}
              <View style={styles.info}>
                <Text style={styles.title}>{item.english_title}</Text>
                <Text style={styles.nepali}>{item.title}</Text>
                <Text style={styles.desc}>{item.english_description}</Text>
                <Text style={styles.desc}>{item.description}</Text>
              </View>
            </View>
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
  list: { padding: 18, gap: 10 },
  empty: { textAlign: "center", color: BrandColors.inkSoft, marginTop: 40 },
  card: {
    flexDirection: "row",
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  image: { width: 80, height: 80 },
  info: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: "700", color: BrandColors.ink },
  nepali: { fontSize: 13, fontWeight: "700", color: BrandColors.himalaya },
  desc: { fontSize: 12, color: BrandColors.inkSoft, lineHeight: 17 },
});

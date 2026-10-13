import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BrandColors } from "@/constants/theme";
import { useQueryEmergencyNumbers } from "@/hooks/mobile/useMobileContent";

export default function Emergency() {
  const { data, isLoading, isRefetching, refetch, error } = useQueryEmergencyNumbers();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BrandColors.crimson} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={data ?? []}
      keyExtractor={(e) => e.emergency_number_id}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      ListEmptyComponent={
        <Text style={styles.empty}>
          {error ? "Could not load emergency numbers." : "No emergency numbers available."}
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.number}>{item.emergency_number}</Text>
          </View>
          <TouchableOpacity
            style={styles.callBtn}
            activeOpacity={0.8}
            onPress={() =>
              Linking.openURL(`tel:${item.emergency_number.replace(/\s+/g, "")}`)
            }
          >
            <Text style={styles.callText}>Call</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 18, gap: 10 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: BrandColors.paper },
  empty: { textAlign: "center", color: BrandColors.inkSoft, marginTop: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "700", color: BrandColors.ink },
  number: { fontSize: 18, fontWeight: "700", color: BrandColors.crimson, marginTop: 2 },
  callBtn: {
    backgroundColor: BrandColors.crimson,
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  callText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});

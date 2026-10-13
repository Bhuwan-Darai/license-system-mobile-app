import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { BrandColors } from "@/constants/theme";
import { PracticeSet, useQueryPracticeSets } from "@/hooks/practice/usePractice";

export default function MCQ() {
  const router = useRouter();
  const { category, categoryTitle } = useLocalSearchParams<{
    category?: string;
    categoryTitle?: string;
  }>();
  const { data, isLoading, isRefetching, refetch, error } =
    useQueryPracticeSets(category);

  const handleStart = (set: PracticeSet) => {
    router.push({
      pathname: "/practice/quiz",
      params: { bankId: set.question_bank_id, title: set.title },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BrandColors.crimson} />
      </View>
    );
  }

  return (
    <>
    <Stack.Screen options={{ title: categoryTitle ?? "MCQ Sets" }} />
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={data ?? []}
      keyExtractor={(item) => item.question_bank_id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListHeaderComponent={
        <Text style={styles.subtitle}>
          Pick a set and tap Start to practice all of its questions.
        </Text>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          {error ? "Could not load MCQ sets." : "No MCQ sets available yet."}
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {item.category} · {item.question_count} questions
            </Text>
          </View>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => handleStart(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.startText}>Start</Text>
          </TouchableOpacity>
        </View>
      )}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 18, gap: 10 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.paper,
  },
  subtitle: {
    fontSize: 12.5,
    color: BrandColors.inkSoft,
    lineHeight: 18,
    marginBottom: 6,
  },
  empty: {
    textAlign: "center",
    color: BrandColors.inkSoft,
    marginTop: 40,
  },
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
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: BrandColors.ink },
  cardMeta: { fontSize: 11.5, color: BrandColors.inkSoft, marginTop: 3 },
  startBtn: {
    backgroundColor: BrandColors.crimson,
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  startText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});

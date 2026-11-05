import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { BrandColors } from "@/constants/theme";
import { useQueryPracticeAttempt } from "@/hooks/practice/usePractice";

export default function PracticeAttempt() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useQueryPracticeAttempt(id ?? null);

  if (isLoading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={BrandColors.crimson} />
      </View>
    );
  }

  const { attempt, answers } = data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.summary}>
        <Stat label="Correct" value={attempt.correct_count} color={BrandColors.forest} />
        <Stat label="Incorrect" value={attempt.incorrect_count} color={BrandColors.crimson} />
        <Stat label="Skipped" value={attempt.unanswered_count} color={BrandColors.inkSoft} />
      </View>

      {answers.map((a, i) => (
        <View key={a.question_id} style={styles.card}>
          <Text style={styles.question}>
            {i + 1}. {a.question_text}
          </Text>
          <Text
            style={[
              styles.line,
              { color: a.is_correct ? BrandColors.forest : BrandColors.crimson },
            ]}
          >
            Your answer: {a.selected_option_text ?? "Not answered"}
          </Text>
          {!a.is_correct && (
            <Text style={[styles.line, { color: BrandColors.forest }]}>
              Correct answer: {a.correct_option_text ?? "-"}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statNum, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 18, gap: 10, paddingBottom: 32 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: BrandColors.paper },
  summary: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 16,
  },
  stat: { alignItems: "center" },
  statNum: { fontSize: 30, fontWeight: "700" },
  statLabel: { fontSize: 12, fontWeight: "700", color: BrandColors.inkSoft },
  card: {
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  question: { fontSize: 13.5, fontWeight: "700", color: BrandColors.ink },
  line: { fontSize: 12.5, fontWeight: "600" },
});

import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { BrandColors } from "@/constants/theme";
import {
  useQueryPracticeReport,
  type PracticeReportRow,
} from "@/hooks/practice/usePractice";

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

const formatScore = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)}%`;

export default function PracticeHistory() {
  const router = useRouter();
  const latest = useQueryPracticeReport("latest", 50);
  const highest = useQueryPracticeReport("highest", 5);
  const lowest = useQueryPracticeReport("lowest", 5);

  const openAttempt = (id: string) =>
    router.push({ pathname: "/practice/attempt", params: { id } } as any);

  if (latest.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={BrandColors.crimson} />
      </View>
    );
  }

  const attempts = latest.data ?? [];
  const best = highest.data?.[0];
  const worst = lowest.data?.[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {attempts.length > 0 && (
        <View style={styles.scoreRow}>
          <ScoreCard label="Highest score" row={best} color={BrandColors.forest} onPress={openAttempt} />
          <ScoreCard label="Lowest score" row={worst} color={BrandColors.crimson} onPress={openAttempt} />
        </View>
      )}

      <Text style={styles.sectionTitle}>Previous attempts</Text>

      {attempts.length === 0 ? (
        <Text style={styles.empty}>
          You have no finished practice attempts yet. Take a practice set and it will show up here.
        </Text>
      ) : (
        attempts.map((a) => (
          <TouchableOpacity
            key={a.attempt_id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => openAttempt(a.attempt_id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {a.exam_title ? `${a.question_bank_title} · ${a.exam_title}` : a.question_bank_title}
              </Text>
              <Text style={styles.cardMeta}>
                {formatDate(a.submitted_at ?? a.started_at)} · {a.correct_count}/{a.total_questions} correct
              </Text>
            </View>
            <Text
              style={[
                styles.cardScore,
                { color: a.score_percent >= 50 ? BrandColors.forest : BrandColors.crimson },
              ]}
            >
              {formatScore(a.score_percent)}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

function ScoreCard({
  label,
  row,
  color,
  onPress,
}: {
  label: string;
  row?: PracticeReportRow;
  color: string;
  onPress: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.scoreCard, { borderColor: color }]}
      activeOpacity={0.8}
      disabled={!row}
      onPress={() => row && onPress(row.attempt_id)}
    >
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={[styles.scoreValue, { color }]}>{row ? formatScore(row.score_percent) : "-"}</Text>
      {row && (
        <Text style={styles.cardMeta} numberOfLines={1}>
          {row.question_bank_title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 18, gap: 10, paddingBottom: 32 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: BrandColors.paper },
  scoreRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  scoreCard: {
    flex: 1,
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 2,
  },
  scoreLabel: { fontSize: 11, fontWeight: "700", color: BrandColors.inkSoft },
  scoreValue: { fontSize: 28, fontWeight: "700" },
  sectionTitle: { fontSize: 14.5, fontWeight: "700", color: BrandColors.ink, marginTop: 4 },
  empty: { fontSize: 13, color: BrandColors.inkSoft, lineHeight: 19 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 14,
  },
  cardTitle: { fontSize: 13, fontWeight: "700", color: BrandColors.ink },
  cardMeta: { fontSize: 11.5, color: BrandColors.inkSoft, marginTop: 2 },
  cardScore: { fontSize: 18, fontWeight: "700" },
});

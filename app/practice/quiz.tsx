import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useNavigation, useRouter } from "expo-router";

import { BrandColors } from "@/constants/theme";
import {
  PracticeResult,
  PracticeSession,
  useLeavePractice,
  useQueryPracticeAttempt,
  useStartPractice,
  useSubmitPractice,
} from "@/hooks/practice/usePractice";

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const sec = totalSeconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export default function Quiz() {
  const router = useRouter();
  const navigation = useNavigation();
  const { bankId, examId, title } = useLocalSearchParams<{
    bankId: string;
    examId?: string;
    title?: string;
  }>();

  const [session, setSession] = useState<PracticeSession | null>(null);
  // question_id -> selected option_id
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [showReview, setShowReview] = useState(false);

  const start = useStartPractice();
  const submit = useSubmitPractice();
  const leave = useLeavePractice();
  const review = useQueryPracticeAttempt(showReview ? (result?.attempt_id ?? null) : null);
  const started = useRef(false);

  useEffect(() => {
    if (!bankId || started.current) return;
    started.current = true;
    start.mutate({ bankId, examId }, { onSuccess: setSession });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankId]);

  // ---- timer: counted down from the server clock so a wrong device clock cannot cheat it
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const clockOffset = useRef(0); // server time - device time, ms
  const expiredHandled = useRef(false);

  // the exam is live from start until it is submitted, timed out or force-ended
  const live = !!session && !result;

  // keep the latest values reachable from listeners without re-subscribing
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const liveRef = useRef(live);
  liveRef.current = live;
  const submittingRef = useRef(false);
  const pendingWarning = useRef<string | null>(null);

  const answerList = useCallback(
    () =>
      Object.entries(answersRef.current).map(([question_id, selected_option_id]) => ({
        question_id,
        selected_option_id,
      })),
    [],
  );

  const answeredCount = Object.keys(answers).length;
  const total = session?.questions.length ?? 0;

  const doSubmit = (onDone?: () => void) => {
    if (!session || submittingRef.current) return;
    submittingRef.current = true;
    submit.mutate(
      { attemptId: session.attempt_id, answers: answerList() },
      {
        onSuccess: (r) => {
          setResult(r);
          onDone?.();
        },
        onError: () => {
          submittingRef.current = false;
        },
      },
    );
  };

  useEffect(() => {
    if (!session) return;
    clockOffset.current = new Date(session.server_time).getTime() - Date.now();
    const expiresAt = new Date(session.expires_at).getTime();
    const tick = () => {
      const left = Math.max(
        0,
        Math.round((expiresAt - (Date.now() + clockOffset.current)) / 1000),
      );
      setSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  // time is up: submit what the student has and finish the exam
  useEffect(() => {
    if (secondsLeft !== 0 || !live || expiredHandled.current) return;
    expiredHandled.current = true;
    doSubmit(() => Alert.alert("Time is up", "Your exam has ended and was submitted."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, live]);

  // ---- leaving: 1st attempt warns, 2nd attempt ends the exam and marks it completed
  const reportLeave = useCallback(
    (alertNow: boolean) => {
      const current = session;
      if (!current || !liveRef.current || submittingRef.current) return;
      leave.mutate(
        { attemptId: current.attempt_id, answers: answerList() },
        {
          onSuccess: (res) => {
            if (res.ended) {
              submittingRef.current = true;
              if (res.attempt) setResult(res.attempt);
              Alert.alert(
                "Exam ended",
                "You left the exam again, so it has ended here. Your answers so far were submitted.",
              );
              return;
            }
            const message = res.warning ?? "Do not leave the exam.";
            if (alertNow) Alert.alert("Warning", message);
            else pendingWarning.current = message;
          },
        },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session],
  );

  // back button / swipe back / header back
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (!liveRef.current) return; // exam over: leaving is fine
      e.preventDefault();
      reportLeave(true);
    });
    const hw = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!liveRef.current) return false;
      reportLeave(true);
      return true;
    });
    return () => {
      unsubscribe();
      hw.remove();
    };
  }, [navigation, reportLeave]);

  // switching to another app counts as leaving; the warning is shown on return
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        reportLeave(false);
      } else if (state === "active" && pendingWarning.current) {
        Alert.alert("Warning", pendingWarning.current);
        pendingWarning.current = null;
      }
    });
    return () => sub.remove();
  }, [reportLeave]);

  const handleSubmit = () => {
    const left = total - answeredCount;
    if (left > 0) {
      Alert.alert(
        "Submit exam?",
        `${left} question${left > 1 ? "s are" : " is"} unanswered. They will count as incorrect.`,
        [
          { text: "Keep practicing", style: "cancel" },
          { text: "Submit", onPress: () => doSubmit() },
        ],
      );
    } else {
      doSubmit();
    }
  };

  const lowTime = secondsLeft !== null && secondsLeft <= 60;
  const screenTitle = (
    <Stack.Screen
      options={{
        title: title ?? "Practice",
        // no way out while the exam is running
        headerBackVisible: !live,
        gestureEnabled: !live,
        headerRight: () =>
          live && secondsLeft !== null ? (
            <Text style={[styles.timer, lowTime && styles.timerLow]}>
              {formatTime(secondsLeft)}
            </Text>
          ) : null,
      }}
    />
  );

  if (!session) {
    return (
      <View style={styles.center}>
        {screenTitle}
        {start.isError ? (
          <>
            <Text style={styles.muted}>Could not start this set.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
              <Text style={styles.primaryText}>Go back</Text>
            </TouchableOpacity>
          </>
        ) : (
          <ActivityIndicator size="large" color={BrandColors.crimson} />
        )}
      </View>
    );
  }

  if (result) {
    const reviewRows = review.data?.answers ?? [];
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {screenTitle}
        <View style={styles.resultCard}>
          <Text style={styles.resultHeading}>
            {result.end_reason === "LEFT_EXAM"
              ? "Exam ended (you left the exam)"
              : result.end_reason === "TIME_UP"
                ? "Time is up"
                : "Practice complete"}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: BrandColors.forest }]}>
                {result.correct_count}
              </Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: BrandColors.crimson }]}>
                {result.incorrect_count + result.unanswered_count}
              </Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
          </View>
          <Text style={styles.muted}>
            out of {result.total_questions} questions
            {result.unanswered_count > 0
              ? ` (${result.unanswered_count} unanswered)`
              : ""}
          </Text>
        </View>

        {!showReview ? (
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowReview(true)}>
            <Text style={styles.secondaryText}>Review answers</Text>
          </TouchableOpacity>
        ) : review.isLoading ? (
          <ActivityIndicator color={BrandColors.crimson} />
        ) : (
          reviewRows.map((a, i) => (
            <View key={a.question_id} style={styles.reviewCard}>
              <Text style={styles.qText}>
                {i + 1}. {a.question_text}
              </Text>
              <Text
                style={[
                  styles.reviewLine,
                  { color: a.is_correct ? BrandColors.forest : BrandColors.crimson },
                ]}
              >
                Your answer: {a.selected_option_text ?? "Not answered"}
              </Text>
              {!a.is_correct && (
                <Text style={[styles.reviewLine, { color: BrandColors.forest }]}>
                  Correct answer: {a.correct_option_text ?? "-"}
                </Text>
              )}
            </View>
          ))
        )}

        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryText}>Back to sets</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {screenTitle}
      <View style={[styles.timerBar, lowTime && styles.timerBarLow]}>
        <Text style={[styles.timerBarText, lowTime && styles.timerLow]}>
          Time left: {secondsLeft !== null ? formatTime(secondsLeft) : "--:--"}
        </Text>
        <Text style={styles.muted}>
          {answeredCount} of {total} answered
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {session.questions.map((q, i) => (
          <View key={q.question_id} style={styles.qCard}>
            <Text style={styles.qText}>
              {i + 1}. {q.title}
            </Text>
            {q.subtitle ? <Text style={styles.qSub}>{q.subtitle}</Text> : null}
            {q.options.map((o) => {
              const selected = answers[q.question_id] === o.option_id;
              return (
                <TouchableOpacity
                  key={o.option_id}
                  style={[styles.option, selected && styles.optionSelected]}
                  activeOpacity={0.8}
                  onPress={() =>
                    setAnswers((prev) => ({ ...prev, [q.question_id]: o.option_id }))
                  }
                >
                  <View style={[styles.radio, selected && styles.radioSelected]} />
                  <Text style={styles.optionText}>{o.option_text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <TouchableOpacity
          style={[styles.primaryBtn, submit.isPending && { opacity: 0.6 }]}
          disabled={submit.isPending}
          onPress={handleSubmit}
        >
          {submit.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Submit exam</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 18, gap: 12, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.paper,
    gap: 12,
  },
  timer: { fontSize: 16, fontWeight: "700", color: BrandColors.ink, marginRight: 8 },
  timerLow: { color: BrandColors.crimson },
  timerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: BrandColors.card,
    borderBottomWidth: 1.5,
    borderBottomColor: BrandColors.line,
  },
  timerBarLow: { backgroundColor: BrandColors.paperDim },
  timerBarText: { fontSize: 15, fontWeight: "700", color: BrandColors.ink },
  muted: { fontSize: 12.5, color: BrandColors.inkSoft, textAlign: "center" },
  qCard: {
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  qText: { fontSize: 14, fontWeight: "700", color: BrandColors.ink, lineHeight: 20 },
  qSub: { fontSize: 12, color: BrandColors.inkSoft },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 10,
  },
  optionSelected: {
    borderColor: BrandColors.himalaya,
    backgroundColor: BrandColors.paperDim,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: BrandColors.inkSoft,
  },
  radioSelected: {
    borderColor: BrandColors.himalaya,
    backgroundColor: BrandColors.himalaya,
  },
  optionText: { flex: 1, fontSize: 13, color: BrandColors.ink },
  primaryBtn: {
    backgroundColor: BrandColors.crimson,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: BrandColors.himalaya,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: { color: BrandColors.himalaya, fontWeight: "700", fontSize: 14 },
  resultCard: {
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  resultHeading: { fontSize: 18, fontWeight: "700", color: BrandColors.ink },
  statsRow: { flexDirection: "row", gap: 40 },
  stat: { alignItems: "center" },
  statNum: { fontSize: 40, fontWeight: "700" },
  statLabel: { fontSize: 12, fontWeight: "700", color: BrandColors.inkSoft },
  reviewCard: {
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  reviewLine: { fontSize: 12.5, fontWeight: "600" },
});

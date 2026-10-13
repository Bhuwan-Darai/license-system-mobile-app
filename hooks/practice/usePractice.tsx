import { useMutation, useQuery } from "@tanstack/react-query";

import api from "@/axios";

export interface PracticeCategory {
  question_bank_category_id: string;
  title: string;
  description: string;
  set_count: number;
}

export interface PracticeSet {
  question_bank_id: string;
  title: string;
  category: string;
  question_count: number;
}

export interface PracticeOption {
  option_id: string;
  option_text: string;
}

export interface PracticeQuestion {
  question_id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  options: PracticeOption[];
}

export interface PracticeSession {
  attempt_id: string;
  title: string;
  duration_minutes: number;
  expires_at: string;
  server_time: string;
  questions: PracticeQuestion[];
}

export interface PracticeAnswerReview {
  question_id: string;
  question_text: string;
  selected_option_id: string | null;
  selected_option_text: string | null;
  correct_option_id: string | null;
  correct_option_text: string | null;
  is_correct: boolean;
}

export interface PracticeResult {
  attempt_id: string;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  end_reason?: "SUBMITTED" | "TIME_UP" | "LEFT_EXAM";
}

export interface LeaveResponse {
  ended: boolean;
  leave_count?: number;
  warning?: string;
  attempt?: PracticeResult;
}

export const useQueryPracticeCategories = () =>
  useQuery({
    queryKey: ["practice-categories"],
    queryFn: async () => {
      const res: any = await api.get("/mobile/practice/categories");
      return (res.data ?? []) as PracticeCategory[];
    },
  });

export const useQueryPracticeSets = (categoryId?: string) =>
  useQuery({
    queryKey: ["practice-sets", categoryId ?? "all"],
    queryFn: async () => {
      const res: any = await api.get("/mobile/practice/sets", {
        params: categoryId ? { category: categoryId } : undefined,
      });
      return (res.data ?? []) as PracticeSet[];
    },
  });

export const useStartPractice = () =>
  useMutation({
    mutationFn: async (vars: { bankId: string; examId?: string }) => {
      const res: any = await api.post(
        `/mobile/practice/sets/${vars.bankId}/start`,
        undefined,
        { params: vars.examId ? { exam_id: vars.examId } : undefined },
      );
      return res.data as PracticeSession;
    },
  });

export const useSubmitPractice = () =>
  useMutation({
    mutationFn: async (vars: {
      attemptId: string;
      answers: { question_id: string; selected_option_id: string }[];
    }) => {
      const res: any = await api.post(
        `/mobile/practice/attempts/${vars.attemptId}/submit`,
        { answers: vars.answers },
      );
      return res.data as PracticeResult;
    },
  });

export const useLeavePractice = () =>
  useMutation({
    mutationFn: async (vars: {
      attemptId: string;
      answers: { question_id: string; selected_option_id: string }[];
    }) => {
      const res: any = await api.post(
        `/mobile/practice/attempts/${vars.attemptId}/leave`,
        { answers: vars.answers },
      );
      return res.data as LeaveResponse;
    },
  });

export interface PracticeReportRow {
  attempt_id: string;
  question_bank_title: string;
  exam_title?: string;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  score_percent: number;
  end_reason?: "SUBMITTED" | "TIME_UP" | "LEFT_EXAM";
  started_at: string;
  submitted_at?: string;
  time_taken_seconds: number;
}

/** Finished attempts: sort "latest" (default), "highest" or "lowest" score. */
export const useQueryPracticeReport = (
  sort: "latest" | "highest" | "lowest" = "latest",
  limit = 50,
) =>
  useQuery({
    queryKey: ["practice-report", sort, limit],
    queryFn: async () => {
      const res: any = await api.get("/mobile/practice/report", {
        params: { sort, limit },
      });
      return (res.data ?? []) as PracticeReportRow[];
    },
  });

export const useQueryPracticeAttempt =(attemptId: string | null) =>
  useQuery({
    queryKey: ["practice-attempt", attemptId],
    enabled: !!attemptId,
    queryFn: async () => {
      const res: any = await api.get(`/mobile/practice/attempts/${attemptId}`);
      return res.data as {
        attempt: PracticeResult;
        answers: PracticeAnswerReview[];
      };
    },
  });

import React, { useMemo } from "react";
import { Stack, useLocalSearchParams } from "expo-router";

import HtmlPage from "@/components/ui/HtmlPage";
import { useQueryPolicy } from "@/hooks/mobile/usePolicies";
import { parsePolicy } from "@/utils/policyContent";

export default function PolicyDetail() {
  const { id, section } = useLocalSearchParams<{ id: string; section?: string }>();
  const { data, isLoading, isRefetching, refetch, error } = useQueryPolicy(id);

  const page = useMemo(() => {
    if (!data) return null;
    const sections = parsePolicy(data.title, data.content);
    const picked = sections[Number(section ?? 0)] ?? sections[0];
    if (!picked) return null;
    return { title: picked.title, content: picked.html, updated_at: data.updated_at };
  }, [data, section]);

  return (
    <>
      <Stack.Screen options={{ title: page?.title ?? "Policy" }} />
      <HtmlPage
        isLoading={isLoading}
        isRefetching={isRefetching}
        refetch={refetch}
        error={error}
        page={page}
        showTitle={false}
        emptyMessage="This policy is no longer available."
      />
    </>
  );
}

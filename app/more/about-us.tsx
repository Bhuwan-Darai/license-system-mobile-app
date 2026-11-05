import React from "react";
import { Stack } from "expo-router";

import HtmlPage from "@/components/ui/HtmlPage";
import { useQueryAboutUs } from "@/hooks/mobile/usePolicies";

export default function AboutUs() {
  const { data, isLoading, isRefetching, refetch, error } = useQueryAboutUs();

  return (
    <>
      <Stack.Screen options={{ title: "About Us" }} />
      <HtmlPage
        isLoading={isLoading}
        isRefetching={isRefetching}
        refetch={refetch}
        error={error}
        page={data}
        emptyMessage="About Us hasn't been published yet."
      />
    </>
  );
}

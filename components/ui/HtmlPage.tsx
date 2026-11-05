import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHtml from "react-native-render-html";

import { BrandColors } from "@/constants/theme";
import { EmptyState } from "@/components/ui/kit";

interface Props {
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => void;
  error: unknown;
  page?: { title: string; content: string; updated_at: string } | null;
  /** Shown when the request worked but there is no page yet. */
  emptyMessage: string;
  /** Repeat the title above the body (the screen header usually shows it). */
  showTitle?: boolean;
}

// Renders an admin-authored HTML page (policy, About Us) with loading,
// error and empty states.
export default function HtmlPage({
  isLoading,
  isRefetching,
  refetch,
  error,
  page,
  emptyMessage,
  showTitle = true,
}: Props) {
  const { width } = useWindowDimensions();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={BrandColors.crimson} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {page ? (
        <>
          {showTitle ? <Text style={styles.title}>{page.title}</Text> : null}
          {page.updated_at ? (
            <Text style={styles.date}>
              Last updated {new Date(page.updated_at).toLocaleDateString()}
            </Text>
          ) : null}
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: page.content }}
            baseStyle={styles.body}
            tagsStyles={htmlTags}
          />
        </>
      ) : (
        <EmptyState
          title={error ? "Could not load this page" : "Nothing here yet"}
          message={error ? "Check your connection and pull down to retry." : emptyMessage}
        />
      )}
    </ScrollView>
  );
}

const htmlTags = {
  img: { borderRadius: 12 },
  p: { marginTop: 0, marginBottom: 12 },
  h2: { fontSize: 18, fontWeight: "700" as const, color: BrandColors.ink, marginTop: 8, marginBottom: 8 },
  h3: { fontSize: 15.5, fontWeight: "700" as const, color: BrandColors.ink, marginTop: 14, marginBottom: 6 },
  ul: { marginTop: 0, marginBottom: 12, paddingLeft: 4 },
  li: { marginBottom: 6 },
  a: { color: BrandColors.himalaya },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 20, paddingBottom: 48, flexGrow: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.paper,
  },
  title: { fontSize: 20, fontWeight: "700", color: BrandColors.ink, marginBottom: 4 },
  date: { fontSize: 12.5, color: BrandColors.inkSoft, marginBottom: 16 },
  body: { fontSize: 15, color: BrandColors.ink, lineHeight: 23 },
});

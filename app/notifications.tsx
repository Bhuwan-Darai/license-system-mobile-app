import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import AppHeader from "@/components/ui/AppHeader";
import { Card, EmptyState, Space, Tag } from "@/components/ui/kit";
import { BrandColors } from "@/constants/theme";
import { useQueryNews, useQueryNotifications } from "@/hooks/mobile/useMobileContent";
import { useNotificationSeen } from "@/hooks/notifications/useNotificationSeen";

const tagLabel = (tag: string) => tag.charAt(0) + tag.slice(1).toLowerCase();

// Recent news and notices, the same items push notifications are sent for.
export default function Notifications() {
  const router = useRouter();
  const news = useQueryNews(undefined, 20);
  const sent = useQueryNotifications(20);

  // admin notifications and news notices in one list, newest first
  const data = React.useMemo(
    () =>
      [
        ...(sent.data ?? []).map((n) => ({
          key: `n-${n.notification_id}`,
          kind: "notification" as const,
          tag: "NOTIFICATION",
          title: n.title,
          content: n.message,
          published_at: n.sent_at,
        })),
        ...(news.data ?? []).map((n) => ({
          key: `news-${n.news_id}`,
          kind: "news" as const,
          tag: n.tag,
          title: n.title,
          content: n.content,
          published_at: n.published_at,
        })),
      ].sort(
        (a, b) =>
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
      ),
    [sent.data, news.data],
  );
  const isLoading = news.isLoading || sent.isLoading;
  const isRefetching = news.isRefetching || sent.isRefetching;
  const error = news.error && sent.error;
  const refetch = () => {
    news.refetch();
    sent.refetch();
  };
  const markSeen = useNotificationSeen((s) => s.markSeen);
  const lastSeen = useNotificationSeen((s) => s.lastSeen);

  // Remember what was new when the screen opened, then clear the bell.
  const [openedAt] = React.useState(lastSeen);
  useEffect(() => {
    markSeen();
  }, [markSeen]);

  return (
    <View style={styles.container}>
      <AppHeader title="Notifications" back bell={false} />
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={BrandColors.crimson} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={data ?? []}
          keyExtractor={(n) => n.key}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              title={error ? "Could not load notifications" : "No notifications"}
              message={error ? "Check your connection and pull down to retry." : "New notices will show up here."}
            />
          }
          renderItem={({ item }) => {
            const isNew =
              !openedAt || new Date(item.published_at).getTime() > new Date(openedAt).getTime();
            return (
              <Card
                onPress={item.kind === "news" ? () => router.push("/(tabs)/news") : undefined}
                style={isNew ? styles.newCard : undefined}
              >
                <View style={styles.meta}>
                  <Tag label={tagLabel(item.tag)} />
                  <Text style={styles.date}>
                    {new Date(item.published_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc} numberOfLines={2}>
                  {item.content}
                </Text>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  list: { paddingHorizontal: Space.page, paddingBottom: 40, gap: 10 },
  newCard: { borderLeftWidth: 3, borderLeftColor: BrandColors.crimson },
  meta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date: { fontSize: 12, color: BrandColors.inkSoft },
  title: { fontSize: 15, fontWeight: "600", color: BrandColors.ink, marginTop: 8 },
  desc: { fontSize: 13.5, color: BrandColors.inkSoft, lineHeight: 19, marginTop: 4 },
});

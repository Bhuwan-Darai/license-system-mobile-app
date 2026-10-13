import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BrandColors } from "@/constants/theme";
import { Card, Chip, EmptyState, PageHeader, Space, Tag } from "@/components/ui/kit";
import { useQueryNews } from "@/hooks/mobile/useMobileContent";

const TAGS = [
  { value: undefined, label: "All" },
  { value: "NEWS", label: "News" },
  { value: "NOTICE", label: "Notice" },
  { value: "SCHEDULE", label: "Schedule" },
  { value: "UPDATE", label: "Updates" },
] as const;

const tagLabel = (tag: string) => tag.charAt(0) + tag.slice(1).toLowerCase();

export default function NewsScreen() {
  const [tag, setTag] = useState<string | undefined>();
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading, isRefetching, refetch, error } = useQueryNews(tag);

  return (
    <View style={styles.container}>
      <PageHeader title="News and notices" bell={false} />

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {TAGS.map((t) => (
            <Chip
              key={t.label}
              label={t.label}
              active={tag === t.value}
              onPress={() => setTag(t.value)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={BrandColors.crimson} />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={data ?? []}
          keyExtractor={(n) => n.news_id}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              title={error ? "Could not load news" : "Nothing here yet"}
              message={error ? "Check your connection and pull down to retry." : undefined}
            />
          }
          renderItem={({ item }) => {
            const open = openId === item.news_id;
            return (
              <Card onPress={() => setOpenId(open ? null : item.news_id)}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.cover} />
                ) : null}
                <View style={styles.metaRow}>
                  <Tag label={tagLabel(item.tag)} />
                  <Text style={styles.dateText}>
                    {new Date(item.published_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.desc} numberOfLines={open ? undefined : 3}>
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
  chips: { paddingHorizontal: Space.page, paddingBottom: 12, gap: 8 },
  list: { paddingHorizontal: Space.page, paddingBottom: 40, gap: 10 },
  cover: { width: "100%", height: 150, borderRadius: 8, marginBottom: 10 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: { fontSize: 12, color: BrandColors.inkSoft },
  title: { fontSize: 15.5, fontWeight: "600", color: BrandColors.ink, marginTop: 8 },
  desc: { fontSize: 13.5, color: BrandColors.inkSoft, lineHeight: 20, marginTop: 4 },
});

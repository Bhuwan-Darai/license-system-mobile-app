// components/TrafficSignsList.tsx
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ListRenderItem,
    StyleSheet,
    Text,
    View,
} from "react-native";

export interface TrafficSignalCategory {
  title: string;
  traffic_signal_category_id: string;
}

export interface TrafficSign {
  id: number;
  traffic_signal_id: string;
  title: string;
  english_title: string;
  description: string;
  english_description: string;
  image_url: string;
  image_path: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  traffic_signal_category: TrafficSignalCategory;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;

interface Props {
  initialData: any[];
  pageSize?: number;
  onLoadMore?: (page: number) => Promise<any[]>;
}

export default function TrafficSignsList({
  initialData,
  pageSize = 10,
  onLoadMore,
}: Props) {
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [data, setData] = useState<TrafficSign[]>(initialData);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      let newRaw: any[] = [];

      if (onLoadMore) {
        newRaw = await onLoadMore(nextPage);
      } else {
        newRaw = [];
      }

      if (newRaw.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => [...prev, ...newRaw]);
        setPage(nextPage);
      }
    } catch (e) {
      console.warn("Pagination error", e);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, onLoadMore]);

  const renderItem: ListRenderItem<TrafficSign> = ({ item }) => (
    <View style={styles.card}>
      {/* LEFT – Sign Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* RIGHT – Information */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.englishTitle} numberOfLines={1}>
          {item.english_title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.englishDescription} numberOfLines={2}>
          {item.english_description}
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.traffic_signal_category?.title}
          </Text>
        </View>
      </View>
    </View>
  );

  const ListFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.footerText}>Loading more…</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.traffic_signal_id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={ListFooter}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    width: CARD_WIDTH,
    flexDirection: "row", // ← horizontal layout
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    minHeight: 130,
  },
  imageContainer: {
    width: 110,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  image: {
    width: 90,
    height: 90,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  englishTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 2,
  },
  englishDescription: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1d4ed8",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748b",
  },
});

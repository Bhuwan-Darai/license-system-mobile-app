import React from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import { Stack, useLocalSearchParams } from "expo-router";

import { BrandColors } from "@/constants/theme";
import { useQueryBlog } from "@/hooks/mobile/useMobileContent";

export default function BlogPost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: blog, isLoading, error } = useQueryBlog(id);
  const { width } = useWindowDimensions();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BrandColors.crimson} />
      </View>
    );
  }

  if (error || !blog) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Could not load this guide.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: blog.category || "Guide" }} />
      {blog.cover_image ? <Image source={{ uri: blog.cover_image }} style={styles.cover} /> : null}
      <Text style={styles.title}>{blog.title}</Text>
      {blog.subtitle ? <Text style={styles.subtitle}>{blog.subtitle}</Text> : null}
      <Text style={styles.date}>{new Date(blog.published_at).toLocaleDateString()}</Text>
      <RenderHtml
        contentWidth={width - 36}
        source={{ html: blog.content ?? "" }}
        baseStyle={styles.body}
        tagsStyles={htmlTags}
      />
    </ScrollView>
  );
}

const htmlTags = {
  img: { borderRadius: 12 },
  li: { marginBottom: 4 },
  a: { color: BrandColors.himalaya },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 18, gap: 10, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: BrandColors.paper },
  muted: { color: BrandColors.inkSoft },
  cover: { width: "80%", height: 190, borderRadius: 12, alignSelf: "center" },
  title: { fontSize: 20, fontWeight: "700", color: BrandColors.ink },
  subtitle: { fontSize: 14, color: BrandColors.inkSoft, lineHeight: 20 },
  date: { fontSize: 11.5, color: BrandColors.inkSoft },
  body: { fontSize: 14, color: BrandColors.ink, lineHeight: 22 },
});

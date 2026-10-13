import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BrandColors } from "@/constants/theme";
import { EmptyState, ListGroup, ListRow, PageHeader, Space } from "@/components/ui/kit";
import {
  PracticeCategory,
  useQueryPracticeCategories,
} from "@/hooks/practice/usePractice";

export default function PracticeScreen() {
  const router = useRouter();
  const { data: categories, isLoading, error } = useQueryPracticeCategories();

  const handleSelectCategory = (category: PracticeCategory) => {
    router.push({
      pathname: "/practice/mcq",
      params: {
        category: category.question_bank_category_id,
        categoryTitle: category.title,
      },
    });
  };

  const list = categories ?? [];

  return (
    <View style={styles.container}>
      <PageHeader title="Practice" subtitle="Choose a category, then a question set." />

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={BrandColors.crimson} />
      ) : list.length === 0 ? (
        <EmptyState
          title={error ? "Could not load categories" : "No categories yet"}
          message={error ? "Check your connection and try again." : undefined}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <ListGroup>
            {list.map((item) => (
              <ListRow
                key={item.question_bank_category_id}
                title={item.title}
                subtitle={`${item.set_count} ${item.set_count === 1 ? "set" : "sets"}`}
                onPress={() => handleSelectCategory(item)}
              />
            ))}
          </ListGroup>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { paddingHorizontal: Space.page, paddingBottom: 40 },
});

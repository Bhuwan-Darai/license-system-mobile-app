import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { BrandColors } from "@/constants/theme";
import { EmptyState, ListGroup, ListRow, Space } from "@/components/ui/kit";
import { useQueryPolicySections } from "@/hooks/mobile/usePolicies";

export default function Policies() {
  const router = useRouter();
  const { data, isLoading, error } = useQueryPolicySections();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={BrandColors.crimson} />
      </View>
    );
  }

  const list = data ?? [];

  if (list.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          title={error ? "Could not load policies" : "No policies published yet"}
          message={error ? "Check your connection and try again." : undefined}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ListGroup>
        {list.map((p) => (
          <ListRow
            key={`${p.policy_id}-${p.index}`}
            title={p.title}
            onPress={() =>
              router.push({
                pathname: "/more/policy",
                params: { id: p.policy_id, section: String(p.index) },
              } as any)
            }
          />
        ))}
      </ListGroup>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: Space.page, paddingTop: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: BrandColors.paper },
});

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BrandColors } from "@/constants/theme";
import {
  DrivingSchool,
  LocationState,
  resolveLocation,
  useQueryDrivingSchools,
} from "@/hooks/mobile/useDrivingSchools";

const openMap = (s: DrivingSchool) => {
  const label = encodeURIComponent(s.name);
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?ll=${s.latitude},${s.longitude}&q=${label}`
      : `geo:${s.latitude},${s.longitude}?q=${s.latitude},${s.longitude}(${label})`;
  Linking.openURL(url).catch(() =>
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`
    )
  );
};

export default function DrivingSchools() {
  const [location, setLocation] = useState<LocationState>({ status: "loading" });

  const locate = useCallback(async () => {
    setLocation({ status: "loading" });
    setLocation(await resolveLocation());
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  const coords = location.status === "ready" ? location.coords : undefined;
  const { data, isLoading, isRefetching, refetch, error } = useQueryDrivingSchools(coords);

  if (location.status === "loading" || (coords && isLoading)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BrandColors.crimson} />
        <Text style={styles.hint}>
          {location.status === "loading" ? "Finding your location" : "Looking for driving schools"}
        </Text>
      </View>
    );
  }

  if (location.status !== "ready") {
    const denied = location.status === "denied";
    return (
      <View style={styles.center}>
        <Text style={styles.title}>
          {denied ? "Location permission needed" : "Could not get your location"}
        </Text>
        <Text style={styles.hint}>
          {denied
            ? "Allow location access to see driving schools near you."
            : "Make sure location is turned on and try again."}
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.8}
          onPress={denied && !location.canAskAgain ? () => Linking.openSettings() : locate}
        >
          <Text style={styles.primaryBtnText}>
            {denied && !location.canAskAgain ? "Open settings" : "Try again"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={data ?? []}
      keyExtractor={(s) => s.id}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Text style={styles.title}>
            {error ? "Could not load driving schools" : "No driving schools found nearby"}
          </Text>
          <Text style={styles.hint}>
            {error
              ? "Check your connection and pull down to retry."
              : "Nothing is mapped within 15 km of you yet."}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.distance}>
              {item.distanceKm < 1
                ? `${Math.round(item.distanceKm * 1000)} m`
                : `${item.distanceKm.toFixed(1)} km`}
            </Text>
          </View>
          {item.address ? <Text style={styles.address}>{item.address}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.8}
              onPress={() => openMap(item)}
            >
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>
            {item.phone ? (
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.8}
                onPress={() => Linking.openURL(`tel:${item.phone!.replace(/\s+/g, "")}`)}
              >
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
            ) : null}
            {item.website ? (
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.8}
                onPress={() =>
                  Linking.openURL(
                    /^https?:\/\//i.test(item.website!) ? item.website! : `https://${item.website}`
                  )
                }
              >
                <Text style={styles.actionText}>Website</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 18, gap: 10 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: BrandColors.paper,
  },
  emptyWrap: { alignItems: "center", marginTop: 60, paddingHorizontal: 24 },
  title: { fontSize: 15, fontWeight: "700", color: BrandColors.ink, textAlign: "center" },
  hint: { fontSize: 12.5, color: BrandColors.inkSoft, textAlign: "center", marginTop: 6 },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: BrandColors.crimson,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  primaryBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
  card: {
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 14,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  name: { flex: 1, fontSize: 14, fontWeight: "700", color: BrandColors.ink },
  distance: { fontSize: 12, fontWeight: "700", color: BrandColors.himalaya },
  address: { fontSize: 12, color: BrandColors.inkSoft, marginTop: 4 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionBtn: {
    backgroundColor: BrandColors.paperDim,
    borderWidth: 1,
    borderColor: BrandColors.line,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  actionText: { fontSize: 12, fontWeight: "700", color: BrandColors.ink },
});

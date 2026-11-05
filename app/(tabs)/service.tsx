import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { BrandColors } from "@/constants/theme";
import { fmt } from "@/components/Service/form";
import { Card, EmptyState, PageHeader, Space } from "@/components/ui/kit";
import { computeMileage, useBikeStore } from "@/hooks/service/useBikeStore";

type Tab = "fuel" | "service";

export default function ServiceScreen() {
  const router = useRouter();
  const {
    bikes,
    activeBikeId,
    fuelEntries,
    serviceRecords,
    setActiveBike,
    removeBike,
    removeFuelEntry,
    removeServiceRecord,
  } = useBikeStore();

  const [tab, setTab] = useState<Tab>("fuel");
  const [viewBill, setViewBill] = useState<string | null>(null);

  const bike = bikes.find((b) => b.id === activeBikeId) ?? bikes[0];

  const fuel = useMemo(
    () =>
      fuelEntries
        .filter((e) => e.bikeId === bike?.id)
        .sort((a, b) => b.odometer - a.odometer),
    [fuelEntries, bike?.id]
  );
  const services = useMemo(
    () =>
      serviceRecords
        .filter((r) => r.bikeId === bike?.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [serviceRecords, bike?.id]
  );
  const stats = useMemo(() => (bike ? computeMileage(bike, fuel) : null), [bike, fuel]);
  const serviceCost = services.reduce((s, r) => s + r.totalCost, 0);

  if (!bike || !stats) {
    return (
      <View style={styles.container}>
        <PageHeader title="My bike" />
        <EmptyState
          title="No bike added"
          message="Add your bike to track fuel fill-ups, see your mileage and keep service bills in one place."
          actionLabel="Add bike"
          onAction={() => router.push("/service/add-bike" as any)}
        />
      </View>
    );
  }

  const confirmDelete = (title: string, onDelete: () => void) =>
    Alert.alert(title, "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);

  return (
    <View style={styles.container}>
    <PageHeader
      title="My bike"
      right={
        <TouchableOpacity onPress={() => router.push("/service/add-bike" as any)} hitSlop={8}>
          <Text style={styles.link}>Add bike</Text>
        </TouchableOpacity>
      }
    />
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {bikes.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcher}>
          {bikes.map((b) => (
            <TouchableOpacity
              key={b.id}
              onPress={() => setActiveBike(b.id)}
              style={[styles.switchChip, b.id === bike.id && styles.switchChipActive]}
            >
              <Text style={[styles.switchText, b.id === bike.id && styles.switchTextActive]}>
                {b.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      {/* Bike card */}
      <View style={styles.bikeCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bikeName}>{bike.name}</Text>
          <Text style={styles.bikeMeta}>
            {[bike.brand, bike.year, bike.registration].filter(Boolean).join(" · ") || "No details added"}
          </Text>
        </View>
        <View style={styles.odoBox}>
          <Text style={styles.odoValue}>{fmt(stats.currentOdometer, 0)}</Text>
          <Text style={styles.odoLabel}>km</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <Stat
          label="Average mileage"
          value={stats.average ? `${fmt(stats.average)} km/l` : "—"}
          sub={stats.average ? undefined : "Needs 2 full-tank fills"}
        />
        <Stat label="Last mileage" value={stats.last ? `${fmt(stats.last)} km/l` : "—"} />
        <Stat label="Fuel spent" value={`Rs ${fmt(stats.totalFuelCost, 0)}`} sub={`${fmt(stats.totalLiters)} L`} />
        <Stat
          label="Service spent"
          value={`Rs ${fmt(serviceCost, 0)}`}
          sub={`${services.length} record${services.length === 1 ? "" : "s"}`}
        />
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: BrandColors.himalaya }]}
          activeOpacity={0.8}
          onPress={() => router.push("/service/add-fuel" as any)}
        >
          <Text style={styles.actionText}>Add fuel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: BrandColors.crimson }]}
          activeOpacity={0.8}
          onPress={() => router.push("/service/add-service" as any)}
        >
          <Text style={styles.actionText}>Add service</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.segment}>
        {(["fuel", "service"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.segmentBtn, tab === t && styles.segmentBtnActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.segmentText, tab === t && styles.segmentTextActive]}>
              {t === "fuel" ? `Fuel log (${fuel.length})` : `Service records (${services.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "fuel" ? (
        fuel.length === 0 ? (
          <Text style={styles.noRows}>No fuel entries yet. Add one after your next fill-up.</Text>
        ) : (
          fuel.map((e) => (
            <TouchableOpacity
              key={e.id}
              activeOpacity={0.9}
              onLongPress={() => confirmDelete("Delete fuel entry?", () => removeFuelEntry(e.id))}
              style={styles.row}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>
                  {fmt(e.liters, 2)} L · Rs {fmt(e.totalCost, 0)}
                </Text>
                <Text style={styles.rowSub}>
                  {e.date} · {fmt(e.odometer, 0)} km{e.fullTank ? "" : " · part fill"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )
      ) : services.length === 0 ? (
        <Text style={styles.noRows}>No service records yet.</Text>
      ) : (
        services.map((r) => (
          <TouchableOpacity
            key={r.id}
            activeOpacity={0.9}
            onLongPress={() => confirmDelete("Delete service record?", () => removeServiceRecord(r.id))}
            style={styles.row}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Rs {fmt(r.totalCost, 0)}</Text>
              <Text style={styles.rowSub}>
                {r.date}
                {r.odometer ? ` · ${fmt(r.odometer, 0)} km` : ""}
              </Text>
              {r.parts.length > 0 ? <Text style={styles.parts}>{r.parts.join(", ")}</Text> : null}
              {r.notes ? <Text style={styles.rowSub}>{r.notes}</Text> : null}
            </View>
            {r.billImage ? (
              <TouchableOpacity onPress={() => setViewBill(r.billImage!)}>
                <Image source={{ uri: r.billImage }} style={styles.thumb} />
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        ))
      )}

      {(tab === "fuel" ? fuel.length : services.length) > 0 ? (
        <Text style={styles.tip}>Press and hold an entry to delete it.</Text>
      ) : null}

      <TouchableOpacity
        style={styles.removeBike}
        onPress={() =>
          confirmDelete(`Remove ${bike.name}?`, () => removeBike(bike.id))
        }
      >
        <Text style={styles.removeBikeText}>Remove this bike and its records</Text>
      </TouchableOpacity>

      <Modal visible={!!viewBill} transparent animationType="fade" onRequestClose={() => setViewBill(null)}>
        <Pressable style={styles.modalBg} onPress={() => setViewBill(null)}>
          {viewBill ? (
            <Image source={{ uri: viewBill }} style={styles.modalImg} resizeMode="contain" />
          ) : null}
        </Pressable>
      </Modal>
    </ScrollView>
    </View>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { paddingHorizontal: Space.page, paddingBottom: 40 },
  link: { fontSize: 14, fontWeight: "600", color: BrandColors.himalaya },
  switcher: { gap: 8, marginBottom: 12 },
  switchChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: BrandColors.line,
    backgroundColor: BrandColors.card,
  },
  switchChipActive: { backgroundColor: BrandColors.ink, borderColor: BrandColors.ink },
  switchText: { fontSize: 13, fontWeight: "600", color: BrandColors.ink },
  switchTextActive: { color: "#ffffff" },
  bikeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.himalaya,
    borderRadius: Space.radius,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  bikeName: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  bikeMeta: { fontSize: 13, color: "#ffffff", opacity: 0.85, marginTop: 3 },
  odoBox: { alignItems: "flex-end" },
  odoValue: { fontSize: 22, fontWeight: "700", color: "#ffffff" },
  odoLabel: { fontSize: 12, color: "#ffffff", opacity: 0.85 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  stat: { width: "48.5%" },
  statLabel: { fontSize: 12.5, color: BrandColors.inkSoft },
  statValue: { fontSize: 17, fontWeight: "700", color: BrandColors.ink, marginTop: 4 },
  statSub: { fontSize: 12, color: BrandColors.inkSoft, marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, borderRadius: Space.radius, paddingVertical: 13, alignItems: "center" },
  actionText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
  segment: {
    flexDirection: "row",
    backgroundColor: BrandColors.paperDim,
    borderRadius: Space.radius,
    padding: 3,
    marginBottom: 12,
  },
  segmentBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  segmentBtnActive: { backgroundColor: BrandColors.card },
  segmentText: { fontSize: 13, fontWeight: "600", color: BrandColors.inkSoft },
  segmentTextActive: { color: BrandColors.ink },
  noRows: { textAlign: "center", color: BrandColors.inkSoft, marginVertical: 28, fontSize: 13.5 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BrandColors.card,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: BrandColors.line,
    borderRadius: Space.radius,
    padding: 14,
    marginBottom: 8,
  },
  rowTitle: { fontSize: 15, fontWeight: "600", color: BrandColors.ink },
  rowSub: { fontSize: 12.5, color: BrandColors.inkSoft, marginTop: 2 },
  parts: { fontSize: 13.5, color: BrandColors.ink, marginTop: 4 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: BrandColors.line,
  },
  tip: { textAlign: "center", fontSize: 12, color: BrandColors.inkSoft, marginTop: 4 },
  removeBike: { alignSelf: "center", marginTop: 26, padding: 8 },
  removeBikeText: { fontSize: 13, fontWeight: "600", color: BrandColors.crimson },
  modalBg: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", padding: 12 },
  modalImg: { width: "100%", height: "85%" },
});

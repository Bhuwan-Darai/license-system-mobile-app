import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { BrandColors } from "@/constants/theme";
import { Field, PrimaryButton, isValidDate, parseNum, todayISO } from "@/components/Service/form";
import { computeMileage, useBikeStore } from "@/hooks/service/useBikeStore";

export default function AddFuel() {
  const router = useRouter();
  const { bikes, activeBikeId, fuelEntries, addFuelEntry } = useBikeStore();
  const bike = bikes.find((b) => b.id === activeBikeId);

  const [date, setDate] = useState(todayISO());
  const [odometer, setOdometer] = useState("");
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
  const [fullTank, setFullTank] = useState(true);

  if (!bike) {
    return (
      <View style={styles.container}>
        <Text style={styles.note}>Add a bike first.</Text>
      </View>
    );
  }

  const save = () => {
    const odo = parseNum(odometer);
    const l = parseNum(liters);
    const c = parseNum(cost);
    if (!isValidDate(date)) return Alert.alert("Invalid date", "Use the format YYYY-MM-DD.");
    if (odo === null || odo <= 0) return Alert.alert("Odometer needed", "Enter the odometer reading in km.");
    if (l === null || l <= 0) return Alert.alert("Fuel needed", "Enter the litres you added.");
    if (c === null || c < 0) return Alert.alert("Cost needed", "Enter the total amount paid.");

    const { currentOdometer } = computeMileage(
      bike,
      fuelEntries.filter((e) => e.bikeId === bike.id)
    );
    if (odo < currentOdometer) {
      return Alert.alert(
        "Odometer too low",
        `Your last recorded reading is ${currentOdometer} km. Enter a higher number.`
      );
    }

    addFuelEntry({ bikeId: bike.id, date, odometer: odo, liters: l, totalCost: c, fullTank });
    router.back();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.bike}>{bike.name}</Text>
      <Field label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
      <Field
        label="Odometer (km) *"
        value={odometer}
        onChangeText={setOdometer}
        placeholder="12850"
        keyboardType="decimal-pad"
      />
      <Field
        label="Fuel added (litres) *"
        value={liters}
        onChangeText={setLiters}
        placeholder="5.2"
        keyboardType="decimal-pad"
      />
      <Field
        label="Total paid (Rs) *"
        value={cost}
        onChangeText={setCost}
        placeholder="1040"
        keyboardType="decimal-pad"
      />
      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchLabel}>Filled the tank completely</Text>
          <Text style={styles.switchHint}>
            Mileage is measured between two full-tank fills, so keep this on when you fill up to the brim.
          </Text>
        </View>
        <Switch
          value={fullTank}
          onValueChange={setFullTank}
          trackColor={{ true: BrandColors.crimson }}
        />
      </View>
      <PrimaryButton title="Save fuel entry" onPress={save} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 18 },
  note: { textAlign: "center", marginTop: 40, color: BrandColors.inkSoft },
  bike: { fontSize: 16, fontWeight: "700", color: BrandColors.ink, marginBottom: 14 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  switchLabel: { fontSize: 13.5, fontWeight: "700", color: BrandColors.ink },
  switchHint: { fontSize: 11, color: BrandColors.inkSoft, marginTop: 2 },
});

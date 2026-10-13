import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { BrandColors } from "@/constants/theme";
import { Field, PrimaryButton, parseNum } from "@/components/Service/form";
import { useBikeStore } from "@/hooks/service/useBikeStore";

export default function AddBike() {
  const router = useRouter();
  const addBike = useBikeStore((s) => s.addBike);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [registration, setRegistration] = useState("");
  const [year, setYear] = useState("");
  const [odometer, setOdometer] = useState("");

  const save = () => {
    const startOdometer = parseNum(odometer);
    if (!name.trim()) return Alert.alert("Missing name", "Give your bike a name, e.g. “Pulsar 150”.");
    if (startOdometer === null || startOdometer < 0)
      return Alert.alert("Odometer needed", "Enter the current odometer reading in km.");

    addBike({
      name: name.trim(),
      brand: brand.trim() || undefined,
      registration: registration.trim() || undefined,
      year: year.trim() || undefined,
      startOdometer,
    });
    router.back();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Field label="Bike name *" value={name} onChangeText={setName} placeholder="Pulsar 150" />
      <Field label="Brand" value={brand} onChangeText={setBrand} placeholder="Bajaj" />
      <Field
        label="Registration number"
        value={registration}
        onChangeText={setRegistration}
        placeholder="BA 12 PA 3456"
      />
      <Field
        label="Year"
        value={year}
        onChangeText={setYear}
        placeholder="2022"
        keyboardType="number-pad"
      />
      <Field
        label="Current odometer (km) *"
        value={odometer}
        onChangeText={setOdometer}
        placeholder="12500"
        keyboardType="decimal-pad"
      />
      <PrimaryButton title="Save bike" onPress={save} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 18 },
});

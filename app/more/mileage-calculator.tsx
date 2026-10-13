import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import { BrandColors } from "@/constants/theme";
import { Field, fmt, parseNum } from "@/components/Service/form";

// Quick one-off calculator: distance travelled and fuel used -> mileage.
export default function MileageCalculator() {
  const [distance, setDistance] = useState("");
  const [liters, setLiters] = useState("");
  const [price, setPrice] = useState("");

  const km = parseNum(distance);
  const l = parseNum(liters);
  const p = parseNum(price);
  const valid = km !== null && km > 0 && l !== null && l > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: "Mileage Calculator" }} />

      <Field
        label="Distance travelled (km)"
        value={distance}
        onChangeText={setDistance}
        placeholder="250"
        keyboardType="decimal-pad"
      />
      <Field
        label="Fuel used (litres)"
        value={liters}
        onChangeText={setLiters}
        placeholder="5"
        keyboardType="decimal-pad"
      />
      <Field
        label="Fuel price per litre (Rs) — optional"
        value={price}
        onChangeText={setPrice}
        placeholder="200"
        keyboardType="decimal-pad"
        hint="Adds cost per km to the result."
      />

      <View style={styles.result}>
        <Text style={styles.resultLabel}>Your mileage</Text>
        <Text style={styles.resultValue}>{valid ? `${fmt(km! / l!)} km/l` : "—"}</Text>
        {valid ? (
          <Text style={styles.resultSub}>
            {fmt((l! / km!) * 100, 2)} L per 100 km
            {p !== null && p > 0 ? ` · Rs ${fmt((l! * p) / km!, 2)} per km` : ""}
          </Text>
        ) : (
          <Text style={styles.resultSub}>Enter distance and fuel to calculate.</Text>
        )}
      </View>

      <Text style={styles.note}>
        For the most accurate figure, fill the tank, reset your trip meter, ride, then refill and enter
        the litres it took.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 18 },
  result: {
    backgroundColor: BrandColors.himalaya,
    borderRadius: 12,
    padding: 20,
    marginTop: 6,
    alignItems: "center",
  },
  resultLabel: { fontSize: 12, fontWeight: "700", color: "#ffffff", opacity: 0.85 },
  resultValue: { fontSize: 32, fontWeight: "700", color: "#ffffff", marginTop: 4 },
  resultSub: { fontSize: 12.5, color: "#ffffff", opacity: 0.9, marginTop: 4, textAlign: "center" },
  note: { fontSize: 11.5, color: BrandColors.inkSoft, marginTop: 16, lineHeight: 16 },
});

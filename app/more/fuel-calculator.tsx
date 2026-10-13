import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import { BrandColors } from "@/constants/theme";
import { Field, fmt, parseNum } from "@/components/Service/form";
import { useQueryFuelPrices } from "@/hooks/mobile/useFuelPrices";
import { computeMileage, useBikeStore } from "@/hooks/service/useBikeStore";

// Trip planner: distance + mileage + price -> litres and cost.
// Mileage and price are prefilled from the user's bike and today's NOC petrol price.
export default function FuelCalculator() {
  const { bikes, activeBikeId, fuelEntries } = useBikeStore();
  const bike = bikes.find((b) => b.id === activeBikeId) ?? bikes[0];
  const average = bike
    ? computeMileage(bike, fuelEntries.filter((e) => e.bikeId === bike.id)).average
    : null;

  const { data: prices } = useQueryFuelPrices();
  const petrol = prices?.find((f) => f.slug === "petrol")?.price;

  const [distance, setDistance] = useState("");
  const [mileage, setMileage] = useState("");
  const [price, setPrice] = useState("");

  // Prefill once, without overwriting anything the user already typed.
  useEffect(() => {
    if (average) setMileage((m) => m || average.toFixed(1));
  }, [average]);
  useEffect(() => {
    if (petrol) setPrice((p) => p || String(petrol));
  }, [petrol]);

  const km = parseNum(distance);
  const kmpl = parseNum(mileage);
  const p = parseNum(price);
  const valid = km !== null && km > 0 && kmpl !== null && kmpl > 0;
  const liters = valid ? km! / kmpl! : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: "Fuel Calculator" }} />

      <Field
        label="Trip distance (km)"
        value={distance}
        onChangeText={setDistance}
        placeholder="120"
        keyboardType="decimal-pad"
      />
      <Field
        label="Bike mileage (km/l)"
        value={mileage}
        onChangeText={setMileage}
        placeholder="40"
        keyboardType="decimal-pad"
        hint={average && bike ? `Prefilled from ${bike.name}'s average.` : "Add fuel entries in the Service tab to prefill this."}
      />
      <Field
        label="Fuel price per litre (Rs)"
        value={price}
        onChangeText={setPrice}
        placeholder="200"
        keyboardType="decimal-pad"
        hint={petrol ? "Prefilled with today's petrol price in Kathmandu." : undefined}
      />

      <View style={styles.result}>
        <Text style={styles.resultLabel}>Fuel needed</Text>
        <Text style={styles.resultValue}>{valid ? `${fmt(liters, 2)} L` : "—"}</Text>
        <Text style={styles.resultSub}>
          {valid
            ? p !== null && p > 0
              ? `Estimated cost: Rs ${fmt(liters * p, 0)}`
              : "Enter a fuel price to see the cost."
            : "Enter distance and mileage to calculate."}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 18 },
  result: {
    backgroundColor: BrandColors.crimson,
    borderRadius: 12,
    padding: 20,
    marginTop: 6,
    alignItems: "center",
  },
  resultLabel: { fontSize: 12, fontWeight: "700", color: "#ffffff", opacity: 0.85 },
  resultValue: { fontSize: 32, fontWeight: "700", color: "#ffffff", marginTop: 4 },
  resultSub: { fontSize: 12.5, color: "#ffffff", opacity: 0.9, marginTop: 4, textAlign: "center" },
});

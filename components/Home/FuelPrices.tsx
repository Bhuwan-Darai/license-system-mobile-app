import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { BrandColors } from "@/constants/theme";
import { ListGroup, SectionHeader } from "@/components/ui/kit";
import { useQueryFuelPrices } from "@/hooks/mobile/useFuelPrices";

const formatPrice = (n: number) =>
  `Rs ${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const formatDate = (iso: string) => {
  const d = new Date(iso.replace(" ", "T"));
  return isNaN(d.getTime())
    ? iso.slice(0, 10)
    : d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

// Today's fuel prices for Kathmandu, from Nepal Oil Corporation.
// Renders nothing while loading or if the feed is unreachable.
export default function FuelPrices() {
  const { data } = useQueryFuelPrices();
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Fuel prices" />
      <ListGroup>
        {data.map((f) => (
          <View key={f.slug} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{f.label}</Text>
              <Text style={styles.unit}>{f.unit}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.price}>{formatPrice(f.price)}</Text>
              {f.change !== 0 ? (
                <Text style={[styles.change, f.change > 0 ? styles.up : styles.down]}>
                  {f.change > 0 ? "+" : "-"}Rs {Math.abs(f.change).toLocaleString("en-US")}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </ListGroup>
      <Text style={styles.footnote}>
        Kathmandu, effective {formatDate(data[0].date)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 26 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  label: { fontSize: 15, fontWeight: "500", color: BrandColors.ink },
  unit: { fontSize: 12, color: BrandColors.inkSoft, marginTop: 2 },
  right: { alignItems: "flex-end" },
  price: { fontSize: 15, fontWeight: "700", color: BrandColors.ink },
  change: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  up: { color: BrandColors.crimson },
  down: { color: BrandColors.forest },
  footnote: { fontSize: 12, color: BrandColors.inkSoft, marginTop: 8, marginLeft: 4 },
});

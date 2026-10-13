import { BrandColors } from "@/constants/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Splash() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>LY</Text>
      </View>
      <Text style={styles.appName}>Likhit Yatra</Text>
      <Text style={styles.tagline}>
        تपाईंको लाइसेन्स यात्रा सुरु हुन्छ यहाँबाट
      </Text>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#ffffff" />
      </View>

      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.crimson,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: BrandColors.crimson,
  },
  appName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: "#ffffff",
    opacity: 0.85,
    textAlign: "center",
    fontWeight: "500",
  },
  loaderContainer: {
    marginTop: 40,
    height: 20,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    opacity: 0.4,
  },
  activeDot: {
    opacity: 1,
  },
});

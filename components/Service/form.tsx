import React from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { BrandColors } from "@/constants/theme";

export const todayISO = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const isValidDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(`${s}T00:00:00`).getTime());

/** Parses user input like "1,250.5"; returns null when empty or not a number. */
export const parseNum = (s: string): number | null => {
  const t = s.replace(/,/g, "").trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

export const fmt = (n: number, digits = 1) =>
  n.toLocaleString("en-US", { maximumFractionDigits: digits });

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={BrandColors.inkSoft + "99"}
        keyboardType={keyboardType}
        multiline={multiline}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.btn, disabled && { opacity: 0.5 }]}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "700", color: BrandColors.inkSoft, marginBottom: 6 },
  input: {
    backgroundColor: BrandColors.card,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: BrandColors.ink,
  },
  inputMulti: { minHeight: 70, textAlignVertical: "top" },
  hint: { fontSize: 11, color: BrandColors.inkSoft, marginTop: 4 },
  btn: {
    backgroundColor: BrandColors.crimson,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 6,
  },
  btnText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
});

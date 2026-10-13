import React, { useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Directory, File, Paths } from "expo-file-system";

import { BrandColors } from "@/constants/theme";
import { Field, PrimaryButton, isValidDate, parseNum, todayISO } from "@/components/Service/form";
import { useBikeStore } from "@/hooks/service/useBikeStore";

// Picker results live in the cache directory, which the OS may clear, so the
// bill is copied somewhere permanent before its URI is stored.
function persistBill(uri: string): string {
  const dir = new Directory(Paths.document, "bills");
  if (!dir.exists) dir.create();
  const ext = uri.split("?")[0].split(".").pop() || "jpg";
  const dest = new File(dir, `bill-${Date.now()}.${ext}`);
  new File(uri).copy(dest);
  return dest.uri;
}

export default function AddService() {
  const router = useRouter();
  const { bikes, activeBikeId, addServiceRecord } = useBikeStore();
  const bike = bikes.find((b) => b.id === activeBikeId);

  const [date, setDate] = useState(todayISO());
  const [odometer, setOdometer] = useState("");
  const [cost, setCost] = useState("");
  const [partInput, setPartInput] = useState("");
  const [parts, setParts] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [bill, setBill] = useState<string | null>(null);

  if (!bike) {
    return (
      <View style={styles.container}>
        <Text style={styles.note}>Add a bike first.</Text>
      </View>
    );
  }

  const addPart = () => {
    // Allow pasting/typing several parts separated by commas.
    const items = partInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (items.length === 0) return;
    setParts((prev) => [...prev, ...items]);
    setPartInput("");
  };

  const pick = async (source: "camera" | "library") => {
    try {
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert("Camera blocked", "Allow camera access in settings to photograph the bill.");
      }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.7 };
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled && result.assets[0]) setBill(persistBill(result.assets[0].uri));
    } catch {
      Alert.alert("Could not attach image", "Something went wrong while saving the bill photo.");
    }
  };

  const chooseBill = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Cancel", "Take photo", "Choose from gallery"], cancelButtonIndex: 0 },
        (i) => {
          if (i === 1) pick("camera");
          if (i === 2) pick("library");
        }
      );
    } else {
      Alert.alert("Bill photo", undefined, [
        { text: "Take photo", onPress: () => pick("camera") },
        { text: "Choose from gallery", onPress: () => pick("library") },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const save = () => {
    const c = parseNum(cost);
    const odo = parseNum(odometer);
    if (!isValidDate(date)) return Alert.alert("Invalid date", "Use the format YYYY-MM-DD.");
    if (c === null || c < 0) return Alert.alert("Cost needed", "Enter the total service cost.");
    // A typed-but-not-added part would otherwise be silently dropped.
    const pending = partInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    addServiceRecord({
      bikeId: bike.id,
      date,
      odometer: odo ?? undefined,
      totalCost: c,
      parts: [...parts, ...pending],
      notes: notes.trim() || undefined,
      billImage: bill ?? undefined,
    });
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
        label="Odometer (km)"
        value={odometer}
        onChangeText={setOdometer}
        placeholder="13000"
        keyboardType="decimal-pad"
      />
      <Field
        label="Total cost (Rs) *"
        value={cost}
        onChangeText={setCost}
        placeholder="3500"
        keyboardType="decimal-pad"
      />

      <Field
        label="Parts changed"
        value={partInput}
        onChangeText={setPartInput}
        placeholder="Engine oil, air filter"
        hint="Separate with commas, then tap Add."
      />
      <TouchableOpacity style={styles.addPartBtn} activeOpacity={0.8} onPress={addPart}>
        <Text style={styles.addPartText}>+ Add part</Text>
      </TouchableOpacity>
      {parts.length > 0 ? (
        <View style={styles.chips}>
          {parts.map((p, i) => (
            <TouchableOpacity
              key={`${p}-${i}`}
              style={styles.chip}
              onPress={() => setParts((prev) => prev.filter((_, j) => j !== i))}
            >
              <Text style={styles.chipText}>{p}  ×</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <Field
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Anything worth remembering"
        multiline
      />

      <Text style={styles.sectionLabel}>Bill photo</Text>
      {bill ? (
        <View style={styles.billWrap}>
          <Image source={{ uri: bill }} style={styles.billImg} resizeMode="cover" />
          <TouchableOpacity onPress={() => setBill(null)}>
            <Text style={styles.removeText}>Remove photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.billBtn} activeOpacity={0.8} onPress={chooseBill}>
          <Text style={styles.billBtnText}>Attach bill image</Text>
        </TouchableOpacity>
      )}

      <PrimaryButton title="Save service record" onPress={save} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: 18, paddingBottom: 40 },
  note: { textAlign: "center", marginTop: 40, color: BrandColors.inkSoft },
  bike: { fontSize: 16, fontWeight: "700", color: BrandColors.ink, marginBottom: 14 },
  addPartBtn: {
    alignSelf: "flex-start",
    backgroundColor: BrandColors.paperDim,
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginTop: -6,
    marginBottom: 12,
  },
  addPartText: { fontSize: 12, fontWeight: "700", color: BrandColors.ink },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: {
    backgroundColor: BrandColors.himalaya,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipText: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: BrandColors.inkSoft, marginBottom: 6 },
  billBtn: {
    borderWidth: 1,
    borderColor: BrandColors.line,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 22,
    alignItems: "center",
    backgroundColor: BrandColors.card,
    marginBottom: 14,
  },
  billBtnText: { fontSize: 13.5, fontWeight: "700", color: BrandColors.inkSoft },
  billWrap: { marginBottom: 14, alignItems: "flex-start", gap: 8 },
  billImg: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.line,
  },
  removeText: { fontSize: 12, fontWeight: "700", color: BrandColors.crimson },
});

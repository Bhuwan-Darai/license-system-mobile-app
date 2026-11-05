import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { BrandColors } from "@/constants/theme";
import { Chip, Space } from "@/components/ui/kit";
import { Field, PrimaryButton } from "@/components/Service/form";
import {
  useQueryLocations,
  useQueryMyRegistration,
  useSubmitApplication,
  uploadPhoto,
} from "@/hooks/mobile/useApplication";

const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];
const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
// Nepal DoTM license categories
const CATEGORIES = [
  { value: "A", label: "A - Motorcycle" },
  { value: "B", label: "B - Car / Jeep / Van" },
  { value: "C", label: "C - Tempo / Auto" },
  { value: "D", label: "D - Tractor" },
  { value: "E", label: "E - Heavy machinery" },
  { value: "F", label: "F - Scooter" },
  { value: "K", label: "K - Scooter / Moped" },
];

const STATUS_TEXT: Record<string, string> = {
  INITIATED: "Received - we will start processing soon",
  PROCESSING: "In progress",
  COMPLETED: "Completed",
};

const REQUIREMENTS = [
  "Citizenship / NID card - clear photo of the front and the back",
  "Passport size photo",
  "A valid phone number we can reach you on",
  "Date of birth (at least 16 years old), gender and citizenship number",
  "Father's and mother's names",
  "Current address and permanent address",
];

const PHONE_RE = /^\+?[0-9][0-9 \-]{6,18}[0-9]$/;

type Photo = { uri: string; path: string } | null;

const isValidDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(`${s}T00:00:00`).getTime());

function PhotoPicker({
  label,
  value,
  onChange,
  aspect,
}: {
  label: string;
  value: Photo;
  onChange: (p: Photo) => void;
  aspect: [number, number];
}) {
  const [busy, setBusy] = useState(false);

  const pick = async (source: "camera" | "library") => {
    try {
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return Alert.alert("Camera blocked", "Allow camera access in settings.");
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        quality: 0.6,
        allowsEditing: true,
        aspect,
      };
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      setBusy(true);
      const path = await uploadPhoto(asset.uri, asset.mimeType);
      onChange({ uri: asset.uri, path });
    } catch {
      // the api client shows server errors; this covers picker failures
    } finally {
      setBusy(false);
    }
  };

  const choose = () =>
    Alert.alert(label, undefined, [
      { text: "Take photo", onPress: () => pick("camera") },
      { text: "Choose from gallery", onPress: () => pick("library") },
      { text: "Cancel", style: "cancel" },
    ]);

  return (
    <View style={styles.photoBlock}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.photoBox} activeOpacity={0.8} onPress={choose} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={BrandColors.crimson} />
        ) : value ? (
          <Image source={{ uri: value.uri }} style={styles.photo} resizeMode="cover" />
        ) : (
          <Text style={styles.photoHint}>Tap to add a photo</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function RegisterLicense() {
  const router = useRouter();
  const mine = useQueryMyRegistration();
  const locations = useQueryLocations();
  const submit = useSubmitApplication();

  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [blood, setBlood] = useState("");
  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const [citizenship, setCitizenship] = useState("");
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [ward, setWard] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [sameAddress, setSameAddress] = useState(false);
  const [curProvince, setCurProvince] = useState("");
  const [curDistrict, setCurDistrict] = useState("");
  const [curMunicipality, setCurMunicipality] = useState("");
  const [curWard, setCurWard] = useState("");
  const [curAddress, setCurAddress] = useState("");
  const [front, setFront] = useState<Photo>(null);
  const [back, setBack] = useState<Photo>(null);
  const [passport, setPassport] = useState<Photo>(null);

  if (mine.isLoading || locations.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BrandColors.crimson} />
      </View>
    );
  }

  // one application per customer: show where it stands
  if (mine.data) {
    const r = mine.data;
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Your license application</Text>
          <Text style={styles.statusLine}>Category {r.license_category}</Text>
          <Text style={styles.statusValue}>{STATUS_TEXT[r.status] ?? r.status}</Text>
          {r.remarks ? <Text style={styles.statusLine}>Note: {r.remarks}</Text> : null}
          <Text style={styles.statusSmall}>Submitted {new Date(r.created_at).toLocaleDateString()}</Text>
        </View>
      </ScrollView>
    );
  }

  const provinces = locations.data ?? [];
  const districts = provinces.find((p) => p.name === province)?.districts ?? [];
  const curDistricts = provinces.find((p) => p.name === curProvince)?.districts ?? [];

  const onSubmit = async () => {
    const wardNo = ward.trim() === "" ? null : Number(ward);
    const cur = sameAddress
      ? { province, district, municipality: municipality.trim(), ward, address: address.trim() }
      : { province: curProvince, district: curDistrict, municipality: curMunicipality.trim(), ward: curWard, address: curAddress.trim() };
    const curWardNo = cur.ward.trim() === "" ? null : Number(cur.ward);
    const badWard = (n: number | null) => n === null || !Number.isInteger(n) || n < 1 || n > 35;
    const problem =
      !isValidDate(dob) ? "Enter the date of birth as YYYY-MM-DD."
      : !gender ? "Select the gender."
      : !PHONE_RE.test(phone.trim()) ? "Enter a valid phone number."
      : father.trim().length < 2 ? "Enter the father's name."
      : mother.trim().length < 2 ? "Enter the mother's name."
      : citizenship.trim() === "" ? "Enter the citizenship number."
      : !category ? "Select the license category."
      : !province ? "Select the province."
      : !district ? "Select the district."
      : municipality.trim() === "" || address.trim() === "" ? "Enter the permanent municipality and street."
      : badWard(wardNo) ? "Permanent ward number must be 1 to 35."
      : !cur.province || !cur.district ? "Select the current province and district."
      : cur.municipality === "" || cur.address === "" ? "Enter the current municipality and street."
      : badWard(curWardNo) ? "Current ward number must be 1 to 35."
      : !front || !back || !passport ? "Add the citizenship / NID front and back photos and the passport size photo."
      : "";
    if (problem) return Alert.alert("Check your application", problem);

    try {
      await submit.mutateAsync({
        date_of_birth: dob,
        gender,
        blood_group: blood,
        father_name: father.trim(),
        mother_name: mother.trim(),
        citizenship_no: citizenship.trim(),
        license_category: category,
        province,
        district,
        municipality: municipality.trim(),
        ward_no: wardNo,
        address: address.trim(),
        contact_phone: phone.trim(),
        current_province: cur.province,
        current_district: cur.district,
        current_municipality: cur.municipality,
        current_ward_no: curWardNo,
        current_address: cur.address,
        license_front_image: front!.path,
        license_back_image: back!.path,
        passport_photo: passport!.path,
      });
      Alert.alert("Application submitted", "We will contact you soon.", [{ text: "OK", onPress: () => router.back() }]);
    } catch {
      // the shared api client already showed what went wrong
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Fill in your details to apply for a new license. Your name and email are taken from your account.
        </Text>

        <View style={styles.reqCard}>
          <Text style={styles.reqTitle}>What you need</Text>
          {REQUIREMENTS.map((r) => (
            <Text key={r} style={styles.reqItem}>
              {"\u2022"} {r}
            </Text>
          ))}
        </View>

        <Text style={styles.section}>Personal details</Text>
        <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" hint="We will call this number about your application" />
        <Field label="Date of birth" value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" hint="Must be at least 16 years old" />
        <Text style={styles.label}>Gender</Text>
        <View style={styles.chips}>
          {GENDERS.map((g) => (
            <Chip key={g.value} label={g.label} active={gender === g.value} onPress={() => setGender(g.value)} />
          ))}
        </View>
        <Text style={styles.label}>Blood group (optional)</Text>
        <View style={styles.chips}>
          {BLOOD.map((b) => (
            <Chip key={b} label={b} active={blood === b} onPress={() => setBlood(blood === b ? "" : b)} />
          ))}
        </View>
        <Field label="Father's name" value={father} onChangeText={setFather} />
        <Field label="Mother's name" value={mother} onChangeText={setMother} />
        <Field label="Citizenship number" value={citizenship} onChangeText={setCitizenship} />

        <Text style={styles.section}>License</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <Chip key={c.value} label={c.label} active={category === c.value} onPress={() => setCategory(c.value)} />
          ))}
        </View>

        <Text style={styles.section}>Permanent address</Text>
        <Text style={styles.label}>Province</Text>
        <View style={styles.chips}>
          {provinces.map((p) => (
            <Chip
              key={p.name}
              label={p.name}
              active={province === p.name}
              onPress={() => {
                setProvince(p.name);
                setDistrict("");
              }}
            />
          ))}
        </View>
        {province ? (
          <>
            <Text style={styles.label}>District</Text>
            <View style={styles.chips}>
              {districts.map((d) => (
                <Chip key={d} label={d} active={district === d} onPress={() => setDistrict(d)} />
              ))}
            </View>
          </>
        ) : null}
        <Field label="Municipality" value={municipality} onChangeText={setMunicipality} />
        <Field label="Ward no." value={ward} onChangeText={setWard} keyboardType="number-pad" />
        <Field label="Street / tole" value={address} onChangeText={setAddress} />

        <Text style={styles.section}>Current address</Text>
        <View style={styles.chips}>
          <Chip label="Same as permanent address" active={sameAddress} onPress={() => setSameAddress(!sameAddress)} />
        </View>
        {sameAddress ? null : (
          <>
            <Text style={styles.label}>Province</Text>
            <View style={styles.chips}>
              {provinces.map((p) => (
                <Chip
                  key={p.name}
                  label={p.name}
                  active={curProvince === p.name}
                  onPress={() => {
                    setCurProvince(p.name);
                    setCurDistrict("");
                  }}
                />
              ))}
            </View>
            {curProvince ? (
              <>
                <Text style={styles.label}>District</Text>
                <View style={styles.chips}>
                  {curDistricts.map((d) => (
                    <Chip key={d} label={d} active={curDistrict === d} onPress={() => setCurDistrict(d)} />
                  ))}
                </View>
              </>
            ) : null}
            <Field label="Municipality" value={curMunicipality} onChangeText={setCurMunicipality} />
            <Field label="Ward no." value={curWard} onChangeText={setCurWard} keyboardType="number-pad" />
            <Field label="Street / tole" value={curAddress} onChangeText={setCurAddress} />
          </>
        )}

        <Text style={styles.section}>Photos</Text>
        <PhotoPicker label="Citizenship / NID - front" value={front} onChange={setFront} aspect={[16, 10]} />
        <PhotoPicker label="Citizenship / NID - back" value={back} onChange={setBack} aspect={[16, 10]} />
        <PhotoPicker label="Passport size photo" value={passport} onChange={setPassport} aspect={[3, 4]} />

        <PrimaryButton
          title={submit.isPending ? "Submitting..." : "Submit application"}
          onPress={onSubmit}
          disabled={submit.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: BrandColors.paper },
  content: { padding: Space.page, paddingBottom: 48 },
  intro: { fontSize: 13, color: BrandColors.inkSoft, marginBottom: 12 },
  section: { fontSize: 15, fontWeight: "800", color: BrandColors.ink, marginTop: 14, marginBottom: 10 },
  label: { fontSize: 12, fontWeight: "700", color: BrandColors.inkSoft, marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  photoBlock: { marginBottom: 14 },
  photoBox: {
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: BrandColors.line,
    backgroundColor: BrandColors.card,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photo: { width: "100%", height: "100%" },
  photoHint: { color: BrandColors.inkSoft, fontSize: 13 },
  reqCard: {
    backgroundColor: BrandColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.line,
    padding: 14,
    gap: 4,
    marginBottom: 6,
  },
  reqTitle: { fontSize: 13, fontWeight: "800", color: BrandColors.ink, marginBottom: 2 },
  reqItem: { fontSize: 12, color: BrandColors.inkSoft, lineHeight: 18 },
  statusCard: {
    backgroundColor: BrandColors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BrandColors.line,
    padding: 18,
    gap: 6,
  },
  statusTitle: { fontSize: 16, fontWeight: "800", color: BrandColors.ink },
  statusValue: { fontSize: 15, fontWeight: "700", color: BrandColors.crimson },
  statusLine: { fontSize: 13, color: BrandColors.inkSoft },
  statusSmall: { fontSize: 11, color: BrandColors.inkSoft, marginTop: 6 },
});

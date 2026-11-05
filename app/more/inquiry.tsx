import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { BrandColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { Chip, Space } from "@/components/ui/kit";
import { Field, PrimaryButton } from "@/components/Service/form";
import { HELP_TYPES, useSendInquiry } from "@/hooks/mobile/useApplication";

const PHONE = /^\+?[0-9][0-9 -]{6,18}[0-9]$/;
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export default function Inquiry() {
  const router = useRouter();
  const { user } = useAuth();
  const send = useSendInquiry();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [helpType, setHelpType] = useState("REGISTRATION");
  const [message, setMessage] = useState("");

  const submit = async () => {
    const n = name.trim();
    const m = message.trim();
    if (n.length < 2) return Alert.alert("Check your details", "Enter your name.");
    if (!PHONE.test(phone.trim())) return Alert.alert("Check your details", "Enter a valid phone number.");
    if (email.trim() && !EMAIL.test(email.trim())) return Alert.alert("Check your details", "Enter a valid email.");
    if (m.length < 10) return Alert.alert("Check your details", "Write at least 10 characters in the message.");
    if (/[<>]/.test(`${n}${email}${m}`)) return Alert.alert("Check your details", "Please remove < and > characters.");

    try {
      await send.mutateAsync({
        name: n,
        phone: phone.trim(),
        email: email.trim(),
        help_type: helpType,
        message: m,
      });
      Alert.alert("Message sent", "Thank you. We will get back to you soon.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      // the shared api client already showed what went wrong
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>Ask us anything. Our team will contact you.</Text>

        <Field label="Name" value={name} onChangeText={setName} />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" />

        <Text style={styles.label}>I need help with</Text>
        <View style={styles.chips}>
          {HELP_TYPES.map((t) => (
            <Chip key={t.value} label={t.label} active={helpType === t.value} onPress={() => setHelpType(t.value)} />
          ))}
        </View>

        <Field
          label="Message"
          value={message}
          onChangeText={setMessage}
          multiline
          hint={`${message.trim().length}/2000`}
        />

        <PrimaryButton title={send.isPending ? "Sending..." : "Send inquiry"} onPress={submit} disabled={send.isPending} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.paper },
  content: { padding: Space.page, paddingBottom: 40 },
  intro: { fontSize: 13, color: BrandColors.inkSoft, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "700", color: BrandColors.inkSoft, marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
});

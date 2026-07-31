import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setError("Enter a valid email address");
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      // context transitions status to 'otp-pending' and sets otpSource to 'forgot-password'
      router.replace("/verify-otp");
    } catch (err: any) {
      Alert.alert(
        "Request failed",
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#1a1a1e" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and {"we'll"} send you an OTP to reset your password.
          </Text>
        </View>

        {/* Email field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputWrapper, error && styles.inputError]}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#8a8a8e"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#a0a0a5"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(undefined);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Send Reset Code</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f4f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "700", color: "#1a1a1e", marginBottom: 12 },
  subtitle: { fontSize: 15, color: "#6b6b70", lineHeight: 22 },
  fieldGroup: { marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "600", color: "#3a3a3e", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e2e5",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: "#f9f9fb",
  },
  inputError: { borderColor: "#e5484d" },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: "#1a1a1e" },
  errorText: { color: "#e5484d", fontSize: 12, marginTop: 4, marginLeft: 2 },
  submitButton: {
    backgroundColor: "#4f6bed",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

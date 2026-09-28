import { useAuth } from "@/context/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from "react-native";
import useEmailStore from "@/store/store";

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { verifyOtp, resendOtp } = useAuth();
  const {email, setEmail} = useEmailStore();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChangeText = (text: string, index: number) => {
    // Keep only last char if user inputs multiple
    const cleanedText = text.replace(/[^0-9]/g, "").slice(-1);

    const newOtp = [...otp];
    newOtp[index] = cleanedText;
    setOtp(newOtp);

    // Auto-focus next input if we typed a number
    if (cleanedText && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      // If current input is empty, focus previous input and clear it
      if (!otp[index] && index > 0) {
        inputs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    setEmail(email)
    if (otpCode.length < 6) {
      Alert.alert(
        "Verification failed",
        "Please enter the complete 6-digit OTP code.",
      );
      return;
    }

    const credentials = {
      otpCode,
      email
    }


    setIsSubmitting(true);
    try {
      await verifyOtp(credentials);
    } catch (err: any) {
      Alert.alert(
        "Verification failed",
        err.message || "Invalid OTP code. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendOtp(email);
      Alert.alert("Code resent", "A new OTP code has been sent to your email.");
    } catch {
      Alert.alert(
        "Resend failed",
        "Could not resend OTP code. Please try again.",
      );
    } finally {
      setIsResending(false);
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
          onPress={() => router.replace("/")}
          hitSlop={12}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#1a1a1e" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            {"We've"} sent a 6-digit verification code to{" "}
            <Text style={styles.emailText}>{"your email"}</Text>.
          </Text>

          <View style={styles.demoBanner}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#4f6bed"
            />
            <Text style={styles.demoBannerText}>
              For testing, please use the code:{" "}
              <Text style={styles.boldText}>123456</Text>
            </Text>
          </View>
        </View>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  otp[index] !== "" && styles.otpInputFilled,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={otp[index]}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (otp.join("").length < 6 || isSubmitting) && styles.buttonDisabled,
          ]}
          onPress={handleVerify}
          disabled={otp.join("").length < 6 || isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Verify & Proceed</Text>
          )}
        </TouchableOpacity>

        {/* Resend and Flow Links */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{"Didn't"} receive the code? </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={isResending}
            hitSlop={8}
          >
            {isResending ? (
              <ActivityIndicator size="small" color="#4f6bed" />
            ) : (
              <Text style={styles.resendLink}>Resend OTP</Text>
            )}
          </TouchableOpacity>
        </View>
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
  header: { marginBottom: 36 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1e",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b6b70",
    lineHeight: 22,
    marginBottom: 16,
  },
  emailText: { color: "#1a1a1e", fontWeight: "600" },
  demoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff3ff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  demoBannerText: { fontSize: 14, color: "#2b409c", flex: 1 },
  boldText: { fontWeight: "700" },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 36,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#e2e2e5",
    borderRadius: 12,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    backgroundColor: "#f9f9fb",
    color: "#1a1a1e",
  },
  otpInputFilled: {
    borderColor: "#4f6bed",
    backgroundColor: "#fff",
  },
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
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { fontSize: 14, color: "#6b6b70" },
  resendLink: { fontSize: 14, color: "#4f6bed", fontWeight: "700" },
});

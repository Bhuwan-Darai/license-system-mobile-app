import { Ionicons } from "@expo/vector-icons";
import React, { useState, useRef, useEffect } from "react";
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
import { BrandColors } from "@/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp, verifyOtp, continueAsGuest, status, tempPhone } = useAuth();

  const [language, setLanguage] = useState<"EN" | "NP">("EN");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const otpRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const handleSendOtp = async () => {
    if (phone.trim().length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number starting with 9");
      return;
    }

    setIsSendingOtp(true);
    try {
      await sendOtp(phone);
      setOtpSent(true);
      setCountdown(30);
      Alert.alert("OTP Sent", "For testing, use the OTP code: 1234");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 4) {
      Alert.alert("Error", "Please enter the complete 4-digit OTP");
      return;
    }

    setIsVerifying(true);
    try {
      const success = await verifyOtp(code);
      if (success) {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Invalid OTP code. Use 1234 for testing.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const cleanedText = text.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanedText;
    setOtp(newOtp);

    // Auto-focus next input
    if (cleanedText && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    router.replace("/(tabs)");
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
        {/* Language selector */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.langToggle}
            onPress={() => setLanguage((l) => (l === "EN" ? "NP" : "EN"))}
            activeOpacity={0.8}
          >
            <Text style={styles.langText}>
              {language === "EN" ? "EN / नेपाली" : "नेपाली / EN"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Brand Circle Badge */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>LY</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {language === "EN" ? "Welcome back" : "स्वागत छ"}
          </Text>
          <Text style={styles.subtitle}>
            {language === "EN"
              ? "Log in with your mobile number to save practice progress across devices."
              : "यन्त्रहरूमा अभ्यास प्रगति बचत गर्न आफ्नो मोबाइल नम्बर लग इन गर्नुहोस्।"}
          </Text>
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>
            {language === "EN" ? "MOBILE NUMBER" : "मोबाइल नम्बर"}
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="98XX XXX XXX"
              placeholderTextColor={BrandColors.inkSoft}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              editable={!otpSent}
            />
            {otpSent && (
              <TouchableOpacity
                onPress={() => {
                  setOtpSent(false);
                  setOtp(Array(4).fill(""));
                }}
                style={styles.editPhone}
              >
                <Ionicons name="create-outline" size={20} color={BrandColors.himalaya} />
              </TouchableOpacity>
            )}
          </View>

          {otpSent && (
            <View style={styles.otpSection}>
              <Text style={styles.inputLabel}>
                {language === "EN" ? "OTP CODE" : "ओटीपी कोड"}
              </Text>
              <View style={styles.otpInputsContainer}>
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (otpRefs.current[index] = ref)}
                      style={styles.otpInputBox}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={otp[index]}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                      selectTextOnFocus
                      autoFocus={index === 0}
                    />
                  ))}
              </View>

              <View style={styles.resendRow}>
                {countdown > 0 ? (
                  <Text style={styles.countdownText}>
                    Resend OTP in 00:{countdown < 10 ? `0${countdown}` : countdown}
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp} activeOpacity={0.8}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Continue button */}
          <TouchableOpacity
            style={[
              styles.continueBtn,
              (phone.length !== 10 || (otpSent && otp.join("").length !== 4)) &&
                styles.btnDisabled,
            ]}
            onPress={otpSent ? handleVerifyOtp : handleSendOtp}
            disabled={
              isSendingOtp ||
              isVerifying ||
              phone.length !== 10 ||
              (otpSent && otp.join("").length !== 4)
            }
            activeOpacity={0.85}
          >
            {isSendingOtp || isVerifying ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.continueBtnText}>
                {otpSent
                  ? language === "EN"
                    ? "Verify & Continue →"
                    : "प्रमाणित गर्नुहोस् र जारी राख्नुहोस् →"
                  : language === "EN"
                  ? "Continue →"
                  : "जारी राख्नुहोस् →"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Guest Link */}
          <View style={styles.guestRow}>
            <Text style={styles.orText}>or </Text>
            <TouchableOpacity onPress={handleGuestAccess} hitSlop={12}>
              <Text style={styles.guestLink}>
                {language === "EN" ? "continue as guest" : "अतिथिको रूपमा जारी राख्नुहोस्"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: BrandColors.paper,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  topRow: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  langToggle: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: BrandColors.paperDim,
    borderWidth: 1,
    borderColor: BrandColors.line,
  },
  langText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: BrandColors.inkSoft,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3.5,
    borderColor: BrandColors.crimson,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "800",
    color: BrandColors.crimson,
    fontFamily: "System",
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: BrandColors.ink,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13.5,
    color: BrandColors.inkSoft,
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.08,
    color: BrandColors.inkSoft,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: BrandColors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: BrandColors.ink,
  },
  editPhone: {
    padding: 4,
  },
  otpSection: {
    marginBottom: 20,
  },
  otpInputsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  otpInputBox: {
    width: 44,
    height: 48,
    borderWidth: 1.5,
    borderColor: BrandColors.line,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: BrandColors.ink,
  },
  resendRow: {
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 12,
    color: BrandColors.inkSoft,
    fontWeight: "500",
  },
  resendLink: {
    fontSize: 12,
    color: BrandColors.himalaya,
    fontWeight: "700",
  },
  continueBtn: {
    height: 52,
    backgroundColor: BrandColors.crimson,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: BrandColors.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  guestRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  orText: {
    fontSize: 13,
    color: BrandColors.inkSoft,
  },
  guestLink: {
    fontSize: 13,
    color: BrandColors.himalaya,
    fontWeight: "700",
  },
});

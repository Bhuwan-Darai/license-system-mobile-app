import { BrandColors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import api from "@/axios";
import useEmailStore from "@/store/store";

type LoginMethod = "phone" | "email";

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp, verifyOtp, continueAsGuest, status, tempPhone, login, loginLoading } = useAuth();

  const [language, setLanguage] = useState<"EN" | "NP">("EN");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");

  // Phone / OTP
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Email / Password
  // const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const {email ,setEmail} = useEmailStore();

  const otpRefs = useRef<(TextInput | null)[]>([]);

  const handleSendOtp = async () => {
    if (phone.trim().length !== 10) {
      Alert.alert(
        "Error",
        language === "EN"
          ? "Please enter a valid 10-digit mobile number starting with 9"
          : "कृपया ९ बाट सुरु हुने १० अंकको मोबाइल नम्बर प्रविष्ट गर्नुहोस्",
      );
      return;
    }

    setIsSendingOtp(true);
    try {
      await sendOtp(phone);
      setOtpSent(true);
      setCountdown(30);
      Alert.alert(
        "OTP Sent",
        language === "EN"
          ? "For testing, use the OTP code: 1234"
          : "परीक्षणका लागि ओटीपी कोड: १२३४ प्रयोग गर्नुहोस्",
      );
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message ||
          (language === "EN"
            ? "Failed to send OTP. Please try again."
            : "ओटीपी पठाउन असफल। कृपया पुन: प्रयास गर्नुहोस्।"),
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 4) {
      Alert.alert(
        "Error",
        language === "EN"
          ? "Please enter the complete 4-digit OTP"
          : "कृपया पूरा ४ अंकको ओटीपी प्रविष्ट गर्नुहोस्",
      );
      return;
    }

    setIsVerifying(true);
    try {
      const success = await verifyOtp(code);
      if (success) {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message ||
          (language === "EN"
            ? "Invalid OTP code. Use 1234 for testing."
            : "अवैध ओटीपी। परीक्षणका लागि १२३४ प्रयोग गर्नुहोस्।"),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Error",
        language === "EN"
          ? "Please enter both email and password"
          : "कृपया इमेल र पासवर्ड दुवै प्रविष्ट गर्नुहोस्",
      );
      return;
    }

    setEmail(email);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        "Error",
        language === "EN"
          ? "Please enter a valid email address"
          : "कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्",
      );
      return;
    }

    try {
      // TODO: Replace with your actual email/password login function from useAuth
      // Example: await loginWithEmail(email.trim(), password);
      // For now we just simulate success:
    const res =  await login({email,password});
    console.log("res",res);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message ||
          (language === "EN"
            ? "Invalid email or password"
            : "अवैध इमेल वा पासवर्ड"),
      );
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const cleanedText = text.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanedText;
    setOtp(newOtp);

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

  const handleForgotPassword = () => {
    // Navigate to your forgot-password screen
    router.push("/forgot-password");
    // or Alert.alert("Forgot Password", "Coming soon...");
  };

  const handleSignUp = () => {
    // Navigate to your sign-up screen
    router.push("/sign-up");
    // or Alert.alert("Sign Up", "Coming soon...");
  };

  const isPhoneContinueDisabled =
    isSendingOtp ||
    isVerifying ||
    phone.length !== 10 ||
    (otpSent && otp.join("").length !== 4);

  const isEmailContinueDisabled =
    isLoggingIn || !email.trim() || !password.trim();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
              ? "Log in to save practice progress across devices."
              : "यन्त्रहरूमा अभ्यास प्रगति बचत गर्न लग इन गर्नुहोस्।"}
          </Text>
        </View>

        {/* Method switcher */}
        <View style={styles.methodSwitcher}>
          <TouchableOpacity
            style={[
              styles.methodTab,
              loginMethod === "email" && styles.methodTabActive,
            ]}
            onPress={() => setLoginMethod("email")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.methodTabText,
                loginMethod === "email" && styles.methodTabTextActive,
              ]}
            >
              {language === "EN" ? "Email" : "इमेल"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.methodTab,
              loginMethod === "phone" && styles.methodTabActive,
            ]}
            onPress={() => setLoginMethod("phone")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.methodTabText,
                loginMethod === "phone" && styles.methodTabTextActive,
              ]}
            >
              {language === "EN" ? "Phone" : "फोन"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ==================== EMAIL / PASSWORD ==================== */}
        {loginMethod === "email" && (
          <View style={styles.form}>
            <Text style={styles.inputLabel}>
              {language === "EN" ? "EMAIL" : "इमेल"}
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={BrandColors.inkSoft}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={BrandColors.inkSoft}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.inputLabel}>
              {language === "EN" ? "PASSWORD" : "पासवर्ड"}
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={BrandColors.inkSoft}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={
                  language === "EN"
                    ? "Enter your password"
                    : "पासवर्ड प्रविष्ट गर्नुहोस्"
                }
                placeholderTextColor={BrandColors.inkSoft}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((s) => !s)}
                style={styles.eyeBtn}
                hitSlop={10}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={BrandColors.inkSoft}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotRow}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotLink}>
                {language === "EN" ? "Forgot password?" : "पासवर्ड बिर्सनुभयो?"}
              </Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              style={[
                styles.continueBtn,
                loginLoading && styles.btnDisabled,
              ]}
              onPress={handleEmailLogin}
              disabled={isEmailContinueDisabled}
              activeOpacity={0.85}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.continueBtnText}>
                  {language === "EN" ? "Log in →" : "लग इन →"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ==================== PHONE / OTP ==================== */}
        {loginMethod === "phone" && (
          <View style={styles.form}>
            <Text style={styles.inputLabel}>
              {language === "EN" ? "MOBILE NUMBER" : "मोबाइल नम्बर"}
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={18}
                color={BrandColors.inkSoft}
                style={styles.inputIcon}
              />
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
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color={BrandColors.himalaya}
                  />
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
                        // ref={(ref) => (otpRefs.current[index] = ref)}
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
                      {language === "EN"
                        ? "Resend OTP in"
                        : "ओटीपी पुन: पठाउनुहोस्"}{" "}
                      00:{countdown < 10 ? `0${countdown}` : countdown}
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={handleSendOtp}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.resendLink}>
                        {language === "EN"
                          ? "Resend OTP"
                          : "ओटीपी पुन: पठाउनुहोस्"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Continue button */}
            <TouchableOpacity
              style={[
                styles.continueBtn,
                isPhoneContinueDisabled && styles.btnDisabled,
              ]}
              onPress={otpSent ? handleVerifyOtp : handleSendOtp}
              disabled={isPhoneContinueDisabled}
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
          </View>
        )}

        {/* Guest + Sign up */}
        <View style={styles.bottomLinks}>
          <View style={styles.guestRow}>
            <Text style={styles.orText}>
              {language === "EN" ? "or " : "वा "}
            </Text>
            <TouchableOpacity onPress={handleGuestAccess} hitSlop={12}>
              <Text style={styles.guestLink}>
                {language === "EN"
                  ? "continue as guest"
                  : "अतिथिको रूपमा जारी राख्नुहोस्"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.orText}>
              {language === "EN" ? "Don't have an account? " : "खाता छैन? "}
            </Text>
            <TouchableOpacity onPress={handleSignUp} hitSlop={12}>
              <Text style={styles.signupLink}>
                {language === "EN" ? "Sign up" : "साइन अप"}
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
    paddingBottom: 40,
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
    marginBottom: 24,
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

  // Method switcher
  methodSwitcher: {
    flexDirection: "row",
    backgroundColor: BrandColors.paperDim,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BrandColors.line,
  },
  methodTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  methodTabActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  methodTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: BrandColors.inkSoft,
  },
  methodTabTextActive: {
    color: BrandColors.ink,
  },

  form: {
    // no flex:1 so bottom links stay visible
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
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: BrandColors.ink,
  },
  eyeBtn: {
    padding: 4,
  },
  editPhone: {
    padding: 4,
  },
  forgotRow: {
    alignItems: "flex-end",
    marginBottom: 8,
    marginTop: -4,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: "700",
    color: BrandColors.himalaya,
  },

  // OTP
  otpSection: {
    marginBottom: 8,
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

  bottomLinks: {
    marginTop: 8,
  },
  guestRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  signupRow: {
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
  signupLink: {
    fontSize: 13,
    color: BrandColors.crimson,
    fontWeight: "800",
  },
});

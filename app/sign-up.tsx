import { useAuth } from "@/context/auth";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
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
import useEmailStore from "@/store/store";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const {setEmail,clearEmail} = useEmailStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!data.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!data.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }

    if (!data.password) {
      nextErrors.password = "Password is required";
    } else if (data.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!data.confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password";
    } else if (data.password !== data.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // const {
  //   mutateAsync: register,
  //   isPending: isRegistering
  // } = useMutation({
  //   mutationFn: async (credentials: {
  //     name: string;
  //     email: string;
  //     password: string;
  //   }) => {
  //     await signUp(credentials.name, credentials.email, credentials.password);
  //   }
  // });

  const handleSignUp = async () => {
    if (!validate()) return;
    setIsRegistering(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
      };
      setEmail(payload.email);
      console.log("Sign-up payload:", payload);
    const res =  await signUp(
        payload.name,
        payload.email,
        payload.password,
      );

    setIsRegistering(false);

    console.log('res',res)
      // SignUp in context changes status to 'otp-pending'
      router.replace("/verify-otp");

    } catch (err: any) {
      setIsRegistering(false);
      clearEmail();
      Alert.alert(
        "Registration failed",
        err.message || "Something went wrong. Please try again.",
      );
      throw err;
    } finally {
      setIsRegistering(false);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        {/* User Name field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>User Name</Text>
          <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#8a8a8e"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#a0a0a5"
              value={data.name}
              onChangeText={(text) => {
                setData((prev) => ({ ...prev, name: text }));
                if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              textContentType="username"
              returnKeyType="next"
            />
          </View>
          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : null}
        </View>

        {/* Email field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <View
            style={[styles.inputWrapper, errors.email && styles.inputError]}
          >
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
              value={data.email}
              onChangeText={(text) => {
                setData((prev) => ({ ...prev, email: text }));
                if (errors.email)
                  setErrors((e) => ({ ...e, email: undefined }));
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
            />
          </View>
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        {/* Password field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View
            style={[styles.inputWrapper, errors.password && styles.inputError]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#8a8a8e"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Min. 6 characters"
              placeholderTextColor="#a0a0a5"
              value={data.password}
              onChangeText={(text) => {
                setData((prev) => ({ ...prev, password: text }));
                if (errors.password)
                  setErrors((e) => ({ ...e, password: undefined }));
              }}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              returnKeyType="next"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((s) => !s)}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#8a8a8e"
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
        </View>

        {/* Confirm Password field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.confirmPassword && styles.inputError,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#8a8a8e"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#a0a0a5"
              value={data.confirmPassword}
              onChangeText={(text) => {
                setData((prev) => ({ ...prev, confirmPassword: text }));
                if (errors.confirmPassword)
                  setErrors((e) => ({ ...e, confirmPassword: undefined }));
              }}
              secureTextEntry={!showConfirmPassword}
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword((s) => !s)}
              hitSlop={8}
              // disabled={isRegistering}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#8a8a8e"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          ) : null}
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitButton, isRegistering && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={isRegistering}
          activeOpacity={0.85}
        >
          {isRegistering ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.navigate("/")} hitSlop={8}>
            <Text style={styles.loginLink}>Log in</Text>
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
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "700", color: "#1a1a1e", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#6b6b70" },
  fieldGroup: { marginBottom: 16 },
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
    marginTop: 24,
    marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loginRow: { flexDirection: "row", justifyContent: "center" },
  loginText: { fontSize: 14, color: "#6b6b70" },
  loginLink: { fontSize: 14, color: "#4f6bed", fontWeight: "700" },
});

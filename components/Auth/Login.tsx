import { useAuth } from "@/context/auth";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
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

// Required once, at module scope, for the Google OAuth redirect to resolve properly
WebBrowser.maybeCompleteAuthSession();

type LoginScreenProps = {
  onLoginSuccess?: (user: { email: string }) => void;
  onNavigateToForgotPassword?: () => void;
  onNavigateToSignUp?: () => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({
  onLoginSuccess,
  onNavigateToForgotPassword,
  onNavigateToSignUp,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Replace these with your actual OAuth client IDs from the Google Cloud Console.
  // You need separate IDs per platform (or use expoClientId for the Expo Go client).
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  });

  const { isAuthenticated, refetch: refetchAuth } = useAuth();
  React.useEffect(() => {
    if (isAuthenticated) {
      refetchAuth();
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleToken(id_token);
    } else if (response?.type === "error") {
      setIsGoogleSubmitting(false);
      Alert.alert("Google Sign-In failed", "Please try again.");
    }
  }, [response]);

  const handleGoogleToken = async (idToken: string) => {
    try {
      // TODO: send idToken to your backend to verify and create/find the user session
      // const res = await fetch('https://your-api.com/auth/google', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ idToken }),
      // });
      console.log("Google id_token:", idToken);
      onLoginSuccess?.({ email: "google-user@example.com" });
    } catch (err) {
      Alert.alert("Google Sign-In failed", "Please try again.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true);
    try {
      await promptAsync();
    } catch (err) {
      setIsGoogleSubmitting(false);
      Alert.alert("Google Sign-In failed", "Please try again.");
    }
  };

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // TODO: replace with your real authentication call
      // const res = await fetch('https://your-api.com/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // if (!res.ok) throw new Error('Invalid credentials');

      await new Promise((resolve) => setTimeout(resolve, 800)); // simulated request
      onLoginSuccess?.({ email });
    } catch (err) {
      Alert.alert(
        "Login failed",
        "Please check your credentials and try again.",
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
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
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
              value={email}
              onChangeText={(text) => {
                setEmail(text);
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
              placeholder="Enter your password"
              placeholderTextColor="#a0a0a5"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password)
                  setErrors((e) => ({ ...e, password: undefined }));
              }}
              secureTextEntry={!showPassword}
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
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

        {/* Forgot password */}
        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={onNavigateToForgotPassword}
          hitSlop={8}
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login button */}
        <TouchableOpacity
          style={[styles.loginButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google login */}
        <TouchableOpacity
          style={[
            styles.googleButton,
            isGoogleSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleGoogleLogin}
          disabled={!request || isGoogleSubmitting}
          activeOpacity={0.85}
        >
          {isGoogleSubmitting ? (
            <ActivityIndicator color="#3c4043" />
          ) : (
            <>
              <AntDesign
                name="google"
                size={20}
                color="#EA4335"
                style={styles.inputIcon}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Sign up link */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>{"Don't"} have an account? </Text>
          <TouchableOpacity onPress={onNavigateToSignUp} hitSlop={8}>
            <Text style={styles.signupLink}>Sign up</Text>
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
    paddingTop: 80,
    paddingBottom: 32,
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
  forgotPasswordButton: { alignSelf: "flex-end", marginBottom: 24 },
  forgotPasswordText: { fontSize: 13, color: "#4f6bed", fontWeight: "600" },
  loginButton: {
    backgroundColor: "#4f6bed",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e2e2e5" },
  dividerText: { marginHorizontal: 12, color: "#8a8a8e", fontSize: 13 },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e2e5",
    borderRadius: 12,
    height: 52,
    marginBottom: 24,
  },
  googleButtonText: { fontSize: 15, fontWeight: "600", color: "#3c4043" },
  signupRow: { flexDirection: "row", justifyContent: "center" },
  signupText: { fontSize: 14, color: "#6b6b70" },
  signupLink: { fontSize: 14, color: "#4f6bed", fontWeight: "700" },
});

import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "@/lib/supabase";
import { useColors } from "@/hooks/useColors";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;
const WEB_BOTTOM = Platform.OS === "web" ? 34 : 0;

type AuthMode = "signin" | "signup";

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleSignUp = async () => {
    setError(null);
    if (!fullName.trim()) { setError("Full name is required."); return; }
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (!supabase) throw new Error("Database not connected");

      const { data, error: authErr } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim() || null,
          },
        },
      });

      if (authErr) throw authErr;

      if (data.user) {
        await AsyncStorage.setItem("yeqal_user_name", fullName.trim());
        await AsyncStorage.setItem("yeqal_user_email", email.trim().toLowerCase());
        if (phone.trim()) await AsyncStorage.setItem("yeqal_user_phone", phone.trim());

        const onboarded = await AsyncStorage.getItem("yeqal_onboarded");
        if (onboarded) {
          router.replace("/(tabs)");
        } else {
          router.replace("/setup");
        }
      }
    } catch (err: any) {
      const msg = err?.message ?? "Sign up failed. Please try again.";
      if (msg.includes("already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(msg);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setError(null);
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    if (!password) { setError("Password is required."); return; }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (!supabase) throw new Error("Database not connected");

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authErr) throw authErr;

      if (data.user) {
        const name = data.user.user_metadata?.full_name ?? data.user.email ?? "User";
        await AsyncStorage.setItem("yeqal_user_name", name);
        await AsyncStorage.setItem("yeqal_user_email", data.user.email ?? "");

        const onboarded = await AsyncStorage.getItem("yeqal_onboarded");
        if (onboarded) {
          router.replace("/(tabs)");
        } else {
          router.replace("/setup");
        }
      }
    } catch (err: any) {
      const msg = err?.message ?? "Sign in failed.";
      if (msg.includes("Invalid login credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(msg);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("yeqal_auth_skipped", "true");
    const onboarded = await AsyncStorage.getItem("yeqal_onboarded");
    if (onboarded) {
      router.replace("/(tabs)");
    } else {
      router.replace("/setup");
    }
  };

  return (
    <LinearGradient
      colors={["#0A1628", "#0F2A1E"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.inner,
            {
              paddingTop: insets.top + WEB_TOP + 24,
              paddingBottom: insets.bottom + WEB_BOTTOM + 40,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & title */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>ያቃ</Text>
            </View>
            <Text style={styles.appName}>Yeqal ያቃል</Text>
            <Text style={styles.tagline}>Ethiopia's trilingual learning companion</Text>
          </View>

          {/* Mode tabs */}
          <View style={styles.modeTabs}>
            <Pressable
              onPress={() => { setMode("signup"); setError(null); }}
              style={[
                styles.modeTab,
                mode === "signup" && styles.modeTabActive,
              ]}
            >
              <Text style={[
                styles.modeTabText,
                mode === "signup" ? styles.modeTabTextActive : { color: "rgba(255,255,255,0.55)" },
              ]}>
                Create Account
              </Text>
            </Pressable>
            <Pressable
              onPress={() => { setMode("signin"); setError(null); }}
              style={[
                styles.modeTab,
                mode === "signin" && styles.modeTabActive,
              ]}
            >
              <Text style={[
                styles.modeTabText,
                mode === "signin" ? styles.modeTabTextActive : { color: "rgba(255,255,255,0.55)" },
              ]}>
                Sign In
              </Text>
            </Pressable>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            {/* Full name — sign up only */}
            {mode === "signup" && (
              <View style={styles.field}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={styles.inputRow}>
                  <Feather name="user" size={16} color="#888" style={styles.inputIcon} />
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Your full name"
                    placeholderTextColor="#999"
                    style={styles.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>
            )}

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={styles.inputRow}>
                <Feather name="mail" size={16} color="#888" style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#999"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Phone — sign up only, optional */}
            {mode === "signup" && (
              <View style={styles.field}>
                <Text style={styles.label}>
                  Phone Number{" "}
                  <Text style={{ color: "#888", fontWeight: "400" }}>(optional)</Text>
                </Text>
                <View style={styles.inputRow}>
                  <Feather name="phone" size={16} color="#888" style={styles.inputIcon} />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+251 91 234 5678"
                    placeholderTextColor="#999"
                    style={styles.input}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>
              </View>
            )}

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputRow}>
                <Feather name="lock" size={16} color="#888" style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                  placeholderTextColor="#999"
                  style={[styles.input, { flex: 1 }]}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#888" />
                </Pressable>
              </View>
            </View>

            {/* Confirm password — sign up only */}
            {mode === "signup" && (
              <View style={styles.field}>
                <Text style={styles.label}>Confirm Password *</Text>
                <View style={styles.inputRow}>
                  <Feather name="lock" size={16} color="#888" style={styles.inputIcon} />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Same password again"
                    placeholderTextColor="#999"
                    style={styles.input}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                  />
                </View>
              </View>
            )}

            {/* Error */}
            {error && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={14} color="#E74C3C" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Success */}
            {success && (
              <View style={styles.successBox}>
                <Feather name="check-circle" size={14} color="#1B6B3A" />
                <Text style={styles.successText}>{success}</Text>
              </View>
            )}

            {/* Submit button */}
            <Pressable
              onPress={mode === "signup" ? handleSignUp : handleSignIn}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitBtn,
                { opacity: pressed || loading ? 0.8 : 1 },
              ]}
            >
              <LinearGradient
                colors={["#1B6B3A", "#2D9A54"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtnInner}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      {mode === "signup" ? "Create Account" : "Sign In"}
                    </Text>
                    <Feather name="arrow-right" size={18} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Mode switch */}
            <Pressable
              onPress={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(null); }}
              style={styles.switchLink}
            >
              <Text style={styles.switchText}>
                {mode === "signup"
                  ? "Already have an account? "
                  : "Don't have an account? "}
                <Text style={{ color: "#D4A017", fontWeight: "700" }}>
                  {mode === "signup" ? "Sign In" : "Create one"}
                </Text>
              </Text>
            </Pressable>
          </View>

          {/* Skip */}
          <Pressable onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Continue without account →</Text>
          </Pressable>

          <Text style={styles.privacyNote}>
            Your data stays on your device. We never share it.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 24 },
  logoArea: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#1B6B3A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#1B6B3A",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  logoText: { fontSize: 24, color: "#fff", fontFamily: "Inter_700Bold" },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular" },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  modeTabActive: { backgroundColor: "#1B6B3A" },
  modeTabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  modeTabTextActive: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 4,
  },
  field: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5,
    marginBottom: 6,
    fontFamily: "Inter_600SemiBold",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#fff",
    fontFamily: "Inter_400Regular",
  },
  eyeBtn: { padding: 4 },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(231, 76, 60, 0.15)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#E74C3C",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(27, 107, 58, 0.2)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
  },
  successText: { flex: 1, fontSize: 13, color: "#4CAF50", fontFamily: "Inter_400Regular" },
  submitBtn: { marginTop: 8, borderRadius: 14, overflow: "hidden" },
  submitBtnInner: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  switchLink: { alignItems: "center", paddingVertical: 14 },
  switchText: { fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular" },
  skipBtn: { alignItems: "center", marginTop: 16, paddingVertical: 8 },
  skipText: { fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "Inter_400Regular" },
  privacyNote: {
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
    textAlign: "center",
    marginTop: 16,
    fontFamily: "Inter_400Regular",
  },
});

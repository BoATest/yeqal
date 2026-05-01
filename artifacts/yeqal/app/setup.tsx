import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { AppLanguage, UserRole } from "@/data/types";

const LANGS: { key: AppLanguage; label: string; native: string; flag: string }[] = [
  { key: "amharic", label: "Amharic", native: "አማርኛ", flag: "ET" },
  { key: "oromo", label: "Afaan Oromo", native: "Afaan Oromoo", flag: "ET" },
  { key: "english", label: "English", native: "English", flag: "EN" },
];

const ROLES: { key: UserRole; label: string; desc: string; icon: string }[] = [
  {
    key: "parent",
    label: "Parent",
    desc: "Help my child with homework",
    icon: "users",
  },
  {
    key: "student",
    label: "Student",
    desc: "I want to learn languages",
    icon: "book-open",
  },
  {
    key: "teacher",
    label: "Teacher",
    desc: "Manage class assignments",
    icon: "briefcase",
  },
  {
    key: "diaspora",
    label: "Diaspora",
    desc: "Ethiopian living abroad",
    icon: "globe",
  },
];

export default function SetupScreen() {
  const colors = useColors();
  const { setRole, setLearningLanguage } = useApp();
  const insets = useSafeAreaInsets();
  const WEB_TOP = Platform.OS === "web" ? 67 : 0;
  const WEB_BOTTOM = Platform.OS === "web" ? 34 : 0;

  const [selectedLang, setSelectedLang] = useState<AppLanguage>("amharic");
  const [selectedRole, setSelectedRole] = useState<UserRole>("parent");
  const [step, setStep] = useState<1 | 2>(1);

  const handleContinue = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    setLearningLanguage(selectedLang);
    setRole(selectedRole);
    await AsyncStorage.setItem("yeqal_onboarded", "true");
    router.replace("/(tabs)");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.inner,
          {
            paddingTop: insets.top + WEB_TOP + 32,
            paddingBottom: insets.bottom + WEB_BOTTOM + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.step, { color: colors.primary }]}>
            Step {step} of 2
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {step === 1 ? "What language do you\nwant to learn?" : "Who are you?"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {step === 1
              ? "You can change this anytime in settings"
              : "This helps us personalize your experience"}
          </Text>
        </View>

        {/* Language selection */}
        {step === 1 && (
          <View style={styles.optionsGrid}>
            {LANGS.map((lang) => {
              const selected = selectedLang === lang.key;
              return (
                <Pressable
                  key={lang.key}
                  onPress={() => setSelectedLang(lang.key)}
                  style={[
                    styles.langCard,
                    {
                      backgroundColor: selected
                        ? colors.greenBg
                        : colors.card,
                      borderColor: selected
                        ? colors.primary
                        : colors.border,
                      borderWidth: selected ? 2 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.flagBadge,
                      {
                        backgroundColor: selected
                          ? colors.primary
                          : colors.muted,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.flagText,
                        { color: selected ? "#fff" : colors.mutedForeground },
                      ]}
                    >
                      {lang.flag}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.langLabel,
                      { color: selected ? colors.primary : colors.text },
                    ]}
                  >
                    {lang.label}
                  </Text>
                  <Text
                    style={[
                      styles.langNative,
                      {
                        color: selected
                          ? colors.greenLight
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {lang.native}
                  </Text>
                  {selected && (
                    <View
                      style={[
                        styles.checkBadge,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Feather name="check" size={12} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Role selection */}
        {step === 2 && (
          <View style={styles.roleList}>
            {ROLES.map((role) => {
              const selected = selectedRole === role.key;
              return (
                <Pressable
                  key={role.key}
                  onPress={() => setSelectedRole(role.key)}
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: selected ? colors.greenBg : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                      borderWidth: selected ? 2 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.roleIcon,
                      {
                        backgroundColor: selected
                          ? colors.primary
                          : colors.muted,
                      },
                    ]}
                  >
                    <Feather
                      name={role.icon as any}
                      size={20}
                      color={selected ? "#fff" : colors.mutedForeground}
                    />
                  </View>
                  <View style={styles.roleText}>
                    <Text
                      style={[
                        styles.roleLabel,
                        { color: selected ? colors.primary : colors.text },
                      ]}
                    >
                      {role.label}
                    </Text>
                    <Text
                      style={[
                        styles.roleDesc,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {role.desc}
                    </Text>
                  </View>
                  {selected && (
                    <Feather name="check-circle" size={20} color={colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Back button for step 2 */}
        {step === 2 && (
          <Pressable onPress={() => setStep(1)} style={styles.backBtn}>
            <Feather name="arrow-left" size={16} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>
              Back
            </Text>
          </Pressable>
        )}

        {/* Continue button */}
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.btn,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.85 : 1,
              marginTop: 32,
            },
          ]}
        >
          <Text style={styles.btnText}>
            {step === 2 ? "Start Learning" : "Continue"}
          </Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 24 },
  header: { marginBottom: 32 },
  step: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    fontFamily: "Inter_700Bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
    marginBottom: 8,
    fontFamily: "Inter_700Bold",
  },
  subtitle: { fontSize: 14, lineHeight: 20, fontFamily: "Inter_400Regular" },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  langCard: {
    width: "47%",
    borderRadius: 16,
    padding: 18,
    alignItems: "flex-start",
    gap: 8,
    position: "relative",
  },
  flagBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  flagText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  langLabel: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  langNative: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  checkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  roleList: { gap: 12 },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  roleText: { flex: 1 },
  roleLabel: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  roleDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  btn: {
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
});

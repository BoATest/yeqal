import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { AppLanguage } from "@/data/types";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;
const WEB_BOTTOM = Platform.OS === "web" ? 34 : 0;
const TAB_BAR = Platform.OS === "web" ? 84 : 60;

const SKILL_COLORS: Record<string, string> = {
  speaking: "#1B6B3A",
  listening: "#1A6B9A",
  reading: "#D4A017",
  writing: "#6B2D9A",
};

const BADGES = [
  { id: "b1", icon: "zap" as const, label: "7-Day Warrior", earned: true },
  { id: "b2", icon: "mic" as const, label: "First Speaker", earned: true },
  { id: "b3", icon: "edit-3" as const, label: "Script Writer", earned: false },
  { id: "b4", icon: "globe" as const, label: "Trilingual", earned: false },
  { id: "b5", icon: "book" as const, label: "Homework Hero", earned: false },
  { id: "b6", icon: "star" as const, label: "Word Master", earned: false },
];

const LANG_OPTIONS: { key: AppLanguage; label: string }[] = [
  { key: "amharic", label: "አማርኛ Amharic" },
  { key: "oromo", label: "Afaan Oromo" },
  { key: "english", label: "English" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const { profile, setLearningLanguage } = useApp();
  const insets = useSafeAreaInsets();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const levelXP = (profile?.xp ?? 0) % 500;
  const level = Math.floor((profile?.xp ?? 0) / 500) + 1;
  const levelPct = (levelXP / 500) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + WEB_TOP,
          paddingBottom: insets.bottom + WEB_BOTTOM + TAB_BAR + 24,
        }}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={["#1B6B3A", "#134F2B"]}
          style={styles.profileHeader}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.name ?? "User"}</Text>
          <Text style={styles.profileRole}>
            {profile?.role?.charAt(0).toUpperCase() +
              (profile?.role?.slice(1) ?? "")}
            {" · "}
            {profile?.learningLanguage === "amharic"
              ? "Learning Amharic"
              : profile?.learningLanguage === "oromo"
              ? "Learning Oromo"
              : "Learning English"}
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { icon: "zap" as const, value: profile?.streak ?? 0, label: "Streak" },
              {
                icon: "star" as const,
                value: profile?.xp ?? 0,
                label: "Total XP",
              },
              {
                icon: "check-circle" as const,
                value: profile?.learnedWords?.length ?? 0,
                label: "Words",
              },
              {
                icon: "heart" as const,
                value: profile?.favorites?.length ?? 0,
                label: "Saved",
              },
            ].map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <Feather name={stat.icon} size={16} color="#F5C842" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Level bar */}
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>Level {level}</Text>
            <View style={[styles.levelBar, { backgroundColor: "#FFFFFF22" }]}>
              <View
                style={[
                  styles.levelFill,
                  { width: `${levelPct}%` as any },
                ]}
              />
            </View>
            <Text style={styles.levelText}>Lvl {level + 1}</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Children section (parent only) */}
          {profile?.role === "parent" &&
            (profile?.children?.length ?? 0) > 0 && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.mutedForeground },
                  ]}
                >
                  MY CHILDREN
                </Text>
                {profile.children.map((child) => (
                  <View
                    key={child.id}
                    style={[
                      styles.childCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.childAvatar,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.childAvatarText}>
                        {child.initials}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.childName, { color: colors.text }]}
                      >
                        {child.name}
                      </Text>
                      <Text
                        style={[
                          styles.childGrade,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        Grade {child.gradeLevel}
                      </Text>
                      {/* Skill bars */}
                      <View style={styles.skillsRow}>
                        {(
                          Object.entries(child.skills) as [string, number][]
                        ).map(([skill, pct]) => (
                          <View key={skill} style={styles.skillItem}>
                            <Text
                              style={[
                                styles.skillLabel,
                                { color: colors.mutedForeground },
                              ]}
                            >
                              {skill.charAt(0).toUpperCase()}
                            </Text>
                            <View
                              style={[
                                styles.skillBar,
                                { backgroundColor: colors.muted },
                              ]}
                            >
                              <View
                                style={[
                                  styles.skillFill,
                                  {
                                    width: `${pct}%` as any,
                                    backgroundColor:
                                      SKILL_COLORS[skill] ?? colors.primary,
                                  },
                                ]}
                              />
                            </View>
                            <Text
                              style={[
                                styles.skillPct,
                                { color: colors.text },
                              ]}
                            >
                              {pct}%
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <View style={styles.childStats}>
                      <Feather name="zap" size={14} color="#F5C842" />
                      <Text
                        style={[styles.childStreak, { color: colors.text }]}
                      >
                        {child.streak}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

          {/* Badges */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: colors.mutedForeground }]}
            >
              ACHIEVEMENTS
            </Text>
            <View style={styles.badgesGrid}>
              {BADGES.map((badge) => (
                <View
                  key={badge.id}
                  style={[
                    styles.badge,
                    {
                      backgroundColor: badge.earned
                        ? colors.greenBg
                        : colors.muted,
                      borderColor: badge.earned
                        ? colors.green + "40"
                        : colors.border,
                      opacity: badge.earned ? 1 : 0.6,
                    },
                  ]}
                >
                  <Feather
                    name={badge.icon}
                    size={22}
                    color={badge.earned ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.badgeLabel,
                      {
                        color: badge.earned
                          ? colors.text
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {badge.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: colors.mutedForeground }]}
            >
              SETTINGS
            </Text>
            <View
              style={[
                styles.settingsCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Learning language */}
              <Pressable
                onPress={() => setShowLangPicker(!showLangPicker)}
                style={styles.settingRow}
              >
                <Feather name="globe" size={18} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Learning language
                </Text>
                <View style={styles.settingRight}>
                  <Text
                    style={[
                      styles.settingValue,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {profile?.learningLanguage ?? "amharic"}
                  </Text>
                  <Feather
                    name={showLangPicker ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.mutedForeground}
                  />
                </View>
              </Pressable>

              {showLangPicker && (
                <View
                  style={[
                    styles.langPicker,
                    { borderTopColor: colors.border },
                  ]}
                >
                  {LANG_OPTIONS.map((opt) => {
                    const active =
                      profile?.learningLanguage === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() => {
                          setLearningLanguage(opt.key);
                          setShowLangPicker(false);
                        }}
                        style={styles.langOption}
                      >
                        <Text
                          style={[
                            styles.langOptionText,
                            {
                              color: active
                                ? colors.primary
                                : colors.text,
                              fontWeight: active ? "700" : "400",
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                        {active && (
                          <Feather
                            name="check"
                            size={16}
                            color={colors.primary}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <View
                style={[
                  styles.settingDivider,
                  { backgroundColor: colors.border },
                ]}
              />

              <Pressable style={styles.settingRow}>
                <Feather name="bell" size={18} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Daily reminders
                </Text>
                <View style={styles.settingRight}>
                  <Text
                    style={[
                      styles.settingValue,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    9:00 PM
                  </Text>
                </View>
              </Pressable>

              <View
                style={[
                  styles.settingDivider,
                  { backgroundColor: colors.border },
                ]}
              />

              <Pressable style={styles.settingRow}>
                <Feather name="flag" size={18} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Report a wrong word
                </Text>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={colors.mutedForeground}
                />
              </Pressable>

              <View
                style={[
                  styles.settingDivider,
                  { backgroundColor: colors.border },
                ]}
              />

              <Pressable style={styles.settingRow}>
                <Feather name="star" size={18} color={colors.gold} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Go Premium
                </Text>
                <View
                  style={[
                    styles.premiumBadge,
                    { backgroundColor: colors.goldBg },
                  ]}
                >
                  <Text
                    style={[styles.premiumText, { color: colors.gold }]}
                  >
                    $4.99/mo
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Footer */}
          <Text style={[styles.footer, { color: colors.mutedForeground }]}>
            ያቃል Yeqal v1.0 · No more calling the neighbor
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    padding: 24,
    paddingBottom: 28,
    alignItems: "center",
    gap: 6,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF22",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF44",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
  },
  profileRole: {
    fontSize: 13,
    color: "#FFFFFFAA",
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 0,
    backgroundColor: "#FFFFFF18",
    borderRadius: 16,
    padding: 12,
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 10,
    color: "#FFFFFF80",
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    marginTop: 8,
  },
  levelText: {
    fontSize: 11,
    color: "#FFFFFFAA",
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
  levelBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  levelFill: {
    height: "100%",
    backgroundColor: "#F5C842",
    borderRadius: 3,
  },
  body: { padding: 20 },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  childCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  childAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  childName: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  childGrade: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  skillsRow: { gap: 4 },
  skillItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  skillLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", width: 14 },
  skillBar: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  skillFill: { height: "100%", borderRadius: 3 },
  skillPct: { fontSize: 10, fontFamily: "Inter_500Medium", width: 28 },
  childStats: { alignItems: "center", gap: 2 },
  childStreak: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  badge: {
    width: "30%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
  settingDivider: { height: 1, marginLeft: 48 },
  langPicker: {
    borderTopWidth: 1,
    paddingVertical: 4,
  },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 48,
    paddingVertical: 10,
  },
  langOptionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  premiumBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
  },
});

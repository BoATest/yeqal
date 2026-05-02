import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { AppLanguage, Child } from "@/data/types";

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

const AVATARS = ["👦", "👧", "🧒", "👶", "🌟", "🦁", "📚", "🎯"];

export default function ProfileScreen() {
  const colors = useColors();
  const { profile, setLearningLanguage, addChild, removeChild } = useApp();
  const insets = useSafeAreaInsets();

  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildGrade, setNewChildGrade] = useState("4");
  const [newChildAvatar, setNewChildAvatar] = useState("👧");
  const [newChildLang, setNewChildLang] = useState<AppLanguage>("amharic");
  const [addChildError, setAddChildError] = useState("");

  const levelXP = (profile?.xp ?? 0) % 500;
  const level = Math.floor((profile?.xp ?? 0) / 500) + 1;
  const levelPct = (levelXP / 500) * 100;

  const handleWhatsAppShare = () => {
    if (!profile) return;
    const child = profile.children[0];
    const childName = child?.name ?? profile.name;
    const msg =
      `📊 *${childName}'s Yeqal Progress*\n` +
      `🔥 Streak: ${profile.streak} days | ⭐ XP: ${profile.xp}\n` +
      `🎤 Speaking: ${child?.skills.speaking ?? 0}% | ✍️ Writing: ${child?.skills.writing ?? 0}% | 👂 Listening: ${child?.skills.listening ?? 0}%\n` +
      `📚 Words this week: ${profile.learnedWords.length}\n` +
      `_Powered by Yeqal ያቃል_`;
    const url = "https://wa.me/?text=" + encodeURIComponent(msg);
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.open(url, "_blank");
    } else {
      Linking.openURL(url);
    }
  };

  const handleAddChild = () => {
    if (!newChildName.trim()) {
      setAddChildError("Please enter a name");
      return;
    }
    const grade = parseInt(newChildGrade, 10);
    if (isNaN(grade) || grade < 1 || grade > 12) {
      setAddChildError("Grade must be between 1 and 12");
      return;
    }
    const child: Child = {
      id: Date.now().toString(),
      name: newChildName.trim(),
      gradeLevel: grade,
      learningLanguage: newChildLang,
      initials: newChildName.trim().charAt(0).toUpperCase(),
      avatar: newChildAvatar,
      streak: 0,
      xp: 0,
      skills: { speaking: 0, listening: 0, reading: 0, writing: 0 },
    };
    addChild(child);
    setNewChildName("");
    setNewChildGrade("4");
    setNewChildAvatar("👧");
    setNewChildLang("amharic");
    setAddChildError("");
    setShowAddChild(false);
  };

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
        <LinearGradient colors={["#1B6B3A", "#134F2B"]} style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.name ?? "User"}</Text>
          <Text style={styles.profileRole}>
            {(profile?.role?.charAt(0).toUpperCase() ?? "") + (profile?.role?.slice(1) ?? "")}
            {" · "}
            {profile?.learningLanguage === "amharic"
              ? "Learning Amharic"
              : profile?.learningLanguage === "oromo"
              ? "Learning Oromo"
              : "Learning English"}
          </Text>

          <View style={styles.statsRow}>
            {[
              { icon: "zap" as const, value: profile?.streak ?? 0, label: "Streak" },
              { icon: "star" as const, value: profile?.xp ?? 0, label: "Total XP" },
              { icon: "check-circle" as const, value: profile?.learnedWords?.length ?? 0, label: "Words" },
              { icon: "heart" as const, value: profile?.favorites?.length ?? 0, label: "Saved" },
            ].map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <Feather name={stat.icon} size={16} color="#F5C842" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.levelRow}>
            <Text style={styles.levelText}>Level {level}</Text>
            <View style={[styles.levelBar, { backgroundColor: "#FFFFFF22" }]}>
              <View style={[styles.levelFill, { width: `${levelPct}%` as any }]} />
            </View>
            <Text style={styles.levelText}>Lvl {level + 1}</Text>
          </View>

          {/* WhatsApp Share */}
          {(profile?.children?.length ?? 0) > 0 && (
            <Pressable
              onPress={handleWhatsAppShare}
              style={styles.whatsappBtn}
            >
              <Feather name="share-2" size={16} color="#1B6B3A" />
              <Text style={styles.whatsappBtnText}>Share progress on WhatsApp</Text>
            </Pressable>
          )}
        </LinearGradient>

        <View style={styles.body}>
          {/* Children section */}
          {profile?.role === "parent" && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                  MY CHILDREN
                </Text>
                <Pressable
                  onPress={() => setShowAddChild(!showAddChild)}
                  style={[styles.addChildBtn, { backgroundColor: colors.primary }]}
                >
                  <Feather name={showAddChild ? "x" : "plus"} size={14} color="#fff" />
                  <Text style={styles.addChildBtnText}>
                    {showAddChild ? "Cancel" : "Add child"}
                  </Text>
                </Pressable>
              </View>

              {/* Add child form */}
              {showAddChild && (
                <View
                  style={[
                    styles.addChildForm,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                    CHILD'S NAME
                  </Text>
                  <TextInput
                    value={newChildName}
                    onChangeText={(t) => { setNewChildName(t); setAddChildError(""); }}
                    placeholder="e.g. Liya"
                    placeholderTextColor={colors.mutedForeground}
                    style={[
                      styles.formInput,
                      { backgroundColor: colors.muted, borderColor: colors.border, color: colors.text },
                    ]}
                  />

                  <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                    GRADE LEVEL
                  </Text>
                  <TextInput
                    value={newChildGrade}
                    onChangeText={(t) => { setNewChildGrade(t); setAddChildError(""); }}
                    placeholder="1–12"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    style={[
                      styles.formInput,
                      { backgroundColor: colors.muted, borderColor: colors.border, color: colors.text },
                    ]}
                  />

                  <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                    AVATAR
                  </Text>
                  <View style={styles.avatarPicker}>
                    {AVATARS.map((emoji) => (
                      <Pressable
                        key={emoji}
                        onPress={() => setNewChildAvatar(emoji)}
                        style={[
                          styles.avatarOption,
                          {
                            backgroundColor:
                              newChildAvatar === emoji ? colors.greenBg : colors.muted,
                            borderColor:
                              newChildAvatar === emoji
                                ? colors.primary
                                : colors.border,
                            borderWidth: newChildAvatar === emoji ? 2 : 1,
                          },
                        ]}
                      >
                        <Text style={styles.avatarEmoji}>{emoji}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                    LEARNING LANGUAGE
                  </Text>
                  <View style={styles.langPickerRow}>
                    {LANG_OPTIONS.map((opt) => (
                      <Pressable
                        key={opt.key}
                        onPress={() => setNewChildLang(opt.key)}
                        style={[
                          styles.langPickerBtn,
                          {
                            backgroundColor:
                              newChildLang === opt.key ? colors.primary : colors.muted,
                            borderColor:
                              newChildLang === opt.key ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.langPickerBtnText,
                            { color: newChildLang === opt.key ? "#fff" : colors.text },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {addChildError ? (
                    <Text style={[styles.formError, { color: colors.destructive }]}>
                      {addChildError}
                    </Text>
                  ) : null}

                  <Pressable
                    onPress={handleAddChild}
                    style={[styles.formSaveBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.formSaveBtnText}>Add child</Text>
                  </Pressable>
                </View>
              )}

              {/* Children list */}
              {profile.children.map((child) => (
                <View
                  key={child.id}
                  style={[
                    styles.childCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={[styles.childAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.childAvatarEmoji}>{child.avatar ?? child.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.childName, { color: colors.text }]}>{child.name}</Text>
                    <Text style={[styles.childGrade, { color: colors.mutedForeground }]}>
                      Grade {child.gradeLevel}
                    </Text>
                    <View style={styles.skillsRow}>
                      {(Object.entries(child.skills) as [string, number][]).map(([skill, pct]) => (
                        <View key={skill} style={styles.skillItem}>
                          <Text style={[styles.skillLabel, { color: colors.mutedForeground }]}>
                            {skill.charAt(0).toUpperCase()}
                          </Text>
                          <View style={[styles.skillBar, { backgroundColor: colors.muted }]}>
                            <View
                              style={[
                                styles.skillFill,
                                {
                                  width: `${pct}%` as any,
                                  backgroundColor: SKILL_COLORS[skill] ?? colors.primary,
                                },
                              ]}
                            />
                          </View>
                          <Text style={[styles.skillPct, { color: colors.text }]}>{pct}%</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.childRight}>
                    <View style={styles.childStats}>
                      <Feather name="zap" size={14} color="#F5C842" />
                      <Text style={[styles.childStreak, { color: colors.text }]}>{child.streak}</Text>
                    </View>
                    {child.id !== "c1" && (
                      <Pressable onPress={() => removeChild(child.id)} style={styles.removeChildBtn}>
                        <Feather name="trash-2" size={14} color={colors.mutedForeground} />
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}

              {profile.children.length === 0 && !showAddChild && (
                <View
                  style={[
                    styles.emptyChildren,
                    { backgroundColor: colors.muted, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.emptyChildrenText, { color: colors.mutedForeground }]}>
                    No children added yet. Tap "Add child" above.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Badges */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              ACHIEVEMENTS
            </Text>
            <View style={styles.badgesGrid}>
              {BADGES.map((badge) => (
                <View
                  key={badge.id}
                  style={[
                    styles.badge,
                    {
                      backgroundColor: badge.earned ? colors.greenBg : colors.muted,
                      borderColor: badge.earned ? colors.green + "40" : colors.border,
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
                      { color: badge.earned ? colors.text : colors.mutedForeground },
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
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              SETTINGS
            </Text>
            <View
              style={[
                styles.settingsCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Pressable
                onPress={() => setShowLangPicker(!showLangPicker)}
                style={styles.settingRow}
              >
                <Feather name="globe" size={18} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Learning language
                </Text>
                <View style={styles.settingRight}>
                  <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>
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
                <View style={[styles.langPicker, { borderTopColor: colors.border }]}>
                  {LANG_OPTIONS.map((opt) => {
                    const active = profile?.learningLanguage === opt.key;
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
                            { color: active ? colors.primary : colors.text, fontWeight: active ? "700" : "400" },
                          ]}
                        >
                          {opt.label}
                        </Text>
                        {active && <Feather name="check" size={16} color={colors.primary} />}
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

              <Pressable style={styles.settingRow}>
                <Feather name="bell" size={18} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Daily reminders</Text>
                <View style={styles.settingRight}>
                  <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>9:00 PM</Text>
                </View>
              </Pressable>

              <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

              <Pressable style={styles.settingRow}>
                <Feather name="flag" size={18} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Report a wrong word</Text>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>

              <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

              <Pressable style={styles.settingRow}>
                <Feather name="star" size={18} color={colors.gold} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Go Premium</Text>
                <View style={[styles.premiumBadge, { backgroundColor: colors.goldBg }]}>
                  <Text style={[styles.premiumText, { color: colors.gold }]}>$4.99/mo</Text>
                </View>
              </Pressable>
            </View>
          </View>

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
  profileHeader: { padding: 24, paddingBottom: 28, alignItems: "center", gap: 6 },
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
  avatarText: { fontSize: 28, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  profileRole: { fontSize: 13, color: "#FFFFFFAA", fontFamily: "Inter_400Regular", marginBottom: 12 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF18",
    borderRadius: 16,
    padding: 12,
    width: "100%",
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  statLabel: {
    fontSize: 10,
    color: "#FFFFFF80",
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 8, width: "100%", marginTop: 8 },
  levelText: { fontSize: 11, color: "#FFFFFFAA", fontFamily: "Inter_600SemiBold", fontWeight: "600" },
  levelBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  levelFill: { height: "100%", backgroundColor: "#F5C842", borderRadius: 3 },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  whatsappBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1B6B3A",
    fontFamily: "Inter_600SemiBold",
  },
  body: { padding: 20 },
  section: { marginBottom: 28 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "Inter_700Bold",
  },
  addChildBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addChildBtnText: { fontSize: 12, fontWeight: "600", color: "#fff", fontFamily: "Inter_600SemiBold" },
  addChildForm: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  formInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  avatarPicker: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  avatarOption: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 22 },
  formError: { fontSize: 12, fontFamily: "Inter_400Regular" },
  formSaveBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  formSaveBtnText: { fontSize: 15, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  childCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 10,
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  childAvatarEmoji: { fontSize: 22 },
  childName: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  childGrade: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  skillsRow: { gap: 4 },
  skillItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  skillLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", width: 14 },
  skillBar: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  skillFill: { height: "100%", borderRadius: 3 },
  skillPct: { fontSize: 10, fontFamily: "Inter_500Medium", width: 28 },
  childRight: { alignItems: "center", gap: 8 },
  childStats: { alignItems: "center", gap: 2 },
  childStreak: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  removeChildBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChildren: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  emptyChildrenText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: {
    width: "30%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  badgeLabel: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", textAlign: "center" },
  settingsCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
  settingDivider: { height: 1, marginLeft: 48 },
  langPicker: { borderTopWidth: 1, paddingVertical: 4 },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 48,
    paddingVertical: 10,
  },
  langOptionText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  premiumBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  premiumText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  footer: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
  },
  langPickerRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 },
  langPickerBtn: {
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  langPickerBtnText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});

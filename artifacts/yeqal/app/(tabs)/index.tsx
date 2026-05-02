import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { useAudio } from "@/hooks/useAudio";
import { ALL_WORDS, ALL_SUBJECTS } from "@/data/allWords";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;
const WEB_BOTTOM = Platform.OS === "web" ? 34 : 0;
const TAB_BAR = Platform.OS === "web" ? 84 : 60;

const QUICK_ACTIONS = [
  { icon: "mic" as const, label: "Practice\nSpeaking", route: "/speak" as const, bg: "#1B6B3A", fg: "#FFFFFF" },
  { icon: "book-open" as const, label: "Homework\nHelper", route: "/homework" as const, bg: "#D4A017", fg: "#1C1C28" },
  { icon: "refresh-cw" as const, label: "Live\nTranslate", route: "/translate" as const, bg: "#1A6B9A", fg: "#FFFFFF" },
  { icon: "trending-up" as const, label: "My\nProgress", route: "/profile" as const, bg: "#6B2D9A", fg: "#FFFFFF" },
];

const WORD_OF_DAY = ALL_WORDS[new Date().getDate() % ALL_WORDS.length];

export default function HomeScreen() {
  const colors = useColors();
  const { profile, activeChild, activeChildId, setActiveChildId } = useApp();
  const insets = useSafeAreaInsets();
  const { speak, playingKey } = useAudio();

  const wordOfDay = useMemo(() => WORD_OF_DAY, []);

  const dailyGoal = profile?.dailyGoal ?? 10;
  const dailyDone = Math.min(profile?.dailyWordsToday ?? 0, dailyGoal);
  const dailyProgress = dailyGoal > 0 ? dailyDone / dailyGoal : 0;
  const dailyComplete = dailyDone >= dailyGoal;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleQuickAction = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const handleShareStreak = async () => {
    const streak = profile?.streak ?? 0;
    const name = profile?.name ?? "I";
    try {
      await Share.share({
        message: `🔥 ${name} is on a ${streak}-day learning streak with Yeqal ያቃል!\n\nLearning Amharic, Afaan Oromo & English — the Ethiopian trilingual app.\n\nDownload free: yeqal.app`,
        title: `${streak}-day streak on Yeqal!`,
      });
    } catch { /* user cancelled */ }
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
        {/* Header */}
        <LinearGradient colors={["#1B6B3A", "#134F2B"]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{profile?.name ?? "Welcome"}</Text>
            </View>
            <View style={styles.headerRight}>
              <Pressable onPress={handleShareStreak} style={styles.streakBadge}>
                <Feather name="zap" size={14} color="#F5C842" />
                <Text style={styles.streakText}>{profile?.streak ?? 0}</Text>
                <Feather name="share-2" size={11} color="#FFFFFF80" />
              </Pressable>
              <View style={[styles.streakBadge, { backgroundColor: "#FFFFFF18" }]}>
                <Feather name="star" size={14} color="#F5C842" />
                <Text style={styles.streakText}>{profile?.xp ?? 0}</Text>
              </View>
            </View>
          </View>

          {/* Daily goal progress */}
          <View style={styles.dailyGoalRow}>
            <View style={styles.dailyGoalLabels}>
              <Text style={styles.dailyGoalLabel}>
                {dailyComplete ? "✅ Daily goal complete!" : `Daily goal: ${dailyDone}/${dailyGoal} words`}
              </Text>
              <Pressable onPress={() => router.push("/search")}>
                <Text style={styles.dailyGoalLearn}>Learn words →</Text>
              </Pressable>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: "#FFFFFF22" }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(dailyProgress * 100)}%` as any,
                    backgroundColor: dailyComplete ? "#F5C842" : "#FFFFFF",
                  },
                ]}
              />
            </View>
          </View>

          {/* Search bar */}
          <Pressable
            onPress={() => router.push("/search")}
            style={({ pressed }) => [styles.searchBar, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Feather name="search" size={18} color="#888899" />
            <Text style={styles.searchPlaceholder}>
              Search {ALL_WORDS.length.toLocaleString()} words · Amharic · Oromo · English...
            </Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.body}>
          {/* Multi-child switcher */}
          {profile?.role === "parent" && (profile?.children?.length ?? 0) > 0 && (
            <View style={styles.childSwitcherSection}>
              {profile.children.length === 1 ? (
                <Pressable
                  onPress={() => router.push("/profile")}
                  style={({ pressed }) => [
                    styles.alertCard,
                    { backgroundColor: colors.tealBg, borderColor: colors.teal + "40", opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <View style={[styles.alertIcon, { backgroundColor: colors.teal + "22" }]}>
                    <Text style={styles.childAvatarSingle}>{profile.children[0]?.avatar ?? "👦"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.alertTitle, { color: colors.teal }]}>
                      {profile.children[0]?.name} · Grade {profile.children[0]?.gradeLevel}
                    </Text>
                    <Text style={[styles.alertSub, { color: colors.mutedForeground }]}>
                      🔥 {profile.children[0]?.streak ?? 0} day streak · ⭐ {profile.children[0]?.xp ?? 0} XP
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.teal} />
                </Pressable>
              ) : (
                <View>
                  <Text style={[styles.switcherLabel, { color: colors.mutedForeground }]}>HELPING</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.childScroll}
                    contentContainerStyle={{ gap: 10 }}
                  >
                    {profile.children.map((child) => {
                      const isActive = child.id === (activeChildId ?? profile.children[0]?.id);
                      return (
                        <Pressable
                          key={child.id}
                          onPress={() => { setActiveChildId(child.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                          style={[
                            styles.childChip,
                            { backgroundColor: isActive ? colors.primary : colors.card, borderColor: isActive ? colors.primary : colors.border },
                          ]}
                        >
                          <Text style={styles.childChipAvatar}>{child.avatar}</Text>
                          <View>
                            <Text style={[styles.childChipName, { color: isActive ? "#fff" : colors.text }]}>{child.name}</Text>
                            <Text style={[styles.childChipGrade, { color: isActive ? "#FFFFFFAA" : colors.mutedForeground }]}>
                              Grade {child.gradeLevel}
                            </Text>
                          </View>
                          {isActive && <View style={styles.activeIndicator} />}
                        </Pressable>
                      );
                    })}
                    <Pressable
                      onPress={() => router.push("/profile")}
                      style={[styles.addChildChip, { backgroundColor: colors.muted, borderColor: colors.border }]}
                    >
                      <Feather name="plus" size={18} color={colors.mutedForeground} />
                    </Pressable>
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Word of the Day */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>WORD OF THE DAY</Text>
            <Pressable
              onPress={() => router.push(`/word/${wordOfDay.id}`)}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <LinearGradient colors={["#1B6B3A", "#0F4022"]} style={styles.wotdCard}>
                <View style={styles.wotdTop}>
                  <View>
                    <Text style={styles.wotdAmharic}>{wordOfDay.amharic}</Text>
                    <Text style={styles.wotdRoman}>{wordOfDay.romanization}</Text>
                  </View>
                  <View style={[styles.posBadge, { backgroundColor: "#FFFFFF22" }]}>
                    <Text style={styles.posText}>{wordOfDay.pos}</Text>
                  </View>
                </View>
                <View style={styles.wotdLangs}>
                  <View style={styles.wotdLangItem}>
                    <Text style={styles.wotdLangLabel}>Oromo</Text>
                    <Text style={styles.wotdLangWord}>{wordOfDay.oromo}</Text>
                  </View>
                  <View style={[styles.wotdDivider, { backgroundColor: "#FFFFFF30" }]} />
                  <View style={styles.wotdLangItem}>
                    <Text style={styles.wotdLangLabel}>English</Text>
                    <Text style={styles.wotdLangWord}>{wordOfDay.english}</Text>
                  </View>
                </View>
                <View style={styles.wotdFooter}>
                  <Text style={styles.wotdExample} numberOfLines={1}>{wordOfDay.exampleEnglish}</Text>
                  <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                    <Pressable
                      onPress={async (e) => {
                        e.stopPropagation?.();
                        try {
                          await Share.share({
                            message: `📖 Word of the Day from Yeqal ያቃል\n\n🇪🇹 ${wordOfDay.amharic} (${wordOfDay.romanization})\n🌿 ${wordOfDay.oromo}\n🌍 ${wordOfDay.english}\n\nLearn Ethiopian languages free — yeqal.app`,
                          });
                        } catch { /* cancelled */ }
                      }}
                      hitSlop={12}
                    >
                      <Feather name="share-2" size={18} color="#FFFFFF60" />
                    </Pressable>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        speak(wordOfDay.amharic, "am", `wotd-${wordOfDay.id}`);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      hitSlop={12}
                    >
                      <Feather
                        name={playingKey === `wotd-${wordOfDay.id}` ? "volume-2" : "volume-1"}
                        size={22}
                        color={playingKey === `wotd-${wordOfDay.id}` ? "#FFFFFF" : "#FFFFFF80"}
                      />
                    </Pressable>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>QUICK ACTIONS</Text>
            <View style={styles.actionsGrid}>
              {QUICK_ACTIONS.map((action) => (
                <Pressable
                  key={action.label}
                  onPress={() => handleQuickAction(action.route)}
                  style={({ pressed }) => [
                    styles.actionCard,
                    { backgroundColor: action.bg, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                  ]}
                >
                  <Feather name={action.icon} size={26} color={action.fg} />
                  <Text style={[styles.actionLabel, { color: action.fg }]}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Browse by category */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>BROWSE BY TOPIC</Text>
              <Pressable onPress={() => router.push("/search")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </Pressable>
            </View>
            <View style={styles.categoryGrid}>
              {ALL_SUBJECTS.slice(1, 9).map((sub) => (
                <Pressable
                  key={sub.key}
                  onPress={() => router.push("/search")}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={styles.categoryEmoji}>{sub.emoji}</Text>
                  <Text style={[styles.categoryLabel, { color: colors.text }]}>{sub.label}</Text>
                  <Text style={[styles.categoryCount, { color: colors.mutedForeground }]}>
                    {ALL_WORDS.filter(w => w.subject === sub.key).length} words
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28, gap: 12 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { color: "#FFFFFFAA", fontSize: 13, fontFamily: "Inter_400Regular" },
  userName: { color: "#FFFFFF", fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  headerRight: { flexDirection: "row", gap: 8 },
  streakBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FFFFFF22", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
  },
  streakText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  dailyGoalRow: { gap: 6 },
  dailyGoalLabels: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dailyGoalLabel: { color: "#FFFFFFCC", fontSize: 12, fontFamily: "Inter_500Medium" },
  dailyGoalLearn: { color: "#FFFFFF80", fontSize: 11, fontFamily: "Inter_400Regular" },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
  },
  searchPlaceholder: { color: "#888899", fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  body: { padding: 20 },
  alertCard: {
    flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1,
    padding: 14, gap: 12, marginBottom: 20,
  },
  alertIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  alertTitle: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 2 },
  alertSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, fontFamily: "Inter_700Bold", marginBottom: 12 },
  seeAll: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  wotdCard: { borderRadius: 18, padding: 20, gap: 16 },
  wotdTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  wotdAmharic: { color: "#FFFFFF", fontSize: 36, fontWeight: "700", lineHeight: 44 },
  wotdRoman: { color: "#FFFFFFAA", fontSize: 13, fontStyle: "italic", fontFamily: "Inter_400Regular" },
  posBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  posText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700", textTransform: "capitalize", fontFamily: "Inter_700Bold" },
  wotdLangs: { flexDirection: "row", alignItems: "center", gap: 16 },
  wotdLangItem: { flex: 1 },
  wotdLangLabel: { color: "#FFFFFF80", fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, fontFamily: "Inter_600SemiBold" },
  wotdLangWord: { color: "#FFFFFF", fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  wotdDivider: { width: 1, height: 32 },
  wotdFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#FFFFFF20" },
  wotdExample: { color: "#FFFFFFAA", fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, marginRight: 8 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionCard: { width: "47%", borderRadius: 16, padding: 18, gap: 12, minHeight: 100, justifyContent: "space-between" },
  actionLabel: { fontSize: 13, fontWeight: "700", lineHeight: 18, fontFamily: "Inter_700Bold" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryCard: {
    width: "47%", borderRadius: 14, borderWidth: 1, padding: 14,
    alignItems: "center", gap: 4,
  },
  categoryEmoji: { fontSize: 28 },
  categoryLabel: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  categoryCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  childSwitcherSection: { marginBottom: 20 },
  switcherLabel: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: 1, marginBottom: 10 },
  childScroll: { overflow: "visible" as any },
  childChip: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 10 },
  childChipAvatar: { fontSize: 22 },
  childChipName: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  childChipGrade: { fontSize: 11, fontFamily: "Inter_400Regular" },
  activeIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF", marginLeft: 4 },
  addChildChip: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  childAvatarSingle: { fontSize: 22 },
});

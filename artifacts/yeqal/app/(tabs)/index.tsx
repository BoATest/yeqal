import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo } from "react";
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
import { WORDS } from "@/data/words";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;
const WEB_BOTTOM = Platform.OS === "web" ? 34 : 0;
const TAB_BAR = Platform.OS === "web" ? 84 : 60;

const QUICK_ACTIONS = [
  {
    icon: "mic" as const,
    label: "Practice\nSpeaking",
    route: "/speak" as const,
    bg: "#1B6B3A",
    fg: "#FFFFFF",
  },
  {
    icon: "book-open" as const,
    label: "Homework\nHelper",
    route: "/homework" as const,
    bg: "#D4A017",
    fg: "#1C1C28",
  },
  {
    icon: "layers" as const,
    label: "Flashcard\nQuiz",
    route: "/flashcard" as const,
    bg: "#1A6B9A",
    fg: "#FFFFFF",
  },
  {
    icon: "trending-up" as const,
    label: "My\nProgress",
    route: "/profile" as const,
    bg: "#6B2D9A",
    fg: "#FFFFFF",
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const { profile } = useApp();
  const insets = useSafeAreaInsets();

  const wordOfDay = useMemo(() => WORDS[new Date().getDate() % WORDS.length], []);

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
        <LinearGradient
          colors={["#1B6B3A", "#134F2B"]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>
                {profile?.name ?? "Welcome"}
              </Text>
            </View>
            <View style={styles.headerRight}>
              {/* Streak */}
              <View style={styles.streakBadge}>
                <Feather name="zap" size={14} color="#F5C842" />
                <Text style={styles.streakText}>{profile?.streak ?? 0}</Text>
              </View>
              {/* XP */}
              <View style={[styles.streakBadge, { backgroundColor: "#FFFFFF18" }]}>
                <Feather name="star" size={14} color="#F5C842" />
                <Text style={styles.streakText}>{profile?.xp ?? 0}</Text>
              </View>
            </View>
          </View>

          {/* Search bar */}
          <Pressable
            onPress={() => router.push("/search")}
            style={({ pressed }) => [
              styles.searchBar,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="search" size={18} color="#888899" />
            <Text style={styles.searchPlaceholder}>
              Search in Amharic · Oromo · English...
            </Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.body}>
          {/* Parent alert card */}
          {profile?.role === "parent" && (profile?.children?.length ?? 0) > 0 && (
            <Pressable
              onPress={() => router.push("/profile")}
              style={({ pressed }) => [
                styles.alertCard,
                {
                  backgroundColor: colors.tealBg,
                  borderColor: colors.teal + "40",
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.alertIcon,
                  { backgroundColor: colors.teal + "22" },
                ]}
              >
                <Feather name="users" size={18} color={colors.teal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: colors.teal }]}>
                  {profile.children[0]?.name} practiced today
                </Text>
                <Text
                  style={[
                    styles.alertSub,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Streak: {profile.children[0]?.streak ?? 0} days · XP:{" "}
                  {profile.children[0]?.xp ?? 0}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.teal} />
            </Pressable>
          )}

          {/* Word of the Day */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              WORD OF THE DAY
            </Text>
            <Pressable
              onPress={() => router.push(`/word/${wordOfDay.id}`)}
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <LinearGradient
                colors={["#1B6B3A", "#0F4022"]}
                style={styles.wotdCard}
              >
                <View style={styles.wotdTop}>
                  <View>
                    <Text style={styles.wotdAmharic}>{wordOfDay.amharic}</Text>
                    <Text style={styles.wotdRoman}>
                      {wordOfDay.romanization}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.posBadge,
                      { backgroundColor: "#FFFFFF22" },
                    ]}
                  >
                    <Text style={styles.posText}>{wordOfDay.pos}</Text>
                  </View>
                </View>
                <View style={styles.wotdLangs}>
                  <View style={styles.wotdLangItem}>
                    <Text style={styles.wotdLangLabel}>Oromo</Text>
                    <Text style={styles.wotdLangWord}>{wordOfDay.oromo}</Text>
                  </View>
                  <View
                    style={[
                      styles.wotdDivider,
                      { backgroundColor: "#FFFFFF30" },
                    ]}
                  />
                  <View style={styles.wotdLangItem}>
                    <Text style={styles.wotdLangLabel}>English</Text>
                    <Text style={styles.wotdLangWord}>{wordOfDay.english}</Text>
                  </View>
                </View>
                <View style={styles.wotdFooter}>
                  <Text style={styles.wotdExample} numberOfLines={1}>
                    {wordOfDay.exampleEnglish}
                  </Text>
                  <Feather name="volume-2" size={18} color="#FFFFFF80" />
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              QUICK ACTIONS
            </Text>
            <View style={styles.actionsGrid}>
              {QUICK_ACTIONS.map((action) => (
                <Pressable
                  key={action.label}
                  onPress={() => handleQuickAction(action.route)}
                  style={({ pressed }) => [
                    styles.actionCard,
                    {
                      backgroundColor: action.bg,
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    },
                  ]}
                >
                  <Feather name={action.icon} size={26} color={action.fg} />
                  <Text style={[styles.actionLabel, { color: action.fg }]}>
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Recent words */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                RECENTLY ADDED
              </Text>
              <Pressable onPress={() => router.push("/search")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  See all
                </Text>
              </Pressable>
            </View>
            {WORDS.slice(0, 4).map((word) => (
              <Pressable
                key={word.id}
                onPress={() => router.push(`/word/${word.id}`)}
                style={({ pressed }) => [
                  styles.miniCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.miniAmharic, { color: colors.primary }]}
                  >
                    {word.amharic}
                  </Text>
                  <Text
                    style={[
                      styles.miniEnglish,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {word.english} · {word.oromo}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={colors.mutedForeground}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: "#FFFFFFAA",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  headerRight: { flexDirection: "row", gap: 8 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF22",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  searchPlaceholder: {
    color: "#888899",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  body: { padding: 20 },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  alertSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  // Word of the Day
  wotdCard: { borderRadius: 18, padding: 20, gap: 16 },
  wotdTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  wotdAmharic: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 44,
  },
  wotdRoman: {
    color: "#FFFFFFAA",
    fontSize: 13,
    fontStyle: "italic",
    fontFamily: "Inter_400Regular",
  },
  posBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  posText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
    fontFamily: "Inter_700Bold",
  },
  wotdLangs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  wotdLangItem: { flex: 1 },
  wotdLangLabel: {
    color: "#FFFFFF80",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: "Inter_600SemiBold",
  },
  wotdLangWord: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  wotdDivider: { width: 1, height: 32 },
  wotdFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#FFFFFF20",
  },
  wotdExample: {
    color: "#FFFFFFAA",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
    marginRight: 8,
  },
  // Quick actions
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "47%",
    borderRadius: 16,
    padding: 18,
    gap: 12,
    minHeight: 100,
    justifyContent: "space-between",
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    fontFamily: "Inter_700Bold",
  },
  // Mini card
  miniCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  miniAmharic: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  miniEnglish: { fontSize: 13, fontFamily: "Inter_400Regular" },
});

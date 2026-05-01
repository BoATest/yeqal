import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
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
import { getWordById, WORDS } from "@/data/words";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;

type DefTab = "amharic" | "oromo" | "english";

export default function WordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { toggleFavorite, isFavorite, markLearned, addXP } = useApp();
  const insets = useSafeAreaInsets();

  const [defTab, setDefTab] = useState<DefTab>("english");
  const [playingLang, setPlayingLang] = useState<string | null>(null);

  const word = getWordById(id ?? "");

  if (!word) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.text }]}>
            Word not found
          </Text>
        </View>
      </View>
    );
  }

  const fav = isFavorite(word.id);

  const handleFav = () => {
    toggleFavorite(word.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePractice = () => {
    markLearned(word.id);
    addXP(10);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push("/speak");
  };

  const simulateAudio = (lang: string) => {
    setPlayingLang(lang);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setPlayingLang(null), 1500);
  };

  // Related words (same subject, different id)
  const related = WORDS.filter(
    (w) => w.subject === word.subject && w.id !== word.id
  ).slice(0, 3);

  const defText =
    defTab === "english"
      ? word.definitionEnglish
      : defTab === "amharic"
      ? word.definitionAmharic
      : word.definitionOromo;

  const exampleText =
    defTab === "english"
      ? word.exampleEnglish
      : defTab === "amharic"
      ? word.exampleAmharic
      : word.exampleOromo;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header gradient */}
      <LinearGradient
        colors={["#1B6B3A", "#0F4022"]}
        style={[
          styles.header,
          { paddingTop: insets.top + WEB_TOP + 12 },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backCircle}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={handleFav} style={styles.favCircle}>
            <Feather
              name="star"
              size={20}
              color={fav ? "#F5C842" : "#FFFFFF80"}
            />
          </Pressable>
        </View>

        {/* Primary word */}
        <Text style={styles.primaryWord}>{word.amharic}</Text>
        {word.romanization && (
          <Text style={styles.romanization}>/ {word.romanization} /</Text>
        )}

        {/* Badges */}
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: "#FFFFFF22" }]}>
            <Text style={styles.badgeText}>{word.pos}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#FFFFFF22" }]}>
            <Text style={styles.badgeText}>Grade {word.gradeLevel}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#FFFFFF22" }]}>
            <Text style={styles.badgeText}>{word.subject}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        {/* All 3 languages with audio */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>
            PRONUNCIATION
          </Text>
          {[
            { lang: "አማርኛ", word: word.amharic, key: "am" },
            { lang: "Oromo", word: word.oromo, key: "om" },
            { lang: "English", word: word.english, key: "en" },
          ].map((item, i) => (
            <View key={item.key}>
              {i > 0 && (
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: colors.border },
                  ]}
                />
              )}
              <View style={styles.langRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.langLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {item.lang}
                  </Text>
                  <Text style={[styles.langWord, { color: colors.text }]}>
                    {item.word}
                  </Text>
                </View>
                <Pressable
                  onPress={() => simulateAudio(item.key)}
                  style={[
                    styles.audioBtn,
                    {
                      backgroundColor:
                        playingLang === item.key
                          ? colors.primary
                          : colors.greenBg,
                    },
                  ]}
                >
                  <Feather
                    name={
                      playingLang === item.key ? "volume-2" : "play"
                    }
                    size={18}
                    color={
                      playingLang === item.key ? "#fff" : colors.primary
                    }
                  />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Definition tabs */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>
            DEFINITION
          </Text>
          <View style={styles.tabRow}>
            {(["english", "amharic", "oromo"] as DefTab[]).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setDefTab(tab)}
                style={[
                  styles.tab,
                  {
                    backgroundColor:
                      defTab === tab ? colors.primary : colors.muted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: defTab === tab ? "#fff" : colors.mutedForeground,
                    },
                  ]}
                >
                  {tab === "amharic" ? "አማርኛ" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.defText, { color: colors.text }]}>
            {defText ?? `The ${defTab} definition for "${word.english}" — see other tabs.`}
          </Text>
        </View>

        {/* Example sentence */}
        {(word.exampleAmharic || word.exampleEnglish || word.exampleOromo) && (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.cardTitle, { color: colors.mutedForeground }]}
            >
              EXAMPLE SENTENCE
            </Text>
            <View
              style={[
                styles.exampleBox,
                { backgroundColor: colors.greenBg, borderColor: colors.green + "30" },
              ]}
            >
              <Text style={[styles.exampleText, { color: colors.primary }]}>
                {exampleText ?? word.exampleEnglish}
              </Text>
            </View>
            <View style={styles.tabRow}>
              {(["english", "amharic", "oromo"] as DefTab[]).map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setDefTab(tab)}
                  style={[
                    styles.tab,
                    {
                      backgroundColor:
                        defTab === tab ? colors.primary : colors.muted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color:
                          defTab === tab ? "#fff" : colors.mutedForeground,
                      },
                    ]}
                  >
                    {tab === "amharic" ? "አማርኛ" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Related words */}
        {related.length > 0 && (
          <View style={styles.related}>
            <Text
              style={[styles.cardTitle, { color: colors.mutedForeground }]}
            >
              RELATED WORDS
            </Text>
            <View style={styles.relatedRow}>
              {related.map((w) => (
                <Pressable
                  key={w.id}
                  onPress={() => router.push(`/word/${w.id}`)}
                  style={[
                    styles.relatedCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.relatedAmharic, { color: colors.primary }]}
                  >
                    {w.amharic}
                  </Text>
                  <Text
                    style={[
                      styles.relatedEnglish,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {w.english}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            onPress={handlePractice}
            style={[styles.practiceBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="mic" size={18} color="#fff" />
            <Text style={styles.practiceBtnText}>Practice this word</Text>
          </Pressable>
          <Pressable
            style={[
              styles.reportBtn,
              { borderColor: colors.border },
            ]}
          >
            <Feather name="flag" size={16} color={colors.mutedForeground} />
            <Text
              style={[styles.reportBtnText, { color: colors.mutedForeground }]}
            >
              Report an issue
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF22",
    alignItems: "center",
    justifyContent: "center",
  },
  favCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF22",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: { padding: 16 },
  primaryWord: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 58,
  },
  romanization: {
    fontSize: 15,
    color: "#FFFFFFAA",
    fontStyle: "italic",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    marginBottom: 16,
  },
  badgesRow: { flexDirection: "row", gap: 8 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    fontFamily: "Inter_600SemiBold",
  },
  body: { padding: 16, gap: 12, paddingBottom: 48 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "Inter_700Bold",
  },
  divider: { height: 1, marginVertical: 4 },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  langLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  langWord: { fontSize: 20, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  audioBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  tabRow: { flexDirection: "row", gap: 8 },
  tab: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  defText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  exampleBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  exampleText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
    lineHeight: 24,
  },
  related: { gap: 12 },
  relatedRow: { flexDirection: "row", gap: 10 },
  relatedCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  relatedAmharic: { fontSize: 18, fontWeight: "700" },
  relatedEnglish: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actions: { gap: 10, marginTop: 4 },
  practiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    height: 52,
  },
  practiceBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    height: 44,
    borderWidth: 1,
  },
  reportBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
});

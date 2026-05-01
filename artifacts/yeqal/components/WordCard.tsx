import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { Word } from "@/data/types";

const POS_LABELS: Record<string, string> = {
  noun: "N",
  verb: "V",
  adjective: "Adj",
  adverb: "Adv",
  phrase: "Phr",
};

const SUBJECT_COLORS: Record<string, string> = {
  family: "#C05A1A",
  food: "#0E7490",
  school: "#1A6B9A",
  nature: "#1B6B3A",
  animals: "#6B2D9A",
  greetings: "#D4A017",
  numbers: "#C0392B",
  general: "#888899",
  verbs: "#555577",
};

interface WordCardProps {
  word: Word;
  isFavorite?: boolean;
  compact?: boolean;
}

export default function WordCard({
  word,
  isFavorite = false,
  compact = false,
}: WordCardProps) {
  const colors = useColors();

  const subjectColor = SUBJECT_COLORS[word.subject] ?? colors.mutedForeground;

  return (
    <Pressable
      onPress={() => router.push(`/word/${word.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* Main word display */}
      <View style={styles.row}>
        <View style={styles.wordBlock}>
          <Text style={[styles.primaryWord, { color: colors.primary }]}>
            {word.amharic}
          </Text>
          <Text style={[styles.romanization, { color: colors.mutedForeground }]}>
            {word.romanization ?? ""}
          </Text>
        </View>
        <View style={styles.badges}>
          <View
            style={[
              styles.posBadge,
              { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" },
            ]}
          >
            <Text style={[styles.posText, { color: colors.primary }]}>
              {POS_LABELS[word.pos] ?? word.pos}
            </Text>
          </View>
          {isFavorite && (
            <Feather name="star" size={14} color={colors.gold} />
          )}
        </View>
      </View>

      {/* Three languages row */}
      <View style={styles.langRow}>
        <View style={styles.langItem}>
          <Text style={[styles.langLabel, { color: colors.mutedForeground }]}>
            Oromo
          </Text>
          <Text style={[styles.langWord, { color: colors.text }]}>
            {word.oromo}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.langItem}>
          <Text style={[styles.langLabel, { color: colors.mutedForeground }]}>
            English
          </Text>
          <Text style={[styles.langWord, { color: colors.text }]}>
            {word.english}
          </Text>
        </View>
        <Feather
          name="chevron-right"
          size={16}
          color={colors.mutedForeground}
          style={{ marginLeft: "auto" }}
        />
      </View>

      {/* Grade and subject tags */}
      {!compact && (
        <View style={styles.tagRow}>
          <View
            style={[
              styles.tag,
              { backgroundColor: subjectColor + "18", borderColor: subjectColor + "30" },
            ]}
          >
            <Text style={[styles.tagText, { color: subjectColor }]}>
              {word.subject}
            </Text>
          </View>
          <View
            style={[
              styles.tag,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.tagText, { color: colors.mutedForeground }]}>
              Grade {word.gradeLevel}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  wordBlock: { flex: 1 },
  primaryWord: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  romanization: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: "italic",
    fontFamily: "Inter_400Regular",
  },
  badges: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  posBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  posText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2DAC820",
    gap: 12,
  },
  langItem: { flex: 1 },
  langLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: "Inter_600SemiBold",
  },
  langWord: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  divider: { width: 1, height: 28, marginTop: 4 },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 10 },
  tag: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
    fontFamily: "Inter_600SemiBold",
  },
});

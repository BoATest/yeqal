import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { WORDS } from "@/data/words";
import { Word } from "@/data/types";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;
const WEB_BOTTOM = Platform.OS === "web" ? 34 : 0;
const TAB_BAR = Platform.OS === "web" ? 84 : 60;

function findWordsInText(text: string): Word[] {
  const found: Word[] = [];
  const lower = text.toLowerCase();
  for (const word of WORDS) {
    if (
      lower.includes(word.english.toLowerCase()) ||
      text.includes(word.amharic) ||
      lower.includes(word.oromo.toLowerCase())
    ) {
      if (!found.find((w) => w.id === word.id)) {
        found.push(word);
      }
    }
  }
  return found.slice(0, 10);
}

export default function HomeworkScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Word[] | null>(null);
  const [savedWords, setSavedWords] = useState<string[]>([]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAnalyzing(true);
    setResults(null);
    await new Promise((r) => setTimeout(r, 1200));
    const found = findWordsInText(text);
    setResults(found);
    setIsAnalyzing(false);
  };

  const handleSave = (id: string) => {
    setSavedWords((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClear = () => {
    setText("");
    setResults(null);
    setSavedWords([]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + WEB_TOP + 16,
          paddingBottom: insets.bottom + WEB_BOTTOM + TAB_BAR + 24,
          paddingHorizontal: 20,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Feather name="book-open" size={24} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>
              Homework Helper
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Type or paste your homework — see every word explained
            </Text>
          </View>
        </View>

        {/* Input card */}
        <View
          style={[
            styles.inputCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={
              "Type your homework question here...\n\nExample: What is the meaning of ትምህርት ቤት?"
            }
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.text }]}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          {text.length > 0 && (
            <Pressable onPress={handleClear} style={styles.clearBtn}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Language detection hint */}
        {text.length > 2 && (
          <Text
            style={[styles.langHint, { color: colors.mutedForeground }]}
          >
            {/[\u1200-\u137F]/.test(text)
              ? "Detected: Amharic (Ge'ez script)"
              : /[a-zA-Z]/.test(text)
              ? "Detected: English / Oromo (Latin script)"
              : "Type in any language"}
          </Text>
        )}

        {/* Camera placeholder */}
        <View
          style={[
            styles.cameraCard,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <Feather name="camera" size={20} color={colors.mutedForeground} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.cameraTitle, { color: colors.text }]}>
              Photo homework
            </Text>
            <Text
              style={[styles.cameraDesc, { color: colors.mutedForeground }]}
            >
              Coming in v1.1 — photograph your textbook for instant help
            </Text>
          </View>
          <View
            style={[
              styles.comingSoon,
              { backgroundColor: colors.accentForeground + "18" },
            ]}
          >
            <Text style={[styles.comingSoonText, { color: colors.accent }]}>
              Soon
            </Text>
          </View>
        </View>

        {/* Analyze button */}
        <Pressable
          onPress={handleAnalyze}
          disabled={!text.trim() || isAnalyzing}
          style={({ pressed }) => [
            styles.analyzeBtn,
            {
              backgroundColor:
                !text.trim() || isAnalyzing
                  ? colors.muted
                  : colors.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Feather
              name="zap"
              size={20}
              color={!text.trim() ? colors.mutedForeground : "#fff"}
            />
          )}
          <Text
            style={[
              styles.analyzeBtnText,
              {
                color:
                  !text.trim() || isAnalyzing
                    ? colors.mutedForeground
                    : "#fff",
              },
            ]}
          >
            {isAnalyzing ? "Analyzing..." : "Explain this"}
          </Text>
        </Pressable>

        {/* Results */}
        {results !== null && (
          <View style={styles.results}>
            {results.length === 0 ? (
              <View
                style={[
                  styles.emptyResults,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Feather name="info" size={24} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No matching words found
                </Text>
                <Text
                  style={[
                    styles.emptyDesc,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Try using more specific words from your homework
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.resultsHeader}>
                  <Text style={[styles.resultsTitle, { color: colors.text }]}>
                    {results.length} word{results.length !== 1 ? "s" : ""} found
                  </Text>
                  <Pressable
                    onPress={() => router.push("/flashcard")}
                    style={[
                      styles.practiceAllBtn,
                      { backgroundColor: colors.greenBg, borderColor: colors.green + "40" },
                    ]}
                  >
                    <Feather name="layers" size={14} color={colors.primary} />
                    <Text
                      style={[styles.practiceAllText, { color: colors.primary }]}
                    >
                      Practice all
                    </Text>
                  </Pressable>
                </View>

                {results.map((word) => {
                  const saved = savedWords.includes(word.id);
                  return (
                    <Pressable
                      key={word.id}
                      onPress={() => router.push(`/word/${word.id}`)}
                      style={[
                        styles.resultCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.resultAmharic,
                            { color: colors.primary },
                          ]}
                        >
                          {word.amharic}
                        </Text>
                        <Text
                          style={[
                            styles.resultLangs,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {word.oromo} · {word.english}
                        </Text>
                        {word.definitionEnglish && (
                          <Text
                            style={[
                              styles.resultDef,
                              { color: colors.text },
                            ]}
                            numberOfLines={2}
                          >
                            {word.definitionEnglish}
                          </Text>
                        )}
                      </View>
                      <Pressable
                        onPress={() => handleSave(word.id)}
                        style={[
                          styles.saveBtn,
                          {
                            backgroundColor: saved
                              ? colors.goldBg
                              : colors.muted,
                          },
                        ]}
                      >
                        <Feather
                          name={saved ? "star" : "star"}
                          size={16}
                          color={saved ? colors.gold : colors.mutedForeground}
                        />
                      </Pressable>
                    </Pressable>
                  );
                })}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
    lineHeight: 18,
  },
  inputCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    position: "relative",
  },
  input: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    minHeight: 120,
  },
  clearBtn: { position: "absolute", top: 12, right: 12 },
  langHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
    paddingLeft: 4,
  },
  cameraCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  cameraTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  cameraDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    lineHeight: 16,
  },
  comingSoon: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    height: 52,
    marginBottom: 24,
  },
  analyzeBtnText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  results: { gap: 0 },
  emptyResults: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    maxWidth: 240,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  practiceAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  practiceAllText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  resultAmharic: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
  },
  resultLangs: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    marginBottom: 6,
  },
  resultDef: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
});

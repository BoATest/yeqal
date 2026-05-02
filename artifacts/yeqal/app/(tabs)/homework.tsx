import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { WORDS } from "@/data/words";
import { HomeworkSession, Word } from "@/data/types";
import { CameraOverlay } from "@/components/CameraOverlay";
import { findTopicForQuestion, getSubjectLabel } from "@/data/curriculum";
import type { CurriculumTopic } from "@/data/curriculum";

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
      lower.includes(word.oromo.toLowerCase()) ||
      (word.romanization && lower.includes(word.romanization.toLowerCase()))
    ) {
      if (!found.find((w) => w.id === word.id)) {
        found.push(word);
      }
    }
  }
  return found.slice(0, 12);
}

export default function HomeworkScreen() {
  const colors = useColors();
  const { saveHomeworkSession, activeChild } = useApp();
  const insets = useSafeAreaInsets();

  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<Word[] | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [curriculumTopic, setCurriculumTopic] = useState<CurriculumTopic | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAnalyzing(true);
    setResults(null);
    setCurriculumTopic(null);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1400));
      const found = findWordsInText(text);
      setResults(found);
      // Detect curriculum topic based on active child
      if (activeChild) {
        const topic = findTopicForQuestion(
          text,
          activeChild.gradeLevel,
          activeChild.learningLanguage
        );
        setCurriculumTopic(topic);
      }
      if (found.length > 0) {
        const session: HomeworkSession = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          inputText: text.slice(0, 200),
          wordIds: found.map((w) => w.id),
        };
        await saveHomeworkSession(session);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleSave = (id: string) => {
    setSavedWords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePracticeAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/flashcard");
  };

  const handleClear = () => {
    setText("");
    setResults(null);
    setSavedWords(new Set());
    setError(null);
    setCurriculumTopic(null);
  };

  const detectedScript = /[\u1200-\u137F]/.test(text)
    ? "Amharic (Ge'ez)"
    : /[a-zA-Z]/.test(text)
    ? "English / Oromo (Latin)"
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + WEB_TOP + 16,
          paddingBottom: insets.bottom + WEB_BOTTOM + TAB_BAR + 32,
          paddingHorizontal: 20,
        }}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <Feather name="book-open" size={24} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>
              Homework Helper
            </Text>
            {activeChild ? (
              <Text style={[styles.activeChildBadge, { color: colors.primary }]}>
                {activeChild.avatar} Helping {activeChild.name} · Grade {activeChild.gradeLevel} ·{" "}
                {activeChild.learningLanguage === "amharic"
                  ? "አማርኛ"
                  : activeChild.learningLanguage === "oromo"
                  ? "Oromo"
                  : "English"}
              </Text>
            ) : (
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                Type or paste your homework text — see every word explained
              </Text>
            )}
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
              "Type or paste homework here...\n\nExample: ቤት ምንድን ነው?\nWhat is injera?"
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

        {/* Language detection */}
        {text.length > 2 && detectedScript && (
          <View style={styles.langHintRow}>
            <Feather name="globe" size={12} color={colors.mutedForeground} />
            <Text style={[styles.langHint, { color: colors.mutedForeground }]}>
              Detected: {detectedScript}
            </Text>
          </View>
        )}

        {/* Analyze button */}
        <Pressable
          onPress={handleAnalyze}
          disabled={!text.trim() || isAnalyzing}
          style={({ pressed }) => [
            styles.analyzeBtn,
            {
              backgroundColor:
                !text.trim() || isAnalyzing ? colors.muted : colors.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={[styles.analyzeBtnText, { color: "#fff" }]}>
                ያቃላል... Explaining...
              </Text>
            </>
          ) : (
            <>
              <Feather
                name="zap"
                size={20}
                color={!text.trim() ? colors.mutedForeground : "#fff"}
              />
              <Text
                style={[
                  styles.analyzeBtnText,
                  {
                    color: !text.trim() ? colors.mutedForeground : "#fff",
                  },
                ]}
              >
                Explain this
              </Text>
            </>
          )}
        </Pressable>

        {/* Error state */}
        {error && (
          <View
            style={[
              styles.errorCard,
              { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40" },
            ]}
          >
            <Feather name="alert-circle" size={16} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {error}
            </Text>
            <Pressable onPress={handleAnalyze}>
              <Text style={[styles.retryText, { color: colors.primary }]}>
                Retry
              </Text>
            </Pressable>
          </View>
        )}

        {/* Camera button (Phase C) */}
        <Pressable
          onPress={() => setShowCamera(true)}
          style={({ pressed }) => [
            styles.cameraCard,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <View style={[styles.cameraIconBox, { backgroundColor: colors.greenBg }]}>
            <Feather name="camera" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cameraTitle, { color: colors.text }]}>
              Point & Learn
            </Text>
            <Text style={[styles.cameraDesc, { color: colors.mutedForeground }]}>
              Photograph a word or object to identify it in 3 languages
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
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
                  No words matched
                </Text>
                <Text
                  style={[styles.emptyDesc, { color: colors.mutedForeground }]}
                >
                  Search for your first word above — try ቤት, mother, or bishaan
                </Text>
              </View>
            ) : (
              <>
                {/* Results header + Practice All */}
                {/* Curriculum topic badge */}
                {curriculumTopic && (
                  <View style={[styles.curriculumBadge, { backgroundColor: colors.goldBg, borderColor: colors.gold + "40" }]}>
                    <Feather name="book" size={14} color={colors.gold} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.curriculumBadgeTitle, { color: colors.text }]}>
                        {curriculumTopic.gradeLabel} · {curriculumTopic.name}
                      </Text>
                      <Text style={[styles.curriculumBadgeSub, { color: colors.mutedForeground }]}>
                        This looks like a {getSubjectLabel(curriculumTopic.subject)} lesson
                      </Text>
                    </View>
                  </View>
                )}
                <View style={styles.resultsHeader}>
                  <Text style={[styles.resultsTitle, { color: colors.text }]}>
                    {results.length} word{results.length !== 1 ? "s" : ""} found
                  </Text>
                  <Pressable
                    onPress={handlePracticeAll}
                    style={[
                      styles.practiceAllBtn,
                      {
                        backgroundColor: colors.greenBg,
                        borderColor: colors.green + "40",
                      },
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

                {/* Translation table */}
                <View
                  style={[
                    styles.tableCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  {/* Table header */}
                  <View
                    style={[
                      styles.tableHeader,
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    {["Amharic", "Oromo", "English"].map((h) => (
                      <Text
                        key={h}
                        style={[
                          styles.tableHeaderCell,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {h}
                      </Text>
                    ))}
                    <View style={{ width: 32 }} />
                  </View>

                  {/* Table rows */}
                  {results.map((word, i) => (
                    <Pressable
                      key={word.id}
                      onPress={() => router.push(`/word/${word.id}`)}
                      style={[
                        styles.tableRow,
                        {
                          borderBottomColor: colors.border,
                          borderBottomWidth: i < results.length - 1 ? 1 : 0,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.tableCellAm, { color: colors.primary }]}
                        numberOfLines={2}
                      >
                        {word.amharic}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { color: colors.text },
                        ]}
                        numberOfLines={2}
                      >
                        {word.oromo}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { color: colors.text },
                        ]}
                        numberOfLines={2}
                      >
                        {word.english}
                      </Text>
                      <Pressable
                        onPress={() => handleToggleSave(word.id)}
                        style={[
                          styles.tableStarBtn,
                          {
                            backgroundColor: savedWords.has(word.id)
                              ? colors.goldBg
                              : colors.muted,
                          },
                        ]}
                      >
                        <Feather
                          name="star"
                          size={13}
                          color={
                            savedWords.has(word.id)
                              ? colors.gold
                              : colors.mutedForeground
                          }
                        />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>

                {/* Practice chips */}
                <Text
                  style={[styles.chipsLabel, { color: colors.mutedForeground }]}
                >
                  TAP A WORD TO SEE FULL DETAIL
                </Text>
                <View style={styles.chips}>
                  {results.map((word) => (
                    <Pressable
                      key={word.id}
                      onPress={() => router.push(`/word/${word.id}`)}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: pressed
                            ? colors.primary
                            : colors.greenBg,
                          borderColor: colors.green + "40",
                        },
                      ]}
                    >
                      <Text style={[styles.chipAmharic, { color: colors.primary }]}>
                        {word.amharic}
                      </Text>
                      <Text
                        style={[
                          styles.chipEnglish,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {word.english}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Practice all button */}
                <Pressable
                  onPress={handlePracticeAll}
                  style={[
                    styles.practiceAllLargeBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Feather name="layers" size={18} color="#fff" />
                  <Text style={styles.practiceAllLargeText}>
                    Practice all {results.length} words
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Camera Overlay */}
      {showCamera && (
        <CameraOverlay
          onClose={() => setShowCamera(false)}
          onResult={(result) => {
            setShowCamera(false);
            if (result.mode === "object" && result.objectLabel) {
              setText(result.objectLabel);
            } else if (result.mode === "text" && result.detectedText) {
              setText(result.detectedText);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  activeChildBadge: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    marginTop: 3,
  },
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
  langHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingLeft: 2,
  },
  langHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    height: 52,
    marginBottom: 16,
  },
  analyzeBtnText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  retryText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  cameraCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 24,
  },
  cameraIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  cameraDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  soonBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  soonText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  curriculumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  curriculumBadgeTitle: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  curriculumBadgeSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
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
    lineHeight: 20,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultsTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
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
  tableCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  tableCellAm: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 22,
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  tableStarBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  chipsLabel: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  chipAmharic: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  chipEnglish: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  practiceAllLargeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    height: 54,
    marginTop: 4,
  },
  practiceAllLargeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
});

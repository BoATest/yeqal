import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { WORDS } from "@/data/words";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;
const WEB_BOTTOM = Platform.OS === "web" ? 34 : 0;
const TAB_BAR = Platform.OS === "web" ? 84 : 60;

const SITUATIONS = [
  {
    icon: "shopping-cart" as const,
    title: "At the Market",
    native: "ገበያ ውስጥ",
    color: "#C05A1A",
    phrases: 5,
  },
  {
    icon: "navigation" as const,
    title: "Bus Station",
    native: "አውቶቡስ ጣቢያ",
    color: "#1A6B9A",
    phrases: 5,
  },
  {
    icon: "heart" as const,
    title: "Meeting Elders",
    native: "ሽማግሌዎችን ማቀፍ",
    color: "#6B2D9A",
    phrases: 5,
  },
  {
    icon: "activity" as const,
    title: "Health Center",
    native: "ጤና ጣቢያ",
    color: "#C0392B",
    phrases: 5,
  },
  {
    icon: "book-open" as const,
    title: "School Meeting",
    native: "የትምህርት ቤት ስብሰባ",
    color: "#1B6B3A",
    phrases: 5,
  },
  {
    icon: "coffee" as const,
    title: "Coffee Ceremony",
    native: "የቡና ሥነ ሥርዓት",
    color: "#D4A017",
    phrases: 5,
  },
];

type Mode = "word" | "situation";
type RecordingState = "idle" | "recording" | "analyzing" | "scored";

export default function SpeakScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  const [mode, setMode] = useState<Mode>("word");
  const [wordIndex, setWordIndex] = useState(
    Math.floor(Math.random() * WORDS.length)
  );
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [score, setScore] = useState(0);

  const currentWord = WORDS[wordIndex];

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleMicPress = async () => {
    if (recordingState === "recording") {
      // Stop recording
      stopPulse();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setRecordingState("analyzing");
      await new Promise((r) => setTimeout(r, 1200));
      const newScore = Math.floor(Math.random() * 31) + 65; // 65-95
      setScore(newScore);
      Animated.spring(scoreAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();
      setRecordingState("scored");
    } else if (recordingState === "idle" || recordingState === "scored") {
      // Start recording
      scoreAnim.setValue(0);
      setRecordingState("recording");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      startPulse();
      // Auto stop after 3 seconds
      setTimeout(() => {
        stopPulse();
        setRecordingState("analyzing");
        setTimeout(() => {
          const newScore = Math.floor(Math.random() * 31) + 65;
          setScore(newScore);
          Animated.spring(scoreAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 8,
          }).start();
          setRecordingState("scored");
        }, 1000);
      }, 3000);
    }
  };

  const nextWord = () => {
    setRecordingState("idle");
    scoreAnim.setValue(0);
    setWordIndex((i) => (i + 1) % WORDS.length);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const scoreColor =
    score >= 85
      ? colors.greenLight
      : score >= 70
      ? colors.gold
      : colors.destructive;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + WEB_TOP + 16,
          paddingBottom: insets.bottom + WEB_BOTTOM + TAB_BAR + 24,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Speaking Practice
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Listen, then speak — get instant feedback
          </Text>
        </View>

        {/* Mode toggle */}
        <View
          style={[
            styles.modeToggle,
            { backgroundColor: colors.muted, marginHorizontal: 20 },
          ]}
        >
          {(["word", "situation"] as Mode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[
                styles.modeBtn,
                {
                  backgroundColor:
                    mode === m ? colors.card : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  {
                    color:
                      mode === m ? colors.primary : colors.mutedForeground,
                    fontWeight: mode === m ? "700" : "500",
                  },
                ]}
              >
                {m === "word" ? "Word Practice" : "Situations"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Word Practice Mode */}
        {mode === "word" && (
          <View style={styles.wordMode}>
            {/* Word card */}
            <LinearGradient
              colors={["#1B6B3A", "#0F4022"]}
              style={[styles.wordCard, { marginHorizontal: 20 }]}
            >
              <View style={styles.wordCardTop}>
                <Text style={styles.wordAmharic}>{currentWord.amharic}</Text>
                <Text style={styles.wordRoman}>{currentWord.romanization}</Text>
              </View>
              <View style={styles.wordLangs}>
                <View style={styles.wordLangItem}>
                  <Text style={styles.wordLangLabel}>Oromo</Text>
                  <Text style={styles.wordLangText}>{currentWord.oromo}</Text>
                </View>
                <View
                  style={[
                    styles.wordDivider,
                    { backgroundColor: "#FFFFFF30" },
                  ]}
                />
                <View style={styles.wordLangItem}>
                  <Text style={styles.wordLangLabel}>English</Text>
                  <Text style={styles.wordLangText}>{currentWord.english}</Text>
                </View>
              </View>
              {/* Hear it first button */}
              <Pressable style={styles.hearBtn}>
                <Feather name="volume-2" size={18} color="#FFFFFF" />
                <Text style={styles.hearBtnText}>Hear it first</Text>
              </Pressable>
            </LinearGradient>

            {/* Instruction */}
            <Text
              style={[styles.instruction, { color: colors.mutedForeground }]}
            >
              {recordingState === "idle"
                ? "Tap the microphone and say the word"
                : recordingState === "recording"
                ? "Recording... speak now"
                : recordingState === "analyzing"
                ? "Analyzing your pronunciation..."
                : "Great job! How did you do?"}
            </Text>

            {/* Mic button */}
            <View style={styles.micContainer}>
              <Animated.View
                style={[
                  styles.micRipple,
                  {
                    transform: [{ scale: pulseAnim }],
                    backgroundColor:
                      recordingState === "recording"
                        ? colors.destructive + "22"
                        : colors.primary + "15",
                  },
                ]}
              />
              <Pressable
                onPress={handleMicPress}
                disabled={recordingState === "analyzing"}
                style={[
                  styles.micBtn,
                  {
                    backgroundColor:
                      recordingState === "recording"
                        ? colors.destructive
                        : recordingState === "analyzing"
                        ? colors.muted
                        : colors.primary,
                  },
                ]}
              >
                <Feather
                  name={
                    recordingState === "recording"
                      ? "square"
                      : recordingState === "analyzing"
                      ? "loader"
                      : "mic"
                  }
                  size={32}
                  color={
                    recordingState === "analyzing"
                      ? colors.mutedForeground
                      : "#FFFFFF"
                  }
                />
              </Pressable>
            </View>

            {/* Score */}
            {recordingState === "scored" && (
              <Animated.View
                style={[
                  styles.scoreCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: scoreAnim,
                    transform: [{ scale: scoreAnim }],
                    marginHorizontal: 20,
                  },
                ]}
              >
                <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                  {score}%
                </Text>
                <Text style={[styles.scoreLabel, { color: colors.text }]}>
                  {score >= 85
                    ? "Excellent! Your pronunciation is great."
                    : score >= 70
                    ? "Good effort! Keep practicing the ending sounds."
                    : "Keep trying! Listen carefully to the audio first."}
                </Text>
                <View style={styles.scoreActions}>
                  <Pressable
                    onPress={handleMicPress}
                    style={[
                      styles.scoreBtn,
                      { backgroundColor: colors.muted },
                    ]}
                  >
                    <Feather name="refresh-cw" size={16} color={colors.text} />
                    <Text style={[styles.scoreBtnText, { color: colors.text }]}>
                      Try again
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={nextWord}
                    style={[
                      styles.scoreBtn,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Feather name="arrow-right" size={16} color="#fff" />
                    <Text style={[styles.scoreBtnText, { color: "#fff" }]}>
                      Next word
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}

            {/* Skip button */}
            {(recordingState === "idle") && (
              <Pressable onPress={nextWord} style={styles.skipBtn}>
                <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
                  Skip this word
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Situations Mode */}
        {mode === "situation" && (
          <View style={styles.situations}>
            <Text style={[styles.situationDesc, { color: colors.mutedForeground }]}>
              Practice real Ethiopian conversations in common situations
            </Text>
            {SITUATIONS.map((sit) => (
              <Pressable
                key={sit.title}
                style={({ pressed }) => [
                  styles.situationCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.sitIcon,
                    { backgroundColor: sit.color + "18" },
                  ]}
                >
                  <Feather name={sit.icon} size={22} color={sit.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sitTitle, { color: colors.text }]}>
                    {sit.title}
                  </Text>
                  <Text style={[styles.sitNative, { color: sit.color }]}>
                    {sit.native}
                  </Text>
                  <Text
                    style={[styles.sitPhrases, { color: colors.mutedForeground }]}
                  >
                    {sit.phrases} key phrases
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={colors.mutedForeground}
                />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  modeToggle: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  modeBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  modeBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  wordMode: { gap: 20 },
  wordCard: { borderRadius: 20, padding: 22, gap: 18 },
  wordCardTop: {},
  wordAmharic: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "700",
    lineHeight: 50,
  },
  wordRoman: {
    color: "#FFFFFFAA",
    fontSize: 13,
    fontStyle: "italic",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  wordLangs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#FFFFFF20",
  },
  wordLangItem: { flex: 1 },
  wordLangLabel: {
    color: "#FFFFFF70",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: "Inter_700Bold",
  },
  wordLangText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  wordDivider: { width: 1, height: 32 },
  hearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF22",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  hearBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  instruction: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginHorizontal: 40,
  },
  micContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
  },
  micRipple: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
    gap: 12,
  },
  scoreNumber: {
    fontSize: 52,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
  },
  scoreActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  scoreBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
  },
  scoreBtnText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  situations: { paddingHorizontal: 20, gap: 10 },
  situationDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  situationCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sitIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sitTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sitNative: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  sitPhrases: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});

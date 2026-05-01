import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
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

type Rating = "hard" | "medium" | "easy";

export default function FlashcardScreen() {
  const colors = useColors();
  const { markLearned, addXP } = useApp();
  const insets = useSafeAreaInsets();

  const [queue, setQueue] = useState(() => [...WORDS].sort(() => Math.random() - 0.5));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [done, setDone] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentWord = queue[index];

  const handleFlip = () => {
    if (flipped) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setFlipped(true));
  };

  const handleRating = (rating: Rating) => {
    markLearned(currentWord.id);
    const xpMap: Record<Rating, number> = { hard: 5, medium: 10, easy: 15 };
    addXP(xpMap[rating]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setRatings((prev) => [...prev, rating]);
    setCompleted((c) => c + 1);

    // Slide out then advance
    Animated.timing(slideAnim, {
      toValue: -400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(400);
      flipAnim.setValue(0);
      setFlipped(false);
      if (index + 1 >= queue.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  const progressPct = (completed / Math.min(queue.length, 20)) * 100;

  if (done || completed >= 20) {
    const easy = ratings.filter((r) => r === "easy").length;
    const medium = ratings.filter((r) => r === "medium").length;
    const hard = ratings.filter((r) => r === "hard").length;
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        <View
          style={[
            styles.doneScreen,
            { paddingTop: insets.top + WEB_TOP + 24 },
          ]}
        >
          <LinearGradient
            colors={["#1B6B3A", "#0F4022"]}
            style={styles.doneCard}
          >
            <Feather name="award" size={48} color="#F5C842" />
            <Text style={styles.doneTitle}>Session Complete!</Text>
            <Text style={styles.doneSubtitle}>
              {completed} cards reviewed
            </Text>
            <View style={styles.doneStats}>
              <View style={styles.doneStat}>
                <Text style={[styles.doneStatNum, { color: "#2ECC71" }]}>
                  {easy}
                </Text>
                <Text style={styles.doneStatLabel}>Easy</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneStatNum, { color: "#F5C842" }]}>
                  {medium}
                </Text>
                <Text style={styles.doneStatLabel}>Medium</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneStatNum, { color: "#E74C3C" }]}>
                  {hard}
                </Text>
                <Text style={styles.doneStatLabel}>Hard</Text>
              </View>
            </View>
          </LinearGradient>
          <Pressable
            onPress={() => router.back()}
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.doneBtnText, { color: "#fff" }]}>
              Done
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + WEB_TOP + 16,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Pressable onPress={() => router.back()}>
          <Feather name="x" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 16 }}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: colors.muted },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPct}%` as any,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>
        <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
          {completed}/{Math.min(queue.length, 20)}
        </Text>
      </View>

      <View style={styles.cardArea}>
        {/* Card */}
        <Animated.View
          style={[
            styles.cardWrapper,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <Pressable
            onPress={handleFlip}
            style={({ pressed }) => [{ opacity: pressed && !flipped ? 0.9 : 1 }]}
          >
            {!flipped ? (
              // Front — show primary word
              <Animated.View
                style={[
                  styles.card,
                  { transform: [{ rotateY: frontRotate }] },
                ]}
              >
                <LinearGradient
                  colors={["#1B6B3A", "#0F4022"]}
                  style={styles.cardGradient}
                >
                  <Text style={styles.cardHint}>What does this mean?</Text>
                  <Text style={styles.cardAmharic}>{currentWord.amharic}</Text>
                  {currentWord.romanization && (
                    <Text style={styles.cardRoman}>
                      {currentWord.romanization}
                    </Text>
                  )}
                  <View style={styles.tapHint}>
                    <Feather name="rotate-cw" size={16} color="#FFFFFF60" />
                    <Text style={styles.tapHintText}>Tap to reveal</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            ) : (
              // Back — show all translations
              <View
                style={[
                  styles.card,
                  styles.cardBack,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.cardBackTop}>
                  <Text
                    style={[styles.backAmharic, { color: colors.primary }]}
                  >
                    {currentWord.amharic}
                  </Text>
                  <View
                    style={[
                      styles.backDivider,
                      { backgroundColor: colors.border },
                    ]}
                  />
                </View>
                <View style={styles.backLangs}>
                  <View style={styles.backLangItem}>
                    <Text
                      style={[
                        styles.backLangLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Oromo
                    </Text>
                    <Text
                      style={[styles.backLangWord, { color: colors.text }]}
                    >
                      {currentWord.oromo}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.backVertDiv,
                      { backgroundColor: colors.border },
                    ]}
                  />
                  <View style={styles.backLangItem}>
                    <Text
                      style={[
                        styles.backLangLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      English
                    </Text>
                    <Text
                      style={[styles.backLangWord, { color: colors.text }]}
                    >
                      {currentWord.english}
                    </Text>
                  </View>
                </View>
                {currentWord.exampleEnglish && (
                  <View
                    style={[
                      styles.backExample,
                      {
                        backgroundColor: colors.greenBg,
                        borderColor: colors.green + "30",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.backExampleText,
                        { color: colors.primary },
                      ]}
                    >
                      "{currentWord.exampleEnglish}"
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Pressable>
        </Animated.View>
      </View>

      {/* Rating buttons */}
      <View
        style={[
          styles.ratingArea,
          { paddingBottom: insets.bottom + WEB_BOTTOM + 24 },
        ]}
      >
        {flipped ? (
          <>
            <Text
              style={[styles.ratingLabel, { color: colors.mutedForeground }]}
            >
              How well did you know it?
            </Text>
            <View style={styles.ratingBtns}>
              {(
                [
                  { key: "hard" as Rating, label: "Hard", color: "#C0392B" },
                  { key: "medium" as Rating, label: "Good", color: "#D4A017" },
                  { key: "easy" as Rating, label: "Easy", color: "#1B6B3A" },
                ] as const
              ).map((r) => (
                <Pressable
                  key={r.key}
                  onPress={() => handleRating(r.key)}
                  style={({ pressed }) => [
                    styles.ratingBtn,
                    {
                      backgroundColor: r.color + "18",
                      borderColor: r.color + "40",
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                >
                  <Text style={[styles.ratingBtnText, { color: r.color }]}>
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <Pressable
            onPress={handleFlip}
            style={[styles.revealBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="eye" size={18} color="#fff" />
            <Text style={styles.revealBtnText}>Reveal answer</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 13, fontFamily: "Inter_500Medium", width: 32 },
  cardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  cardWrapper: { width: "100%" },
  card: { width: "100%", borderRadius: 24, overflow: "hidden" },
  cardGradient: {
    padding: 32,
    alignItems: "center",
    minHeight: 300,
    justifyContent: "center",
    gap: 16,
  },
  cardHint: {
    color: "#FFFFFF80",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  cardAmharic: {
    color: "#FFFFFF",
    fontSize: 52,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 64,
  },
  cardRoman: {
    color: "#FFFFFFAA",
    fontSize: 16,
    fontStyle: "italic",
    fontFamily: "Inter_400Regular",
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  tapHintText: {
    color: "#FFFFFF60",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  cardBack: {
    borderWidth: 1,
    padding: 28,
    minHeight: 300,
    justifyContent: "center",
    gap: 20,
  },
  cardBackTop: { alignItems: "center", gap: 16 },
  backAmharic: { fontSize: 40, fontWeight: "700", textAlign: "center" },
  backDivider: { height: 1, width: "100%" },
  backLangs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backLangItem: { flex: 1, alignItems: "center" },
  backLangLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: "Inter_700Bold",
  },
  backLangWord: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  backVertDiv: { width: 1, height: 40 },
  backExample: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  backExampleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    textAlign: "center",
  },
  ratingArea: { paddingHorizontal: 20, gap: 12 },
  ratingLabel: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  ratingBtns: { flexDirection: "row", gap: 10 },
  ratingBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  ratingBtnText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  revealBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    height: 52,
  },
  revealBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  // Done screen
  doneScreen: {
    flex: 1,
    padding: 24,
    gap: 20,
  },
  doneCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 12,
    flex: 1,
    justifyContent: "center",
  },
  doneTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  doneSubtitle: {
    color: "#FFFFFFAA",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  doneStats: {
    flexDirection: "row",
    gap: 32,
    marginTop: 16,
  },
  doneStat: { alignItems: "center", gap: 4 },
  doneStatNum: { fontSize: 32, fontWeight: "700", fontFamily: "Inter_700Bold" },
  doneStatLabel: {
    color: "#FFFFFF80",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  doneBtn: {
    borderRadius: 16,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});

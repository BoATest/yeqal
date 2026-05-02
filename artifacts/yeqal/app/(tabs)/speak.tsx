import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
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
import { useAudio } from "@/hooks/useAudio";
import { WORDS } from "@/data/words";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;
const WEB_BOTTOM = Platform.OS === "web" ? 34 : 0;
const TAB_BAR = Platform.OS === "web" ? 84 : 60;

const SITUATIONS = [
  { icon: "shopping-cart" as const, title: "At the Market", native: "ገበያ ውስጥ", color: "#C05A1A", phrases: 5 },
  { icon: "navigation" as const, title: "Bus Station", native: "አውቶቡስ ጣቢያ", color: "#1A6B9A", phrases: 5 },
  { icon: "heart" as const, title: "Meeting Elders", native: "ሽማግሌዎችን ማቀፍ", color: "#6B2D9A", phrases: 5 },
  { icon: "activity" as const, title: "Health Center", native: "ጤና ጣቢያ", color: "#C0392B", phrases: 5 },
  { icon: "book-open" as const, title: "School Meeting", native: "የትምህርት ቤት ስብሰባ", color: "#1B6B3A", phrases: 5 },
  { icon: "coffee" as const, title: "Coffee Ceremony", native: "የቡና ሥነ ሥርዓት", color: "#D4A017", phrases: 5 },
];

const NUM_BARS = 7;
type Mode = "word" | "situation";
type RecordingState = "idle" | "recording" | "analyzing" | "scored" | "selfrate";

const HASAB_KEY = process.env.EXPO_PUBLIC_HASAB_KEY ?? "";

function scoreSpeech(heard: string, target: string): number {
  const a = heard.toLowerCase().trim();
  const b = target.toLowerCase().trim();
  if (!a || !b) return 0;
  if (a === b) return 97;
  if (a.includes(b) || b.includes(a)) return 90;
  const aWords = a.split(/\s+/);
  const bWords = b.split(/\s+/);
  let matches = 0;
  for (const w of aWords) {
    if (bWords.some((bw) => bw.startsWith(w.slice(0, 3)) || w.startsWith(bw.slice(0, 3)))) {
      matches++;
    }
  }
  const ratio = matches / Math.max(aWords.length, bWords.length);
  return Math.round(50 + ratio * 45);
}

export default function SpeakScreen() {
  const colors = useColors();
  const { speak, playingKey } = useAudio();
  const insets = useSafeAreaInsets();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const bars = useRef(
    Array.from({ length: NUM_BARS }, () => new Animated.Value(0.2))
  ).current;

  const [mode, setMode] = useState<Mode>("word");
  const [wordIndex, setWordIndex] = useState(Math.floor(Math.random() * WORDS.length));
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [score, setScore] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [serviceError, setServiceError] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waveAnimsRef = useRef<Animated.CompositeAnimation[]>([]);
  const srRef = useRef<any>(null);
  const transcriptRef = useRef("");

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setHasSpeechSupport(!!SR);
    }
  }, []);

  const currentWord = WORDS[wordIndex];

  const startWaveform = () => {
    waveAnimsRef.current.forEach((a) => a.stop());
    waveAnimsRef.current = bars.map((bar, i) => {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(bar, {
            toValue: 0.2 + Math.random() * 0.8,
            duration: 250 + i * 60,
            useNativeDriver: true,
          }),
          Animated.timing(bar, {
            toValue: 0.1 + Math.random() * 0.4,
            duration: 200 + i * 40,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
      return anim;
    });
  };

  const stopWaveform = () => {
    waveAnimsRef.current.forEach((a) => a.stop());
    bars.forEach((bar) =>
      Animated.timing(bar, { toValue: 0.2, duration: 200, useNativeDriver: true }).start()
    );
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const clearTimers = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    countdownRef.current = null;
    autoStopRef.current = null;
    setCountdown(null);
  };

  const applyScore = (heard: string, targetWord: typeof currentWord) => {
    const targets = [
      targetWord.english,
      targetWord.romanization ?? "",
      targetWord.amharic,
      targetWord.oromo,
    ].filter(Boolean);
    const best = targets.reduce((max, t) => Math.max(max, scoreSpeech(heard, t)), 0);
    const clamped = Math.min(99, Math.max(best, heard.trim().length > 1 ? 52 : 0));
    setScore(clamped);
    setTranscript(heard);
    scoreAnim.setValue(0);
    Animated.spring(scoreAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
    setRecordingState("scored");
  };

  const stopSR = () => {
    if (srRef.current) {
      try { srRef.current.stop(); } catch { /* ignore */ }
      srRef.current = null;
    }
  };

  const finishRecording = (heardOverride?: string) => {
    clearTimers();
    stopPulse();
    stopWaveform();
    stopSR();
    setServiceError(false);

    if (!hasSpeechSupport) {
      setRecordingState("selfrate");
      return;
    }

    setRecordingState("analyzing");
    setTimeout(() => {
      try {
        applyScore(heardOverride ?? "", currentWord);
      } catch {
        setServiceError(true);
        setRecordingState("idle");
      }
    }, 600);
  };

  const requestMicAndRecord = async () => {
    setPermissionDenied(false);
    setTranscript("");

    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        setPermissionDenied(true);
        return;
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    scoreAnim.setValue(0);
    setRecordingState("recording");
    startPulse();
    startWaveform();

    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    // Start real SpeechRecognition on web
    if (hasSpeechSupport && typeof window !== "undefined") {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        let latestTranscript = "";
        const rec = new SR();
        rec.lang = "am-ET";
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (e: any) => {
          latestTranscript = Array.from(e.results as any[])
            .map((r: any) => r[0].transcript)
            .join(" ");
          transcriptRef.current = latestTranscript;
          setTranscript(latestTranscript);
        };
        rec.onend = () => {
          if (srRef.current === rec) {
            srRef.current = null;
            clearTimers();
            stopPulse();
            stopWaveform();
            setRecordingState("analyzing");
            setTimeout(() => applyScore(latestTranscript, currentWord), 400);
          }
        };
        rec.onerror = () => {
          if (srRef.current === rec) srRef.current = null;
        };
        srRef.current = rec;
        try { rec.start(); } catch { srRef.current = null; }
      }
    }

    autoStopRef.current = setTimeout(() => finishRecording(transcriptRef.current), 3200);
  };

  const handleSelfRate = (selfScore: number) => {
    setScore(selfScore);
    setTranscript("");
    scoreAnim.setValue(0);
    Animated.spring(scoreAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
    setRecordingState("scored");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleMicPress = async () => {
    if (recordingState === "recording") {
      finishRecording(transcriptRef.current);
    } else if (recordingState === "idle" || recordingState === "scored" || recordingState === "selfrate") {
      await requestMicAndRecord();
    }
  };

  const nextWord = () => {
    clearTimers();
    stopPulse();
    stopWaveform();
    stopSR();
    setRecordingState("idle");
    scoreAnim.setValue(0);
    setServiceError(false);
    setTranscript("");
    transcriptRef.current = "";
    setWordIndex((i) => (i + 1) % WORDS.length);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  useEffect(() => () => clearTimers(), []);

  const scoreColor =
    score >= 70 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444";

  const scoreFeedback =
    score >= 85
      ? "Excellent! Your pronunciation is great."
      : score >= 70
      ? "Good effort! Keep practicing the ending sounds."
      : score >= 50
      ? "Keep trying! Listen to the word first."
      : "Practice more. Try listening first, then speaking.";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + WEB_TOP + 16,
          paddingBottom: insets.bottom + WEB_BOTTOM + TAB_BAR + 24,
        }}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Speaking Practice</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Listen, then speak — get instant feedback
          </Text>
        </View>

        {/* Mode toggle */}
        <View style={[styles.modeToggle, { backgroundColor: colors.muted, marginHorizontal: 20 }]}>
          {(["word", "situation"] as Mode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[styles.modeBtn, { backgroundColor: mode === m ? colors.card : "transparent" }]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  { color: mode === m ? colors.primary : colors.mutedForeground, fontWeight: mode === m ? "700" : "500" },
                ]}
              >
                {m === "word" ? "Word Practice" : "Situations"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Permission denied error */}
        {permissionDenied && (
          <View style={[styles.permErrorCard, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40" }]}>
            <Feather name="mic-off" size={18} color={colors.destructive} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.permErrorTitle, { color: colors.destructive }]}>
                Microphone access denied
              </Text>
              <Text style={[styles.permErrorDesc, { color: colors.mutedForeground }]}>
                Allow microphone access in your browser settings to practice speaking.
              </Text>
            </View>
          </View>
        )}

        {/* Service error */}
        {serviceError && (
          <View style={[styles.permErrorCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="alert-circle" size={18} color={colors.mutedForeground} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.permErrorTitle, { color: colors.text }]}>
                Pronunciation service unavailable
              </Text>
              <Text style={[styles.permErrorDesc, { color: colors.mutedForeground }]}>
                Try again in a moment.
              </Text>
            </View>
            <Pressable onPress={() => setServiceError(false)}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}

        {/* Word Practice Mode */}
        {mode === "word" && (
          <View style={styles.wordMode}>
            {/* Word card */}
            <LinearGradient colors={["#1B6B3A", "#0F4022"]} style={[styles.wordCard, { marginHorizontal: 20 }]}>
              <View style={styles.wordCardTop}>
                <Text style={styles.wordAmharic}>{currentWord.amharic}</Text>
                <Text style={styles.wordRoman}>{currentWord.romanization}</Text>
              </View>
              <View style={styles.wordLangs}>
                <View style={styles.wordLangItem}>
                  <Text style={styles.wordLangLabel}>Oromo</Text>
                  <Text style={styles.wordLangText}>{currentWord.oromo}</Text>
                </View>
                <View style={[styles.wordDivider, { backgroundColor: "#FFFFFF30" }]} />
                <View style={styles.wordLangItem}>
                  <Text style={styles.wordLangLabel}>English</Text>
                  <Text style={styles.wordLangText}>{currentWord.english}</Text>
                </View>
              </View>
              {/* Hear it first */}
              <Pressable
                onPress={() => speak(currentWord.amharic, "am", `hear-${currentWord.id}`)}
                style={[
                  styles.hearBtn,
                  {
                    backgroundColor:
                      playingKey === `hear-${currentWord.id}` ? "#FFFFFF44" : "#FFFFFF22",
                  },
                ]}
              >
                <Feather
                  name={playingKey === `hear-${currentWord.id}` ? "volume-2" : "play"}
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.hearBtnText}>
                  {playingKey === `hear-${currentWord.id}` ? "Playing..." : "Hear it first"}
                </Text>
              </Pressable>
            </LinearGradient>

            {/* Instruction */}
            <Text style={[styles.instruction, { color: colors.mutedForeground }]}>
              {recordingState === "idle"
                ? "Tap the microphone and say the word"
                : recordingState === "recording"
                ? countdown !== null
                  ? `Recording... ${countdown}`
                  : "Recording... speak now"
                : recordingState === "analyzing"
                ? "Scoring your pronunciation..."
                : "Here is your score:"}
            </Text>

            {/* Mic + waveform */}
            <View style={styles.micContainer}>
              {recordingState === "recording" ? (
                /* Waveform */
                <View style={styles.waveformWrap}>
                  {bars.map((bar, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.waveBar,
                        {
                          backgroundColor: colors.destructive,
                          transform: [{ scaleY: bar }],
                        },
                      ]}
                    />
                  ))}
                </View>
              ) : (
                <Animated.View
                  style={[
                    styles.micRipple,
                    {
                      transform: [{ scale: pulseAnim }],
                      backgroundColor:
                        recordingState === "analyzing"
                          ? colors.muted
                          : colors.primary + "18",
                    },
                  ]}
                />
              )}

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
                  color={recordingState === "analyzing" ? colors.mutedForeground : "#FFFFFF"}
                />
              </Pressable>

              {countdown !== null && recordingState === "recording" && (
                <View style={[styles.countdownBadge, { backgroundColor: colors.destructive }]}>
                  <Text style={styles.countdownText}>{countdown}</Text>
                </View>
              )}
            </View>

            {/* Self-rate mode (native / no SR support) */}
            {recordingState === "selfrate" && (
              <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 20 }]}>
                <Text style={[styles.scoreFeedback, { color: colors.text, textAlign: "center" }]}>
                  How did it go? Rate yourself:
                </Text>
                <View style={styles.selfRateRow}>
                  <Pressable onPress={() => handleSelfRate(40)} style={[styles.selfRateBtn, { backgroundColor: "#EF444420", borderColor: "#EF444440" }]}>
                    <Text style={[styles.selfRateIcon]}>😓</Text>
                    <Text style={[styles.selfRateLabel, { color: "#EF4444" }]}>Still learning</Text>
                  </Pressable>
                  <Pressable onPress={() => handleSelfRate(72)} style={[styles.selfRateBtn, { backgroundColor: "#F59E0B20", borderColor: "#F59E0B40" }]}>
                    <Text style={[styles.selfRateIcon]}>🙂</Text>
                    <Text style={[styles.selfRateLabel, { color: "#F59E0B" }]}>Getting there</Text>
                  </Pressable>
                  <Pressable onPress={() => handleSelfRate(95)} style={[styles.selfRateBtn, { backgroundColor: "#22C55E20", borderColor: "#22C55E40" }]}>
                    <Text style={[styles.selfRateIcon]}>🎉</Text>
                    <Text style={[styles.selfRateLabel, { color: "#22C55E" }]}>Nailed it!</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Score display */}
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
                {transcript ? (
                  <View style={[styles.transcriptRow, { backgroundColor: colors.muted, borderRadius: 10 }]}>
                    <Feather name="mic" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.transcriptLabel, { color: colors.mutedForeground }]}>
                      We heard: <Text style={{ color: colors.text, fontWeight: "600" }}>{transcript}</Text>
                    </Text>
                  </View>
                ) : null}
                <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                  {score}
                </Text>
                <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>
                  out of 100
                </Text>
                <Text style={[styles.scoreFeedback, { color: colors.text }]}>
                  {scoreFeedback}
                </Text>
                <View style={styles.scoreActions}>
                  <Pressable
                    onPress={handleMicPress}
                    style={[styles.scoreBtn, { backgroundColor: colors.muted }]}
                  >
                    <Feather name="refresh-cw" size={16} color={colors.text} />
                    <Text style={[styles.scoreBtnText, { color: colors.text }]}>
                      Try again
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={nextWord}
                    style={[styles.scoreBtn, { backgroundColor: colors.primary }]}
                  >
                    <Feather name="arrow-right" size={16} color="#fff" />
                    <Text style={[styles.scoreBtnText, { color: "#fff" }]}>
                      Next word
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}

            {(recordingState === "idle" || recordingState === "selfrate") && (
              <Pressable onPress={nextWord} style={styles.skipBtn}>
                <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
                  Skip this word
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Situations */}
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
                <View style={[styles.sitIcon, { backgroundColor: sit.color + "18" }]}>
                  <Feather name={sit.icon} size={22} color={sit.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sitTitle, { color: colors.text }]}>{sit.title}</Text>
                  <Text style={[styles.sitNative, { color: sit.color }]}>{sit.native}</Text>
                  <Text style={[styles.sitPhrases, { color: colors.mutedForeground }]}>
                    {sit.phrases} key phrases
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
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
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  modeToggle: { flexDirection: "row", borderRadius: 14, padding: 4, marginBottom: 20 },
  modeBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  modeBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  permErrorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  permErrorTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  permErrorDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 16 },
  wordMode: { gap: 20 },
  wordCard: { borderRadius: 20, padding: 22, gap: 18 },
  wordCardTop: {},
  wordAmharic: { color: "#FFFFFF", fontSize: 40, fontWeight: "700", lineHeight: 50 },
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
  wordLangText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  wordDivider: { width: 1, height: 32 },
  hearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  hearBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  instruction: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginHorizontal: 40,
  },
  micContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 130,
  },
  waveformWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "absolute",
    height: 80,
  },
  waveBar: {
    width: 5,
    height: 60,
    borderRadius: 3,
  },
  micRipple: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  micBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  countdownBadge: {
    position: "absolute",
    top: 4,
    right: "25%",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  countdownText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  scoreCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 4,
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    lineHeight: 72,
  },
  scoreLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  scoreFeedback: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
    marginTop: 8,
  },
  scoreActions: { flexDirection: "row", gap: 12, marginTop: 16, width: "100%" },
  scoreBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
  },
  scoreBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  selfRateRow: { flexDirection: "row", gap: 10, width: "100%", marginTop: 8 },
  selfRateBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
  },
  selfRateIcon: { fontSize: 24 },
  selfRateLabel: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  transcriptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    alignSelf: "stretch",
  },
  transcriptLabel: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  situations: { paddingHorizontal: 20, gap: 10 },
  situationDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  situationCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sitIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  sitTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sitNative: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium", marginTop: 2 },
  sitPhrases: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});

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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { AppLanguage } from "@/data/types";
import { ALL_WORDS } from "@/data/allWords";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;
const WEB_BOTTOM = Platform.OS === "web" ? 34 : 0;
const TAB_BAR = Platform.OS === "web" ? 84 : 60;

const LANGS: { key: AppLanguage; label: string; native: string; speechCode: string; libreCode: string }[] = [
  { key: "amharic", label: "Amharic", native: "አማርኛ", speechCode: "am-ET", libreCode: "am" },
  { key: "oromo", label: "Oromo", native: "Oromoo", speechCode: "om", libreCode: "om" },
  { key: "english", label: "English", native: "English", speechCode: "en-US", libreCode: "en" },
];

interface ChatBubble {
  id: string;
  speaker: "from" | "to";
  original: string;
  translation: string;
  englishTranslation?: string;
  timestamp: number;
}

function findLocalTranslation(
  text: string,
  srcLang: AppLanguage,
  tgtLang: AppLanguage
): string | null {
  const lower = text.toLowerCase().trim();
  for (const word of ALL_WORDS) {
    let matches = false;
    if (srcLang === "amharic" && (word.amharic === text || word.amharic.includes(text))) matches = true;
    if (srcLang === "oromo" && word.oromo.toLowerCase() === lower) matches = true;
    if (srcLang === "english" && word.english.toLowerCase() === lower) matches = true;
    if (matches) {
      if (tgtLang === "amharic") return word.amharic;
      if (tgtLang === "oromo") return word.oromo;
      return word.english;
    }
  }
  return null;
}

async function fetchTranslation(text: string, from: AppLanguage, to: AppLanguage): Promise<string> {
  const local = findLocalTranslation(text, from, to);
  if (local) return local;
  const src = LANGS.find((l) => l.key === from)?.libreCode ?? "am";
  const tgt = LANGS.find((l) => l.key === to)?.libreCode ?? "om";
  try {
    const res = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: src, target: tgt, api_key: "" }),
    });
    if (res.ok) {
      const data = await res.json();
      const t = data.translatedText ?? "";
      if (t && t !== text) return t;
    }
  } catch { /* fall through */ }
  return `"${text}"`;
}

function speak(text: string, lang: AppLanguage) {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new window.SpeechSynthesisUtterance(text);
  utt.lang = LANGS.find((l) => l.key === lang)?.speechCode ?? "en-US";
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

export default function TranslateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [langFrom, setLangFrom] = useState<AppLanguage>("amharic");
  const [langTo, setLangTo] = useState<AppLanguage>("oromo");
  const [showEnglish, setShowEnglish] = useState(false);
  const [conversation, setConversation] = useState<ChatBubble[]>([]);
  const [recording, setRecording] = useState<"from" | "to" | null>(null);
  const [translating, setTranslating] = useState<"from" | "to" | null>(null);
  const [noSpeech, setNoSpeech] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [activeInput, setActiveInput] = useState<"from" | "to" | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const recRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      setNoSpeech(true);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setNoSpeech(true);
  }, []);

  const startPulse = () => {
    pulseLoop.current?.stop();
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const addBubble = async (original: string, speaker: "from" | "to") => {
    const srcLang = speaker === "from" ? langFrom : langTo;
    const tgtLang = speaker === "from" ? langTo : langFrom;

    setTranslating(speaker);
    const translation = await fetchTranslation(original, srcLang, tgtLang);

    let englishTranslation: string | undefined;
    if (showEnglish && srcLang !== "english" && tgtLang !== "english") {
      const localEn = findLocalTranslation(original, srcLang, "english");
      englishTranslation = localEn ?? undefined;
    }

    const bubble: ChatBubble = {
      id: Date.now().toString(),
      speaker,
      original,
      translation,
      englishTranslation,
      timestamp: Date.now(),
    };

    setConversation((prev) => [...prev, bubble]);
    setTranslating(null);
    speak(translation, tgtLang);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const startRecording = (speaker: "from" | "to") => {
    if (noSpeech) return;
    if (recording) {
      stopRecording();
      return;
    }
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const lang = speaker === "from" ? langFrom : langTo;
    const rec = new SR();
    rec.lang = LANGS.find((l) => l.key === lang)?.speechCode ?? "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => { setRecording(speaker); startPulse(); };

    rec.onresult = async (e: any) => {
      const transcript = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join("")
        .trim();
      if (transcript) await addBubble(transcript, speaker);
    };

    rec.onerror = () => { setRecording(null); stopPulse(); };
    rec.onend = () => { setRecording(null); stopPulse(); };

    recRef.current = rec;
    rec.start();
  };

  const stopRecording = () => {
    if (recRef.current) {
      try { recRef.current.stop(); } catch { /* ignore */ }
      recRef.current = null;
    }
    setRecording(null);
    stopPulse();
  };

  const handleSwap = () => {
    setLangFrom(langTo);
    setLangTo(langFrom);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim() || !activeInput) return;
    await addBubble(textInput.trim(), activeInput);
    setTextInput("");
    setShowTextInput(false);
    setActiveInput(null);
  };

  const fromLang = LANGS.find((l) => l.key === langFrom)!;
  const toLang = LANGS.find((l) => l.key === langTo)!;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + WEB_TOP + 12,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Translate</Text>

        {/* Language pills */}
        <View style={styles.langRow}>
          {/* FROM language pill */}
          <Pressable
            onPress={() => {
              const others: AppLanguage[] = ["amharic", "oromo", "english"];
              const idx = others.indexOf(langFrom);
              const next = others[(idx + 1) % others.length];
              if (next !== langTo) setLangFrom(next);
            }}
            style={[styles.langPill, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.langPillNative}>{fromLang.native}</Text>
            <Text style={styles.langPillLabel}>{fromLang.label}</Text>
          </Pressable>

          {/* Swap button */}
          <Pressable onPress={handleSwap} style={[styles.swapBtn, { backgroundColor: colors.muted }]}>
            <Feather name="repeat" size={16} color={colors.primary} />
          </Pressable>

          {/* TO language pill */}
          <Pressable
            onPress={() => {
              const others: AppLanguage[] = ["amharic", "oromo", "english"];
              const idx = others.indexOf(langTo);
              const next = others[(idx + 1) % others.length];
              if (next !== langFrom) setLangTo(next);
            }}
            style={[styles.langPill, { backgroundColor: colors.greenBg, borderWidth: 1.5, borderColor: colors.primary }]}
          >
            <Text style={[styles.langPillNative, { color: colors.primary }]}>{toLang.native}</Text>
            <Text style={[styles.langPillLabel, { color: colors.primary }]}>{toLang.label}</Text>
          </Pressable>

          {/* English toggle */}
          {langFrom !== "english" && langTo !== "english" && (
            <Pressable
              onPress={() => setShowEnglish((v) => !v)}
              style={[
                styles.engToggle,
                {
                  backgroundColor: showEnglish ? "#1A6B9A22" : colors.muted,
                  borderColor: showEnglish ? "#1A6B9A" : colors.border,
                  borderWidth: 1.5,
                },
              ]}
            >
              <Text style={[styles.engToggleText, { color: showEnglish ? "#1A6B9A" : colors.mutedForeground }]}>
                {showEnglish ? "EN ✓" : "+ EN"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Text input toggle */}
        <View style={styles.inputToggleRow}>
          <Pressable
            onPress={() => { setShowTextInput((v) => !v); setActiveInput("from"); setTextInput(""); }}
            style={styles.typeBtn}
          >
            <Feather name="type" size={12} color={colors.mutedForeground} />
            <Text style={[styles.typeBtnText, { color: colors.mutedForeground }]}>Type instead</Text>
          </Pressable>
          {conversation.length > 0 && (
            <Pressable onPress={() => setConversation([])} style={styles.clearBtn}>
              <Text style={[styles.typeBtnText, { color: colors.mutedForeground }]}>Clear</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Text input area */}
      {showTextInput && (
        <View style={[styles.textInputArea, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.textInputSpeakerRow}>
            <Pressable
              onPress={() => setActiveInput("from")}
              style={[styles.speakerChip, activeInput === "from" && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.speakerChipText, { color: activeInput === "from" ? "#fff" : colors.mutedForeground }]}>
                {fromLang.native}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveInput("to")}
              style={[styles.speakerChip, activeInput === "to" && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.speakerChipText, { color: activeInput === "to" ? "#fff" : colors.mutedForeground }]}>
                {toLang.native}
              </Text>
            </Pressable>
          </View>
          <View style={styles.textInputRow}>
            <TextInput
              value={textInput}
              onChangeText={setTextInput}
              placeholder={`Type in ${activeInput === "from" ? fromLang.label : toLang.label}...`}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.textField, { color: colors.text, borderColor: colors.border }]}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleTextSubmit}
            />
            <Pressable
              onPress={handleTextSubmit}
              style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="send" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Conversation */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.chatArea,
          {
            paddingBottom: insets.bottom + WEB_BOTTOM + TAB_BAR + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {conversation.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎙️</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Tap a mic button to start
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Tap YOU to speak {fromLang.label},{"\n"}tap THEM to speak {toLang.label}
            </Text>
            <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.tipsTitle, { color: colors.text }]}>Common uses</Text>
              <Text style={[styles.tipsItem, { color: colors.mutedForeground }]}>
                🏥 Health center — talk to staff
              </Text>
              <Text style={[styles.tipsItem, { color: colors.mutedForeground }]}>
                🏫 School — parent-teacher meeting
              </Text>
              <Text style={[styles.tipsItem, { color: colors.mutedForeground }]}>
                🛒 Market — buying and selling
              </Text>
              <Text style={[styles.tipsItem, { color: colors.mutedForeground }]}>
                🙏 Elders — respectful greetings
              </Text>
            </View>
          </View>
        )}

        {conversation.map((bubble) => {
          const isFrom = bubble.speaker === "from";
          const originalLang = isFrom ? langFrom : langTo;
          const translatedLang = isFrom ? langTo : langFrom;
          return (
            <View
              key={bubble.id}
              style={[styles.bubbleWrapper, isFrom ? styles.bubbleRight : styles.bubbleLeft]}
            >
              {/* Original */}
              <Pressable
                onPress={() => speak(bubble.original, originalLang)}
                style={[
                  styles.bubble,
                  isFrom
                    ? [styles.bubbleFromStyle, { backgroundColor: colors.primary }]
                    : [styles.bubbleToStyle, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }],
                ]}
              >
                <Text style={[styles.bubbleText, { color: isFrom ? "#fff" : colors.text }]}>
                  {bubble.original}
                </Text>
                <Feather
                  name="volume-2"
                  size={10}
                  color={isFrom ? "rgba(255,255,255,0.6)" : colors.mutedForeground}
                  style={{ alignSelf: "flex-end", marginTop: 4 }}
                />
              </Pressable>

              {/* Translation */}
              <Pressable
                onPress={() => speak(bubble.translation, translatedLang)}
                style={[
                  styles.bubble,
                  styles.translationBubble,
                  {
                    backgroundColor: isFrom ? colors.greenBg : colors.muted,
                    borderColor: isFrom ? colors.primary + "44" : colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={[styles.translationLangLabel, { color: colors.mutedForeground }]}>
                  {translatedLang === "amharic" ? "አማርኛ" : translatedLang === "oromo" ? "Oromoo" : "English"}
                </Text>
                <Text style={[styles.translationText, { color: colors.text }]}>
                  {bubble.translation}
                </Text>
                <Feather
                  name="volume-1"
                  size={10}
                  color={colors.mutedForeground}
                  style={{ alignSelf: "flex-end", marginTop: 2 }}
                />
              </Pressable>

              {/* English (when toggled on) */}
              {showEnglish && bubble.englishTranslation && (
                <View
                  style={[
                    styles.bubble,
                    styles.englishBubble,
                    { backgroundColor: "#1A6B9A11", borderColor: "#1A6B9A33", borderWidth: 1 },
                  ]}
                >
                  <Text style={[styles.translationLangLabel, { color: "#1A6B9A" }]}>English</Text>
                  <Text style={[styles.translationText, { color: colors.text }]}>
                    {bubble.englishTranslation}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {translating && (
          <View style={[styles.bubbleWrapper, translating === "from" ? styles.bubbleRight : styles.bubbleLeft]}>
            <View style={[styles.bubble, styles.typingBubble, { backgroundColor: colors.muted }]}>
              <Text style={[styles.typingText, { color: colors.mutedForeground }]}>Translating...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Mic buttons */}
      <View
        style={[
          styles.micBar,
          {
            paddingBottom: insets.bottom + WEB_BOTTOM + TAB_BAR + 8,
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        {/* YOU button */}
        <View style={styles.micSide}>
          <Animated.View
            style={{
              transform: [{ scale: recording === "from" ? pulseAnim : 1 }],
            }}
          >
            <Pressable
              onPress={() => startRecording("from")}
              style={[
                styles.micBtn,
                recording === "from"
                  ? { backgroundColor: "#E74C3C", shadowColor: "#E74C3C", shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } }
                  : { backgroundColor: colors.primary },
              ]}
            >
              <Feather
                name={recording === "from" ? "stop-circle" : "mic"}
                size={24}
                color="#fff"
              />
            </Pressable>
          </Animated.View>
          <Text style={[styles.micLabel, { color: colors.text }]}>
            {recording === "from" ? "● Listening..." : "YOU"}
          </Text>
          <Text style={[styles.micLangLabel, { color: colors.mutedForeground }]}>
            {fromLang.native}
          </Text>
        </View>

        {/* Center divider with swap hint */}
        <View style={styles.micCenter}>
          <Pressable onPress={handleSwap} style={[styles.swapCenterBtn, { backgroundColor: colors.muted }]}>
            <Feather name="repeat" size={14} color={colors.mutedForeground} />
          </Pressable>
          <Text style={[styles.micCenterLabel, { color: colors.mutedForeground }]}>swap</Text>
        </View>

        {/* THEM button */}
        <View style={styles.micSide}>
          <Animated.View
            style={{
              transform: [{ scale: recording === "to" ? pulseAnim : 1 }],
            }}
          >
            <Pressable
              onPress={() => startRecording("to")}
              style={[
                styles.micBtn,
                recording === "to"
                  ? { backgroundColor: "#E74C3C", shadowColor: "#E74C3C", shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } }
                  : [styles.micBtnSecondary, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 2 }],
              ]}
            >
              <Feather
                name={recording === "to" ? "stop-circle" : "mic"}
                size={24}
                color={recording === "to" ? "#fff" : colors.primary}
              />
            </Pressable>
          </Animated.View>
          <Text style={[styles.micLabel, { color: colors.text }]}>
            {recording === "to" ? "● Listening..." : "THEM"}
          </Text>
          <Text style={[styles.micLangLabel, { color: colors.mutedForeground }]}>
            {toLang.native}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
  },
  langPillNative: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  langPillLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
  },
  swapBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  engToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
  },
  engToggleText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  inputToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  typeBtnText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  clearBtn: { paddingHorizontal: 4 },
  textInputArea: {
    padding: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  textInputSpeakerRow: {
    flexDirection: "row",
    gap: 8,
  },
  speakerChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  speakerChipText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  textInputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  textField: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    fontSize: 15,
    maxHeight: 80,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chatArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    paddingTop: 32,
    gap: 8,
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  tipsCard: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  tipsItem: { fontSize: 13, fontFamily: "Inter_400Regular" },
  bubbleWrapper: {
    maxWidth: "85%",
    gap: 4,
  },
  bubbleRight: { alignSelf: "flex-end", alignItems: "flex-end" },
  bubbleLeft: { alignSelf: "flex-start", alignItems: "flex-start" },
  bubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: "100%",
  },
  bubbleFromStyle: {
    borderBottomRightRadius: 4,
  },
  bubbleToStyle: {
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  translationBubble: {
    borderRadius: 12,
  },
  translationLangLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 3,
    fontFamily: "Inter_700Bold",
  },
  translationText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  englishBubble: {
    borderRadius: 10,
  },
  typingBubble: {
    borderRadius: 12,
  },
  typingText: {
    fontSize: 13,
    fontStyle: "italic",
    fontFamily: "Inter_400Regular",
  },
  micBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  micSide: {
    alignItems: "center",
    gap: 6,
  },
  micBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  micBtnSecondary: {},
  micLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "Inter_700Bold",
  },
  micLangLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  micCenter: {
    alignItems: "center",
    gap: 4,
  },
  swapCenterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  micCenterLabel: {
    fontSize: 9,
    letterSpacing: 0.5,
    fontFamily: "Inter_400Regular",
  },
});

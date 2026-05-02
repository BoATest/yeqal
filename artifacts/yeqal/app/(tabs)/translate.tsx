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
import { AppLanguage } from "@/data/types";
import { ALL_WORDS } from "@/data/allWords";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;
const WEB_BOTTOM = Platform.OS === "web" ? 34 : 0;
const TAB_BAR = Platform.OS === "web" ? 84 : 60;

const LANG_OPTIONS: { key: AppLanguage; label: string; short: string; speechCode: string }[] = [
  { key: "amharic", label: "አማርኛ", short: "AM", speechCode: "am-ET" },
  { key: "oromo", label: "Oromo", short: "OM", speechCode: "om" },
  { key: "english", label: "English", short: "EN", speechCode: "en-US" },
];

const LIBRE_LANG: Record<AppLanguage, string> = {
  amharic: "am",
  oromo: "om",
  english: "en",
};

interface SituationPhrase {
  am: string;
  om: string;
  en: string;
}

const SITUATIONS: { id: string; icon: string; label: string; color: string; phrases: SituationPhrase[] }[] = [
  {
    id: "market", icon: "🛒", label: "Market", color: "#C05A1A",
    phrases: [
      { am: "ዋጋው ምን ያህል ነው?", om: "Gatiin isaa meeqa?", en: "How much does this cost?" },
      { am: "ዋጋው ውድ ነው", om: "Gatiin isaa qaalii dha", en: "That is too expensive" },
      { am: "ይህን መግዛት እፈልጋለሁ", om: "Kana bitachuuf barbaada", en: "I want to buy this" },
      { am: "ዝቅ ያድርጉ", om: "Gatii gad-buusi", en: "Please reduce the price" },
      { am: "አመሰግናለሁ", om: "Galatoomi", en: "Thank you" },
    ],
  },
  {
    id: "bus", icon: "🚌", label: "Bus Station", color: "#1A6B9A",
    phrases: [
      { am: "አዲስ አበባ ሚሄደው አውቶቡስ ስንት ነው?", om: "Basi Finfinnee dhaqus meeqa?", en: "How much is the bus to Addis Ababa?" },
      { am: "መቼ ይነሳል?", om: "Yoom ka'a?", en: "When does it depart?" },
      { am: "አንድ ቲኬት ስጠኝ", om: "Tikeetii tokko naaf kenni", en: "Give me one ticket" },
      { am: "ቦታ አለ ወይ?", om: "Teessoon jiraa?", en: "Is there a seat available?" },
      { am: "ስንት ሰዓት ይደርሳል?", om: "Daqiiqaa meeqatti gaha?", en: "What time does it arrive?" },
    ],
  },
  {
    id: "health", icon: "🏥", label: "Health Center", color: "#C0392B",
    phrases: [
      { am: "ሆዴ ያሠኛል", om: "Garaan koo na'a", en: "My stomach hurts" },
      { am: "ሐኪም ማየት እፈልጋለሁ", om: "Dokitara arguuf barbaada", en: "I want to see a doctor" },
      { am: "ሁኔታዬ ምን ያህል ከፋ?", om: "Haalli koo meeqa cimaa?", en: "How serious is my condition?" },
      { am: "መድሃኒቱ ምንድን ነው?", om: "Dawaan isaa maal dha?", en: "What is the medicine?" },
      { am: "ዳግም መምጣት አለብኝ?", om: "Gara deebi'uun qaba?", en: "Do I need to come back?" },
    ],
  },
  {
    id: "elders", icon: "🙏", label: "Meeting Elders", color: "#6B2D9A",
    phrases: [
      { am: "ሰላም ዋሉ", om: "Akkam bultan?", en: "Good afternoon (to elders)" },
      { am: "ጤና ይስጥልኝ", om: "Nagaa jirtuu?", en: "God give you health" },
      { am: "እርስዎ ሁኔታ ምን ይመስላል?", om: "Haalli keessan akkam?", en: "How are you doing?" },
      { am: "ፈቃዶን ይስጡኝ", om: "Hayyama naaf kenni", en: "Please give me your blessing" },
      { am: "አምስ ምን ያህሉ ሰዓት?", om: "Sa'aatii meeqa?", en: "What time is it?" },
    ],
  },
  {
    id: "school", icon: "🏫", label: "School Meeting", color: "#1B6B3A",
    phrases: [
      { am: "ልጄ እንዴት ነው?", om: "Ilmi koo akkam?", en: "How is my child doing?" },
      { am: "ቤት ሥራ ምን ያህል ጊዜ ይወስዳል?", om: "Hojiin mana meeqa sa'aatii fudhata?", en: "How long does homework take?" },
      { am: "ምን ጉዳዮች አሉ?", om: "Rakkoolee maal jiru?", en: "What subjects are there?" },
      { am: "ሚቀጥለው ፈተና መቼ ነው?", om: "Qormaatni itti aanuu yoom?", en: "When is the next exam?" },
      { am: "እኔ ልጄን እንዴት ልረዳ?", om: "Ilma koo akkamittin gargaaruu danda'a?", en: "How can I help my child?" },
    ],
  },
  {
    id: "coffee", icon: "☕", label: "Coffee Ceremony", color: "#D4A017",
    phrases: [
      { am: "ቡና ትጠጣለህ?", om: "Bunaa dhugdaa?", en: "Will you drink coffee?" },
      { am: "ቡናው ጥሩ ነው", om: "Bunaan gaarii dha", en: "The coffee is good" },
      { am: "ስኳር ትፈልጋለህ?", om: "Sukkaara barbaaddaa?", en: "Do you want sugar?" },
      { am: "ጤናዎ ለሰላም", om: "Fayyaan nagaaf", en: "To your health and peace" },
      { am: "ደስ ይበልህ", om: "Gammadi", en: "Enjoy yourself" },
    ],
  },
];

function getLangCode(lang: AppLanguage): string {
  return LIBRE_LANG[lang] ?? "en";
}

function getSpeechCode(lang: AppLanguage): string {
  return LANG_OPTIONS.find((l) => l.key === lang)?.speechCode ?? "en-US";
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

type TransPerson = "A" | "B";

export default function TranslateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [langA, setLangA] = useState<AppLanguage>("amharic");
  const [langB, setLangB] = useState<AppLanguage>("english");
  const [transcriptA, setTranscriptA] = useState("");
  const [translationA, setTranslationA] = useState("");
  const [transcriptB, setTranscriptB] = useState("");
  const [translationB, setTranslationB] = useState("");
  const [recordingPerson, setRecordingPerson] = useState<TransPerson | null>(null);
  const [translatingPerson, setTranslatingPerson] = useState<TransPerson | null>(null);
  const [noSpeechSupport, setNoSpeechSupport] = useState(false);
  const [micError, setMicError] = useState<Partial<Record<TransPerson, string>>>({});
  const [selectedSit, setSelectedSit] = useState<string | null>(null);
  const [speakingPhrase, setSpeakingPhrase] = useState<string | null>(null);

  const activeRec = useRef<any>(null);
  const barAnimsA = useRef(Array.from({ length: 5 }, () => new Animated.Value(0.3))).current;
  const barAnimsB = useRef(Array.from({ length: 5 }, () => new Animated.Value(0.3))).current;
  const waveAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      setNoSpeechSupport(true);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setNoSpeechSupport(true);
  }, []);

  const startWave = (bars: Animated.Value[]) => {
    stopWave();
    const anim = Animated.loop(
      Animated.stagger(
        80,
        bars.map((b) =>
          Animated.sequence([
            Animated.timing(b, { toValue: 0.9, duration: 300, useNativeDriver: false }),
            Animated.timing(b, { toValue: 0.3, duration: 300, useNativeDriver: false }),
          ])
        )
      )
    );
    anim.start();
    waveAnimRef.current = anim;
  };

  const stopWave = () => {
    if (waveAnimRef.current) waveAnimRef.current.stop();
    [...barAnimsA, ...barAnimsB].forEach((b) =>
      Animated.timing(b, { toValue: 0.3, duration: 200, useNativeDriver: false }).start()
    );
  };

  const speakText = (text: string, lang: AppLanguage, phraseKey?: string) => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (phraseKey) setSpeakingPhrase(phraseKey);
    const utt = new window.SpeechSynthesisUtterance(text);
    utt.lang = getSpeechCode(lang);
    utt.pitch = 1;
    utt.rate = 0.85;
    utt.onend = () => setSpeakingPhrase(null);
    window.speechSynthesis.speak(utt);
  };

  const translateText = async (text: string, from: TransPerson) => {
    const srcLang = from === "A" ? langA : langB;
    const tgtLang = from === "A" ? langB : langA;
    setTranslatingPerson(from);

    // Step 1: local word lookup
    const local = findLocalTranslation(text, srcLang, tgtLang);
    if (local) {
      if (from === "A") setTranslationA(local);
      else setTranslationB(local);
      speakText(local, tgtLang);
      setTranslatingPerson(null);
      return;
    }

    // Step 2: LibreTranslate
    try {
      const res = await fetch("https://libretranslate.com/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: getLangCode(srcLang),
          target: getLangCode(tgtLang),
          api_key: "",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const translated = data.translatedText ?? "";
        if (translated && translated !== text) {
          if (from === "A") setTranslationA(translated);
          else setTranslationB(translated);
          speakText(translated, tgtLang);
          setTranslatingPerson(null);
          return;
        }
      }
    } catch {
      // fall through
    }

    // Fallback
    const fallback = `"${text}" — Full translation coming soon`;
    if (from === "A") setTranslationA(fallback);
    else setTranslationB(fallback);
    setTranslatingPerson(null);
  };

  const startRecording = (person: TransPerson) => {
    if (noSpeechSupport) return;
    setMicError((prev) => ({ ...prev, [person]: undefined }));
    if (recordingPerson) {
      stopRecording();
      return;
    }
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const lang = person === "A" ? langA : langB;
    const rec = new SR();
    rec.lang = getSpeechCode(lang);
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => {
      setRecordingPerson(person);
      startWave(person === "A" ? barAnimsA : barAnimsB);
    };

    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join("");
      if (person === "A") setTranscriptA(transcript);
      else setTranscriptB(transcript);

      if (e.results[e.results.length - 1].isFinal) {
        translateText(transcript, person);
      }
    };

    rec.onend = () => {
      setRecordingPerson(null);
      stopWave();
    };

    rec.onerror = (e: any) => {
      setRecordingPerson(null);
      stopWave();
      const errCode = e?.error ?? "";
      const msg =
        errCode === "not-allowed"
          ? "Microphone access denied — tap to enable in browser settings"
          : errCode === "no-speech"
          ? "No speech detected — tap to try again"
          : errCode === "network"
          ? "Network error — check your connection and tap to retry"
          : "Microphone not working — tap here to try again";
      setMicError((prev) => ({ ...prev, [person]: msg }));
    };

    activeRec.current = rec;
    try {
      rec.start();
    } catch {
      setRecordingPerson(null);
    }
  };

  const stopRecording = () => {
    if (activeRec.current) {
      try { activeRec.current.stop(); } catch { /* ignore */ }
      activeRec.current = null;
    }
    setRecordingPerson(null);
    stopWave();
  };

  const swapLanguages = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const tmp = langA;
    setLangA(langB);
    setLangB(tmp);
    setTranscriptA("");
    setTranslationA("");
    setTranscriptB("");
    setTranslationB("");
  };

  const clearAll = () => {
    setTranscriptA("");
    setTranslationA("");
    setTranscriptB("");
    setTranslationB("");
    setSelectedSit(null);
  };

  const activeSituation = SITUATIONS.find((s) => s.id === selectedSit);

  const renderPerson = (person: TransPerson) => {
    const lang = person === "A" ? langA : langB;
    const setLang = person === "A" ? setLangA : setLangB;
    const transcript = person === "A" ? transcriptA : transcriptB;
    const translation = person === "A" ? translationA : translationB;
    const bars = person === "A" ? barAnimsA : barAnimsB;
    const isRec = recordingPerson === person;
    const isTrans = translatingPerson === person;
    const bgColor = person === "A" ? colors.greenBg : colors.blueBg;
    const accentColor = person === "A" ? colors.primary : colors.blue;

    return (
      <View style={[styles.panel, { backgroundColor: bgColor }]}>
        {/* Lang pills */}
        <View style={styles.langPills}>
          {LANG_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => setLang(opt.key)}
              style={[
                styles.langPill,
                {
                  backgroundColor:
                    lang === opt.key ? accentColor : colors.card,
                  borderColor: lang === opt.key ? accentColor : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.langPillText,
                  { color: lang === opt.key ? "#fff" : colors.text },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Transcript & translation */}
        <View style={styles.textArea}>
          {transcript ? (
            <Text style={[styles.transcriptText, { color: colors.mutedForeground }]} numberOfLines={2}>
              {transcript}
            </Text>
          ) : (
            <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
              {isRec ? "Listening..." : "Tap the mic to speak"}
            </Text>
          )}
          {isTrans && (
            <Text style={[styles.translatingText, { color: accentColor }]}>
              Translating...
            </Text>
          )}
          {translation && !isTrans && (
            <Text style={[styles.translationText, { color: colors.text }]}>
              {translation}
            </Text>
          )}
        </View>

        {/* Mic error banner — tap to retry */}
        {micError[person] && (
          <Pressable
            onPress={() => startRecording(person)}
            style={styles.micErrorBanner}
          >
            <Feather name="alert-circle" size={14} color="#DC2626" />
            <Text style={styles.micErrorText}>{micError[person]}</Text>
          </Pressable>
        )}

        {/* Waveform + mic button */}
        <View style={styles.micRow}>
          {isRec && (
            <View style={styles.waveform}>
              {bars.map((b, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      backgroundColor: accentColor,
                      transform: [{ scaleY: b }],
                    },
                  ]}
                />
              ))}
            </View>
          )}
          <Pressable
            onPress={() => startRecording(person)}
            style={[
              styles.micBtn,
              {
                backgroundColor: isRec ? colors.destructive : accentColor,
              },
            ]}
          >
            <Feather
              name={isRec ? "square" : "mic"}
              size={22}
              color="#fff"
            />
          </Pressable>
          {translation ? (
            <Pressable
              onPress={() => speakText(translation, person === "A" ? langB : langA)}
              style={[styles.speakBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Feather name="volume-2" size={18} color={accentColor} />
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + WEB_TOP + 16,
          paddingBottom: insets.bottom + WEB_BOTTOM + TAB_BAR + 32,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Live Translator</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Speak any language — hear it in another
            </Text>
          </View>
          {(transcriptA || transcriptB) && (
            <Pressable onPress={clearAll} style={[styles.clearBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* No speech support */}
        {noSpeechSupport && (
          <View style={[styles.noSupport, { backgroundColor: colors.goldBg, borderColor: colors.gold + "40" }]}>
            <Feather name="alert-circle" size={18} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.noSupportTitle, { color: colors.text }]}>
                Voice recognition not available
              </Text>
              <Text style={[styles.noSupportDesc, { color: colors.mutedForeground }]}>
                Use Chrome or Edge browser for voice features. You can still use the phrase cards below.
              </Text>
            </View>
          </View>
        )}

        {/* Two-panel translator */}
        <View style={styles.panels}>
          {renderPerson("A")}

          {/* Divider with swap */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={swapLanguages}
              style={[styles.swapBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Feather name="refresh-cw" size={20} color={colors.primary} />
            </Pressable>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {renderPerson("B")}
        </View>

        {/* Situation cards */}
        <View style={[styles.situationsSection, { paddingHorizontal: 20 }]}>
          <Text style={[styles.sitLabel, { color: colors.mutedForeground }]}>
            COMMON SITUATIONS
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sitScroll}>
            {SITUATIONS.map((sit) => (
              <Pressable
                key={sit.id}
                onPress={() => {
                  setSelectedSit(selectedSit === sit.id ? null : sit.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.sitChip,
                  {
                    backgroundColor:
                      selectedSit === sit.id ? colors.primary : colors.card,
                    borderColor:
                      selectedSit === sit.id ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={styles.sitChipIcon}>{sit.icon}</Text>
                <Text
                  style={[
                    styles.sitChipLabel,
                    { color: selectedSit === sit.id ? "#fff" : colors.text },
                  ]}
                >
                  {sit.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Phrase list */}
          {activeSituation && (
            <View
              style={[
                styles.phraseList,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.phraseListTitle, { color: colors.text }]}>
                {activeSituation.icon} {activeSituation.label} phrases
              </Text>
              {activeSituation.phrases.map((phrase, idx) => {
                const phraseText =
                  langA === "amharic"
                    ? phrase.am
                    : langA === "oromo"
                    ? phrase.om
                    : phrase.en;
                const key = `${activeSituation.id}-${idx}`;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.phraseRow,
                      {
                        borderTopColor: colors.border,
                        borderTopWidth: idx > 0 ? 1 : 0,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.phraseAm, { color: colors.text }]}>
                        {phrase.am}
                      </Text>
                      <Text style={[styles.phraseEn, { color: colors.mutedForeground }]}>
                        {phrase.en}
                      </Text>
                      {phrase.om && (
                        <Text style={[styles.phraseOm, { color: colors.mutedForeground }]}>
                          {phrase.om}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => speakText(phraseText, langA, key)}
                      style={[
                        styles.phraseSpeakBtn,
                        {
                          backgroundColor:
                            speakingPhrase === key
                              ? colors.primary
                              : colors.greenBg,
                        },
                      ]}
                    >
                      <Feather
                        name={speakingPhrase === key ? "volume-2" : "play"}
                        size={16}
                        color={
                          speakingPhrase === key
                            ? "#fff"
                            : colors.primary
                        }
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  noSupport: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  noSupportTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  noSupportDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 16 },
  panels: { gap: 0 },
  panel: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    minHeight: 160,
  },
  langPills: { flexDirection: "row", gap: 8 },
  langPill: {
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  langPillText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  textArea: {
    flex: 1,
    minHeight: 60,
    gap: 6,
  },
  placeholderText: { fontSize: 14, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  transcriptText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  translatingText: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  translationText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    lineHeight: 25,
  },
  micRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flex: 1,
    height: 40,
  },
  waveBar: { width: 4, height: 32, borderRadius: 2 },
  micBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  speakBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1 },
  swapBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  situationsSection: { marginTop: 20 },
  sitLabel: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginBottom: 10,
  },
  sitScroll: { marginBottom: 14 },
  sitChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  sitChipIcon: { fontSize: 16 },
  sitChipLabel: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  phraseList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  phraseListTitle: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    padding: 14,
  },
  phraseRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  phraseAm: { fontSize: 16, fontWeight: "600", lineHeight: 22 },
  phraseEn: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  phraseOm: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1, fontStyle: "italic" },
  phraseSpeakBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  micErrorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  micErrorText: {
    flex: 1,
    fontSize: 12,
    color: "#DC2626",
    fontFamily: "Inter_600SemiBold",
    lineHeight: 17,
  },
});

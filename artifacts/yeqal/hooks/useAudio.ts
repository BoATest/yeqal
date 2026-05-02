import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Speech from "expo-speech";

export type AudioLang = "am" | "om" | "en";

function getSpeechLang(code: AudioLang): string {
  switch (code) {
    case "am": return "am";
    case "om": return "om";
    case "en": return "en-US";
  }
}

export function useAudio() {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentKeyRef = useRef<string | null>(null);

  const speak = useCallback((text: string, lang: AudioLang, key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Native: expo-speech (works fully offline, no API key needed)
    if (Platform.OS !== "web") {
      Speech.stop();
      currentKeyRef.current = key;
      setPlayingKey(key);
      Speech.speak(text, {
        language: getSpeechLang(lang),
        rate: 0.82,
        pitch: 1.0,
        onDone: () => { if (currentKeyRef.current === key) setPlayingKey(null); },
        onError: () => { if (currentKeyRef.current === key) setPlayingKey(null); },
      });
      return;
    }

    // Web: Web Speech Synthesis API (offline, runs in browser)
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setPlayingKey(key);
      timeoutRef.current = setTimeout(() => setPlayingKey(null), 1800);
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = getSpeechLang(lang);
    utter.rate = 0.82;
    utter.volume = 0.85;
    utter.pitch = 1;
    utter.onstart = () => setPlayingKey(key);
    utter.onend = () => setPlayingKey(null);
    utter.onerror = () => setPlayingKey(null);
    utterRef.current = utter;
    setPlayingKey(key);
    window.speechSynthesis.speak(utter);
  }, []);

  const stop = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (Platform.OS !== "web") {
      Speech.stop();
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingKey(null);
    currentKeyRef.current = null;
  }, []);

  return { speak, stop, playingKey };
}

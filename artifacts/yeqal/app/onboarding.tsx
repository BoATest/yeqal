import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const WEB_TOP = Platform.OS === "web" ? 67 : 0;
const WEB_BOTTOM = Platform.OS === "web" ? 34 : 0;

const SLIDES = [
  {
    gradient: ["#1C1C2E", "#2D1F44"] as [string, string],
    icon: "alert-circle" as const,
    iconColor: "#F5C842",
    title: "Your child has homework.",
    subtitle: "You don't speak the language.",
    body: "You've been there. Every Ethiopian parent has. Staring at a page of Amharic or Oromo, unable to help.",
    accent: "#F5C842",
  },
  {
    gradient: ["#1A0E0E", "#2E1A1A"] as [string, string],
    icon: "smartphone" as const,
    iconColor: "#E74C3C",
    title: "You downloaded 3 apps.",
    subtitle: "None of them helped.",
    body: "Wrong translations. No audio. Last updated in 2011. You ended up calling the neighbor at 9pm.",
    accent: "#E74C3C",
  },
  {
    gradient: ["#0A2E18", "#1B6B3A"] as [string, string],
    icon: "volume-2" as const,
    iconColor: "#F5C842",
    title: "No more calling the neighbor.",
    subtitle: "ያቃል — It speaks.",
    body: "Yeqal speaks Amharic, Afaan Oromo, and English — so you can help your child with homework any time, any night.",
    accent: "#F5C842",
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goToSlide = (index: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.3, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setCurrentSlide(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      router.replace("/auth");
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <LinearGradient colors={slide.gradient} style={styles.container}>
      <View
        style={[
          styles.inner,
          {
            paddingTop: insets.top + WEB_TOP + 24,
            paddingBottom: insets.bottom + WEB_BOTTOM + 32,
          },
        ]}
      >
        {/* Skip button */}
        <Pressable
          onPress={() => router.replace("/auth")}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Icon */}
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: slide.accent + "22", borderColor: slide.accent + "44" },
            ]}
          >
            <Feather name={slide.icon} size={48} color={slide.iconColor} />
          </View>

          {/* Yeqal label */}
          <View style={styles.brandRow}>
            <Text style={[styles.brandText, { color: slide.accent }]}>
              ያቃል Yeqal
            </Text>
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={[styles.subtitle, { color: slide.accent }]}>
            {slide.subtitle}
          </Text>
          <Text style={styles.body}>{slide.body}</Text>
        </Animated.View>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <Pressable key={i} onPress={() => goToSlide(i)}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === currentSlide ? slide.accent : "#FFFFFF40",
                    width: i === currentSlide ? 24 : 8,
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>

        {/* Button */}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: slide.accent, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.btnText}>
            {currentSlide === SLIDES.length - 1
              ? "Get Started — Free"
              : "Continue"}
          </Text>
          <Feather name="arrow-right" size={18} color="#000" />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: "space-between" },
  skipBtn: { alignSelf: "flex-end" },
  skipText: {
    color: "#FFFFFF80",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  content: { flex: 1, justifyContent: "center", alignItems: "flex-start" },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  brandRow: { marginBottom: 12 },
  brandText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "Inter_700Bold",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 42,
    marginBottom: 8,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    fontFamily: "Inter_600SemiBold",
  },
  body: {
    fontSize: 16,
    color: "#FFFFFFCC",
    lineHeight: 26,
    fontFamily: "Inter_400Regular",
  },
  dotsRow: { flexDirection: "row", gap: 6, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4 },
  btn: {
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    fontFamily: "Inter_700Bold",
  },
});

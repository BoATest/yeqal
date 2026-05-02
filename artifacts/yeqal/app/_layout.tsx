import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { AppProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav({ onboarded }: { onboarded: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!onboarded) {
      router.replace("/onboarding");
    }
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="setup" options={{ headerShown: false }} />
      <Stack.Screen
        name="word/[id]"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="flashcard"
        options={{ headerShown: false, animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("yeqal_onboarded").then((val) => {
      setOnboarded(!!val);
    });
  }, []);

  // Inject Noto Sans Ethiopic for web — critical for Ge'ez script rendering
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    if (document.getElementById("yeqal-ethiopic-font")) return;
    const link = document.createElement("link");
    link.id = "yeqal-ethiopic-font";
    link.rel = "preload";
    link.setAttribute("as", "style");
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;700&display=swap";
    document.head.appendChild(link);
    const linkActual = document.createElement("link");
    linkActual.id = "yeqal-ethiopic-font-actual";
    linkActual.rel = "stylesheet";
    linkActual.href = link.href;
    document.head.appendChild(linkActual);
    // Fallback font-face for Ethiopic codepoints only — does not override Inter
    const style = document.createElement("style");
    style.id = "yeqal-ethiopic-style";
    style.textContent = `
      @font-face {
        font-family: 'YeqalEthiopic';
        src: local('Noto Sans Ethiopic');
        unicode-range: U+1200-137F, U+1380-139F, U+2D80-2DDF, U+AB00-AB2F;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const isReady = (fontsLoaded || !!fontError) && onboarded !== null;

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <OfflineBanner />
              <KeyboardProvider>
                <RootLayoutNav onboarded={onboarded ?? false} />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ErrorBoundary>
      </AppProvider>
    </SafeAreaProvider>
  );
}

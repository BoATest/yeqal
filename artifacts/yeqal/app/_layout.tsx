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
import { supabase } from "@/lib/supabase";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

type AuthState = "loading" | "onboarding" | "auth" | "setup" | "app";

function RootLayoutNav({ authState }: { authState: AuthState }) {
  const router = useRouter();

  useEffect(() => {
    if (authState === "loading") return;
    if (authState === "onboarding") router.replace("/onboarding");
    else if (authState === "auth") router.replace("/auth");
    else if (authState === "setup") router.replace("/setup");
    else if (authState === "app") router.replace("/(tabs)");
  }, [authState]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
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

  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    async function determineAuthState() {
      try {
        const [onboarded, skipped] = await Promise.all([
          AsyncStorage.getItem("yeqal_onboarded"),
          AsyncStorage.getItem("yeqal_auth_skipped"),
        ]);

        if (!onboarded) {
          setAuthState("onboarding");
          return;
        }

        if (skipped) {
          setAuthState("app");
          return;
        }

        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            setAuthState("app");
            return;
          }
        }

        setAuthState("auth");
      } catch {
        setAuthState("auth");
      }
    }
    determineAuthState();
  }, []);

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

  const isReady = (fontsLoaded || !!fontError) && authState !== "loading";

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
                <RootLayoutNav authState={authState} />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ErrorBoundary>
      </AppProvider>
    </SafeAreaProvider>
  );
}

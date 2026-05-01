import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function OfflineBanner() {
  const colors = useColors();
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-52)).current;

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    setIsOffline(!navigator.onLine);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOffline ? 0 : -52,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();
  }, [isOffline]);

  if (Platform.OS !== "web") return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: colors.destructive, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Feather name="wifi-off" size={14} color="#fff" />
      <Text style={styles.text}>
        You are offline — showing saved content
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  text: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});

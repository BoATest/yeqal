import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import WordCard from "@/components/WordCard";
import { WORDS, searchWords } from "@/data/words";
import { AppLanguage } from "@/data/types";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;
const TAB_BAR = Platform.OS === "web" ? 84 : 60;
const WEB_BOTTOM = Platform.OS === "web" ? 34 : 0;

const LANG_PILLS: { key: AppLanguage | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "amharic", label: "አማርኛ" },
  { key: "oromo", label: "Oromo" },
  { key: "english", label: "English" },
];

const SUBJECTS = [
  "all",
  "family",
  "food",
  "school",
  "nature",
  "animals",
  "greetings",
  "numbers",
];

export default function SearchScreen() {
  const colors = useColors();
  const { isFavorite } = useApp();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<AppLanguage | "all">("all");
  const [subject, setSubject] = useState("all");

  const results = (() => {
    let words = searchWords(query, lang === "all" ? "all" : lang);
    if (subject !== "all") {
      words = words.filter((w) => w.subject === subject);
    }
    return words;
  })();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: insets.top + WEB_TOP + 12,
          },
        ]}
      >
        <View
          style={[
            styles.inputRow,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search Amharic · Oromo · English..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.text }]}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Language pills */}
        <FlatList
          horizontal
          data={LANG_PILLS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
          renderItem={({ item }) => {
            const active = lang === item.key;
            return (
              <Pressable
                onPress={() => setLang(item.key)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: active
                      ? colors.primary
                      : colors.muted,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: active ? "#fff" : colors.mutedForeground },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Subject filter */}
      <FlatList
        horizontal
        data={SUBJECTS}
        keyExtractor={(s) => s}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subjectRow}
        renderItem={({ item: s }) => {
          const active = subject === s;
          return (
            <Pressable
              onPress={() => setSubject(s)}
              style={[
                styles.subjectPill,
                {
                  backgroundColor: active ? colors.accent + "22" : "transparent",
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.subjectText,
                  { color: active ? colors.accent : colors.mutedForeground },
                ]}
              >
                {s === "all" ? "All topics" : s}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(w) => w.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: insets.bottom + WEB_BOTTOM + TAB_BAR + 24,
        }}
        renderItem={({ item }) => (
          <WordCard word={item} isFavorite={isFavorite(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No words found
            </Text>
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground }]}
            >
              Try searching in Amharic, Oromo, or English
            </Text>
          </View>
        }
        ListHeaderComponent={
          results.length > 0 ? (
            <Text
              style={[styles.resultCount, { color: colors.mutedForeground }]}
            >
              {results.length} word{results.length !== 1 ? "s" : ""}
              {query ? ` for "${query}"` : ""}
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  pillsRow: { gap: 8, paddingBottom: 12 },
  pill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  subjectRow: { gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  subjectPill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    fontFamily: "Inter_600SemiBold",
  },
  resultCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 10,
    marginTop: 4,
  },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    maxWidth: 240,
  },
});

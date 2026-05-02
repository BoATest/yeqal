import { Word, Subject } from "./types";
import { WORDS } from "./words";
import { ethioLangSeedDictionary } from "./ethiolang";
import { ethioLangBatch2 } from "./ethiolangBatch2";

const CATEGORY_TO_SUBJECT: Record<string, Subject> = {
  "Greetings & Courtesy": "greetings",
  "People & Family": "family",
  "Food & Drink": "food",
  "Market & Money": "economy",
  "School & Learning": "school",
  "Numbers": "numbers",
  "Colors & Descriptions": "colors",
  "Nature & Animals": "nature",
  "Home & Objects": "general",
  "Hotel & Travel": "general",
  "Transport & Directions": "general",
  "Time & Calendar": "time",
  "Common Verbs": "verbs",
  "Useful Phrases": "greetings",
  "Emergency & Health": "body",
  "Technology": "science",
  "Culture & Religion": "abstract",
  "Places": "geography",
  "Tourism & Ethiopia": "general",
  "App UI Labels": "general",
};

const DIFFICULTY_TO_GRADE: Record<string, number> = {
  beginner: 1,
  intermediate: 3,
  advanced: 6,
};

const ethiolangAsWords: Word[] = ethioLangSeedDictionary.map((e) => ({
  id: e.id,
  amharic: e.amharic,
  oromo: e.afaanOromo,
  english: e.english,
  romanization: e.amharicTranslit,
  pos: "noun" as const,
  gradeLevel: DIFFICULTY_TO_GRADE[e.difficulty] ?? 1,
  subject: CATEGORY_TO_SUBJECT[e.category] ?? "general",
  exampleEnglish: e.exampleEn,
}));

const existingEnglish = new Set(WORDS.map((w) => w.english.toLowerCase()));
const uniqueEthiolang = ethiolangAsWords.filter(
  (w) => !existingEnglish.has(w.english.toLowerCase())
);

const allExistingEnglish = new Set([
  ...WORDS.map((w) => w.english.toLowerCase()),
  ...uniqueEthiolang.map((w) => w.english.toLowerCase()),
]);
const uniqueBatch2 = ethioLangBatch2.filter(
  (w) => !allExistingEnglish.has(w.english.toLowerCase())
);

export const ALL_WORDS: Word[] = [...WORDS, ...uniqueEthiolang, ...uniqueBatch2];

export const ALL_SUBJECTS: { key: Subject | "all"; label: string; emoji: string }[] = [
  { key: "all", label: "All Topics", emoji: "📚" },
  { key: "greetings", label: "Greetings", emoji: "👋" },
  { key: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { key: "food", label: "Food & Drink", emoji: "🍽️" },
  { key: "economy", label: "Market & Money", emoji: "💰" },
  { key: "school", label: "School", emoji: "🏫" },
  { key: "body", label: "Health", emoji: "🏥" },
  { key: "general", label: "Travel", emoji: "✈️" },
  { key: "science", label: "Technology", emoji: "📱" },
  { key: "time", label: "Time", emoji: "🕐" },
  { key: "nature", label: "Nature", emoji: "🌿" },
  { key: "numbers", label: "Numbers", emoji: "🔢" },
  { key: "verbs", label: "Verbs", emoji: "⚡" },
  { key: "geography", label: "Places", emoji: "🗺️" },
  { key: "abstract", label: "Culture", emoji: "🎭" },
];

export function searchAllWords(
  query: string,
  lang: "amharic" | "oromo" | "english" | "all" = "all"
): Word[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_WORDS;
  return ALL_WORDS.filter((w) => {
    if (lang === "all" || lang === "amharic")
      if (
        w.amharic.includes(q) ||
        w.romanization?.toLowerCase().includes(q) ||
        w.definitionAmharic?.includes(q) ||
        w.exampleAmharic?.includes(q)
      )
        return true;
    if (lang === "all" || lang === "oromo")
      if (
        w.oromo.toLowerCase().includes(q) ||
        w.definitionOromo?.toLowerCase().includes(q) ||
        w.exampleOromo?.toLowerCase().includes(q)
      )
        return true;
    if (lang === "all" || lang === "english")
      if (
        w.english.toLowerCase().includes(q) ||
        w.definitionEnglish?.toLowerCase().includes(q) ||
        w.exampleEnglish?.toLowerCase().includes(q)
      )
        return true;
    return false;
  });
}

export function getWordFromAll(id: string): Word | undefined {
  return ALL_WORDS.find((w) => w.id === id);
}

export default ALL_WORDS;

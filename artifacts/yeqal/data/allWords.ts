import { Word, Subject } from "./types";
import { WORDS } from "./words";
import { ethioLangSeedDictionary } from "./ethiolang";

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
  "Useful Phrases": "general",
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

// Merge: existing detailed words take precedence, then ethiolang words (skip duplicates by English)
const existingEnglish = new Set(WORDS.map((w) => w.english.toLowerCase()));
const uniqueEthiolang = ethiolangAsWords.filter(
  (w) => !existingEnglish.has(w.english.toLowerCase())
);

export const ALL_WORDS: Word[] = [...WORDS, ...uniqueEthiolang];

export default ALL_WORDS;

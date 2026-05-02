export type POS = "noun" | "verb" | "adjective" | "adverb" | "phrase";
export type Subject =
  | "general"
  | "family"
  | "food"
  | "school"
  | "nature"
  | "animals"
  | "greetings"
  | "numbers"
  | "body"
  | "time"
  | "verbs"
  | "colors"
  | "shapes"
  | "clothes"
  | "weather"
  | "actions"
  | "math"
  | "geography"
  | "history"
  | "science"
  | "abstract"
  | "economy"
  | "community";

export type AppLanguage = "amharic" | "oromo" | "english";
export type UserRole = "parent" | "student" | "teacher" | "diaspora";
export type SkillKey = "speaking" | "listening" | "reading" | "writing";

export interface Word {
  id: string;
  amharic: string;
  oromo: string;
  english: string;
  romanization?: string;
  pos: POS;
  gradeLevel: number;
  subject: Subject;
  definitionEnglish?: string;
  definitionAmharic?: string;
  definitionOromo?: string;
  exampleAmharic?: string;
  exampleOromo?: string;
  exampleEnglish?: string;
}

export interface Child {
  id: string;
  name: string;
  gradeLevel: number;
  learningLanguage: AppLanguage;
  schoolName?: string;
  initials: string;
  avatar: string;
  streak: number;
  xp: number;
  skills: Record<SkillKey, number>;
}

export interface HomeworkSession {
  id: string;
  timestamp: string;
  inputText: string;
  wordIds: string[];
}

export interface UserProfile {
  name: string;
  role: UserRole;
  uiLanguage: AppLanguage;
  learningLanguage: AppLanguage;
  isPremium: boolean;
  streak: number;
  xp: number;
  children: Child[];
  favorites: string[];
  learnedWords: string[];
}

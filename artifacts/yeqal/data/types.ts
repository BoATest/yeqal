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
  | "verbs";
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
  initials: string;
  streak: number;
  xp: number;
  skills: Record<SkillKey, number>;
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

import { Word } from "@/data/types";
import { ALL_WORDS } from "@/data/allWords";
import { supabase, isSupabaseConfigured } from "./supabase";

export async function fetchWords(): Promise<Word[]> {
  if (!isSupabaseConfigured) return ALL_WORDS;
  try {
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .limit(2000);
    if (error || !data || data.length === 0) return ALL_WORDS;
    const remote: Word[] = data.map((r: any) => ({
      id: r.id,
      english: r.english,
      amharic: r.amharic,
      oromo: r.oromo,
      romanization: r.romanization ?? undefined,
      pos: r.pos ?? "noun",
      gradeLevel: r.grade_level ?? 1,
      subject: r.subject ?? "general",
      definitionEnglish: r.definition_en ?? undefined,
      exampleEnglish: r.example_en ?? undefined,
    }));
    return remote;
  } catch {
    return ALL_WORDS;
  }
}

export async function saveSession(params: {
  deviceId: string;
  childId?: string;
  childName?: string;
  gradeLevel?: number;
  inputText: string;
  wordIds: string[];
}): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from("sessions").insert({
      device_id: params.deviceId,
      child_id: params.childId ?? null,
      child_name: params.childName ?? null,
      grade_level: params.gradeLevel ?? null,
      input_text: params.inputText,
      word_ids: params.wordIds,
    });
  } catch {
    // silent — local AsyncStorage is the fallback
  }
}

export async function upsertProfile(params: {
  deviceId: string;
  name: string;
  role: string;
  uiLanguage: string;
  learningLanguage: string;
  isPremium: boolean;
  streak: number;
  xp: number;
  favorites: string[];
  learnedWords: string[];
}): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from("profiles").upsert({
      device_id: params.deviceId,
      name: params.name,
      role: params.role,
      ui_language: params.uiLanguage,
      learning_language: params.learningLanguage,
      is_premium: params.isPremium,
      streak: params.streak,
      xp: params.xp,
      favorites: params.favorites,
      learned_words: params.learnedWords,
      updated_at: new Date().toISOString(),
    }, { onConflict: "device_id" });
  } catch {
    // silent
  }
}

export async function upsertChildren(deviceId: string, children: any[]): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const rows = children.map((c) => ({
      id: c.id,
      device_id: deviceId,
      name: c.name,
      grade_level: c.gradeLevel,
      learning_language: c.learningLanguage ?? "amharic",
      school_name: c.schoolName ?? null,
      initials: c.initials,
      avatar: c.avatar ?? "👦",
      streak: c.streak ?? 0,
      xp: c.xp ?? 0,
      skill_speaking: c.skills?.speaking ?? 0,
      skill_listening: c.skills?.listening ?? 0,
      skill_reading: c.skills?.reading ?? 0,
      skill_writing: c.skills?.writing ?? 0,
      updated_at: new Date().toISOString(),
    }));
    await supabase.from("children").upsert(rows, { onConflict: "id" });
  } catch {
    // silent
  }
}

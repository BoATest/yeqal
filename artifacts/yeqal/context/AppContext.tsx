import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { AppLanguage, Child, HomeworkSession, UserProfile, UserRole } from "@/data/types";

const STORAGE_KEY = "yeqal_profile_v3";
const SESSIONS_KEY = "yeqal_homework_sessions";
const ACTIVE_CHILD_KEY = "yeqal_active_child";

const DEFAULT_CHILD: Child = {
  id: "c1",
  name: "Liya",
  gradeLevel: 4,
  learningLanguage: "amharic",
  initials: "LI",
  avatar: "👧",
  streak: 7,
  xp: 280,
  skills: { speaking: 62, listening: 75, reading: 58, writing: 44 },
};

const DEFAULT_PROFILE: UserProfile = {
  name: "Selam",
  role: "parent",
  uiLanguage: "amharic",
  learningLanguage: "amharic",
  isPremium: false,
  streak: 7,
  xp: 450,
  children: [DEFAULT_CHILD],
  favorites: ["w001", "w013", "w032"],
  learnedWords: ["w007", "w009", "w010", "w011", "w022", "w023"],
};

interface AppContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  activeChildId: string | null;
  activeChild: Child | null;
  setActiveChildId: (id: string) => void;
  setProfile: (p: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setRole: (role: UserRole) => void;
  setLearningLanguage: (lang: AppLanguage) => void;
  setName: (name: string) => void;
  toggleFavorite: (wordId: string) => void;
  markLearned: (wordId: string) => void;
  addChild: (child: Child) => void;
  removeChild: (childId: string) => void;
  isFavorite: (wordId: string) => boolean;
  isLearned: (wordId: string) => boolean;
  addXP: (amount: number) => void;
  searchLanguage: AppLanguage;
  setSearchLanguage: (lang: AppLanguage) => void;
  saveHomeworkSession: (session: HomeworkSession) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children: node }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchLanguage, setSearchLanguage] = useState<AppLanguage>("english");
  const [activeChildId, setActiveChildIdState] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(ACTIVE_CHILD_KEY),
    ]).then(([stored, savedActiveId]) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Migrate old profiles
          if (parsed.children) {
            parsed.children = parsed.children.map((c: Child) => ({
              ...c,
              avatar: c.avatar ?? "👦",
              learningLanguage: c.learningLanguage ?? "amharic",
            }));
          }
          setProfileState(parsed);
          const firstId = parsed.children?.[0]?.id ?? null;
          setActiveChildIdState(savedActiveId ?? firstId);
        } catch {
          setProfileState(DEFAULT_PROFILE);
          setActiveChildIdState(DEFAULT_CHILD.id);
        }
      } else {
        setProfileState(DEFAULT_PROFILE);
        setActiveChildIdState(DEFAULT_CHILD.id);
      }
      setIsLoading(false);
    });
  }, []);

  const save = async (p: UserProfile) => {
    setProfileState(p);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  };

  const setProfile = (p: UserProfile) => save(p);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return;
    save({ ...profile, ...updates });
  };

  const setRole = (role: UserRole) => updateProfile({ role });
  const setLearningLanguage = (lang: AppLanguage) =>
    updateProfile({ learningLanguage: lang });
  const setName = (name: string) => updateProfile({ name });

  const setActiveChildId = (id: string) => {
    setActiveChildIdState(id);
    AsyncStorage.setItem(ACTIVE_CHILD_KEY, id);
  };

  const toggleFavorite = (wordId: string) => {
    if (!profile) return;
    const favorites = profile.favorites.includes(wordId)
      ? profile.favorites.filter((id) => id !== wordId)
      : [...profile.favorites, wordId];
    save({ ...profile, favorites });
  };

  const markLearned = (wordId: string) => {
    if (!profile) return;
    if (profile.learnedWords.includes(wordId)) return;
    save({ ...profile, learnedWords: [...profile.learnedWords, wordId] });
  };

  const addChild = (child: Child) => {
    if (!profile) return;
    const updated = { ...profile, children: [...profile.children, child] };
    save(updated);
    if (!activeChildId) setActiveChildId(child.id);
  };

  const removeChild = (childId: string) => {
    if (!profile) return;
    const updated = {
      ...profile,
      children: profile.children.filter((c) => c.id !== childId),
    };
    save(updated);
    if (activeChildId === childId) {
      const remaining = updated.children[0];
      if (remaining) setActiveChildId(remaining.id);
      else setActiveChildIdState(null);
    }
  };

  const addXP = (amount: number) => {
    if (!profile) return;
    save({ ...profile, xp: profile.xp + amount });
  };

  const saveHomeworkSession = async (session: HomeworkSession) => {
    try {
      const stored = await AsyncStorage.getItem(SESSIONS_KEY);
      const sessions: HomeworkSession[] = stored ? JSON.parse(stored) : [];
      sessions.unshift(session);
      await AsyncStorage.setItem(
        SESSIONS_KEY,
        JSON.stringify(sessions.slice(0, 30))
      );
    } catch {
      // silent fail
    }
  };

  const isFavorite = (wordId: string) =>
    profile?.favorites.includes(wordId) ?? false;
  const isLearned = (wordId: string) =>
    profile?.learnedWords.includes(wordId) ?? false;

  const activeChild =
    profile?.children.find((c) => c.id === activeChildId) ??
    profile?.children[0] ??
    null;

  return (
    <AppContext.Provider
      value={{
        profile,
        isLoading,
        activeChildId,
        activeChild,
        setActiveChildId,
        setProfile,
        updateProfile,
        setRole,
        setLearningLanguage,
        setName,
        toggleFavorite,
        markLearned,
        addChild,
        removeChild,
        isFavorite,
        isLearned,
        addXP,
        searchLanguage,
        setSearchLanguage,
        saveHomeworkSession,
      }}
    >
      {node}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

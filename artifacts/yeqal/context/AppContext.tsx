import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { AppLanguage, Child, UserProfile, UserRole } from "@/data/types";

const STORAGE_KEY = "yeqal_profile_v1";

const DEFAULT_CHILD: Child = {
  id: "c1",
  name: "Liya",
  gradeLevel: 4,
  initials: "LI",
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
  setProfile: (p: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setRole: (role: UserRole) => void;
  setLearningLanguage: (lang: AppLanguage) => void;
  setName: (name: string) => void;
  toggleFavorite: (wordId: string) => void;
  markLearned: (wordId: string) => void;
  addChild: (child: Child) => void;
  isFavorite: (wordId: string) => boolean;
  isLearned: (wordId: string) => boolean;
  addXP: (amount: number) => void;
  searchLanguage: AppLanguage;
  setSearchLanguage: (lang: AppLanguage) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children: node }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchLanguage, setSearchLanguage] = useState<AppLanguage>("english");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setProfileState(JSON.parse(stored));
        } catch {
          setProfileState(DEFAULT_PROFILE);
        }
      } else {
        setProfileState(DEFAULT_PROFILE);
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
    save({ ...profile, children: [...profile.children, child] });
  };

  const addXP = (amount: number) => {
    if (!profile) return;
    save({ ...profile, xp: profile.xp + amount });
  };

  const isFavorite = (wordId: string) =>
    profile?.favorites.includes(wordId) ?? false;
  const isLearned = (wordId: string) =>
    profile?.learnedWords.includes(wordId) ?? false;

  return (
    <AppContext.Provider
      value={{
        profile,
        isLoading,
        setProfile,
        updateProfile,
        setRole,
        setLearningLanguage,
        setName,
        toggleFavorite,
        markLearned,
        addChild,
        isFavorite,
        isLearned,
        addXP,
        searchLanguage,
        setSearchLanguage,
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

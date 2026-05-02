import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { AppLanguage, Child, HomeworkSession, UserProfile, UserRole } from "@/data/types";
import { saveSession, upsertProfile, upsertChildren } from "@/lib/supabaseWords";

const STORAGE_KEY = "yeqal_profile_v3";
const SESSIONS_KEY = "yeqal_homework_sessions";
const ACTIVE_CHILD_KEY = "yeqal_active_child";
const DEVICE_KEY = "yeqal_device_id";

function generateDeviceId(): string {
  return "dev-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

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
  dailyGoal: 10,
  dailyWordsToday: 0,
  children: [DEFAULT_CHILD],
  favorites: ["w001", "w013", "w032"],
  learnedWords: ["w007", "w009", "w010", "w011", "w022", "w023"],
};

interface AppContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  activeChildId: string | null;
  activeChild: Child | null;
  deviceId: string | null;
  setActiveChildId: (id: string) => void;
  setProfile: (p: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setRole: (role: UserRole) => void;
  setLearningLanguage: (lang: AppLanguage) => void;
  setName: (name: string) => void;
  toggleFavorite: (wordId: string) => void;
  markLearned: (wordId: string) => void;
  incrementDailyWord: () => void;
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
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const deviceIdRef = useRef<string | null>(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(ACTIVE_CHILD_KEY),
      AsyncStorage.getItem(DEVICE_KEY),
    ]).then(([stored, savedActiveId, savedDeviceId]) => {
      const did = savedDeviceId ?? generateDeviceId();
      if (!savedDeviceId) AsyncStorage.setItem(DEVICE_KEY, did);
      setDeviceId(did);
      deviceIdRef.current = did;

      let parsedProfile: UserProfile = DEFAULT_PROFILE;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.children) {
            parsed.children = parsed.children.map((c: Child) => ({
              ...c,
              avatar: c.avatar ?? "👦",
              learningLanguage: c.learningLanguage ?? "amharic",
            }));
          }
          parsedProfile = {
            ...DEFAULT_PROFILE,
            ...parsed,
            dailyGoal: parsed.dailyGoal ?? 10,
            dailyWordsToday: parsed.dailyWordsToday ?? 0,
          };
          const firstId = parsedProfile.children?.[0]?.id ?? null;
          setActiveChildIdState(savedActiveId ?? firstId);
        } catch {
          setActiveChildIdState(DEFAULT_CHILD.id);
        }
      } else {
        setActiveChildIdState(DEFAULT_CHILD.id);
      }

      // Check streak on open
      const today = todayStr();
      const yesterday = yesterdayStr();
      const last = parsedProfile.lastStreakDate ?? "";
      let streakUpdate: Partial<UserProfile> = {};

      if (last !== today) {
        if (last === yesterday) {
          streakUpdate = { streak: parsedProfile.streak + 1, lastStreakDate: today };
        } else if (last === "") {
          streakUpdate = { streak: parsedProfile.streak, lastStreakDate: today };
        } else {
          streakUpdate = { streak: 1, lastStreakDate: today };
        }
      }

      // Reset daily word count if new day
      let dailyUpdate: Partial<UserProfile> = {};
      if (parsedProfile.lastDailyDate !== today) {
        dailyUpdate = { dailyWordsToday: 0, lastDailyDate: today };
      }

      const finalProfile = { ...parsedProfile, ...streakUpdate, ...dailyUpdate };
      setProfileState(finalProfile);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalProfile));
      setIsLoading(false);
    });
  }, []);

  const save = async (p: UserProfile) => {
    setProfileState(p);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    const did = deviceIdRef.current;
    if (did) {
      upsertProfile({
        deviceId: did,
        name: p.name,
        role: p.role,
        uiLanguage: p.uiLanguage,
        learningLanguage: p.learningLanguage,
        isPremium: p.isPremium,
        streak: p.streak,
        xp: p.xp,
        favorites: p.favorites,
        learnedWords: p.learnedWords,
      });
      upsertChildren(did, p.children);
    }
  };

  const setProfile = (p: UserProfile) => save(p);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return;
    save({ ...profile, ...updates });
  };

  const setRole = (role: UserRole) => updateProfile({ role });
  const setLearningLanguage = (lang: AppLanguage) => updateProfile({ learningLanguage: lang });
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

  const incrementDailyWord = () => {
    if (!profile) return;
    const today = todayStr();
    const resetDaily = profile.lastDailyDate !== today ? { dailyWordsToday: 0 } : {};
    const newCount = (resetDaily.dailyWordsToday ?? profile.dailyWordsToday ?? 0) + 1;
    const xpGain = 5;
    save({
      ...profile,
      ...resetDaily,
      dailyWordsToday: newCount,
      lastDailyDate: today,
      xp: profile.xp + xpGain,
    });
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
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 30)));
    } catch { /* silent */ }
    const did = deviceIdRef.current;
    const child = profile?.children.find((c) => c.id === activeChildId) ?? profile?.children[0];
    if (did) {
      saveSession({
        deviceId: did,
        childId: child?.id,
        childName: child?.name,
        gradeLevel: child?.gradeLevel,
        inputText: session.inputText,
        wordIds: session.wordIds,
      });
    }
  };

  const isFavorite = (wordId: string) => profile?.favorites.includes(wordId) ?? false;
  const isLearned = (wordId: string) => profile?.learnedWords.includes(wordId) ?? false;

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
        deviceId,
        setActiveChildId,
        setProfile,
        updateProfile,
        setRole,
        setLearningLanguage,
        setName,
        toggleFavorite,
        markLearned,
        incrementDailyWord,
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

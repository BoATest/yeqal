# Yeqal ያቃል — Ethiopian Trilingual Learning App

## Overview
YEQAL (ያቃል, "it speaks") is a mobile learning app for Ethiopian school families. It lets parents help their children with homework across **Amharic, Afaan Oromo, and English** — no more calling the neighbor at 9pm.

**Target users:** Ethiopian parents (role: parent/diaspora) helping children (Grade 1–6) with language homework.

## Tech Stack
- **Framework:** Expo (React Native) with Expo Router v6, file-based routing
- **Language:** TypeScript
- **State:** React Context + AsyncStorage (no backend in v1)
- **Fonts:** @expo-google-fonts/inter (Inter 400/500/600/700) + Noto Sans Ethiopic (web, loaded from Google Fonts CDN)
- **Icons:** @expo/vector-icons (Feather)
- **Animations:** React Native Animated + expo-haptics
- **Gradient:** expo-linear-gradient
- **Storage:** @react-native-async-storage/async-storage
- **Audio:** Web SpeechSynthesis API (browser built-in); native falls back to timed animation

## Design System
- **Primary:** #1B6B3A (Ethiopian green)
- **Accent/Gold:** #D4A017 (Ethiopian gold)
- **Background:** #F5F2EB (warm off-white)
- **Card:** #FFFFFF
- **Text:** #1C1C28 (dark navy)
- **Muted:** #888899
- **Border:** #E2DAC8

## App Structure

### Screens
- `app/_layout.tsx` — Root layout with providers, onboarding check, Stack navigator, Noto Sans Ethiopic injection, OfflineBanner
- `app/onboarding.tsx` — 3-slide emotional onboarding story
- `app/setup.tsx` — Language & role selection (2 steps)
- `app/(tabs)/_layout.tsx` — 5-tab classic tab bar
- `app/(tabs)/index.tsx` — Home dashboard
- `app/(tabs)/search.tsx` — Trilingual dictionary search with "word not found — suggest it?" form
- `app/(tabs)/homework.tsx` — Homework text analyzer with translation table, practice chips, AsyncStorage session saving
- `app/(tabs)/speak.tsx` — Speaking practice (word mode + situations) with countdown timer, waveform animation, color-coded scores
- `app/(tabs)/profile.tsx` — User profile, children, badges, settings, WhatsApp share
- `app/word/[id].tsx` — Word detail with real SpeechSynthesis audio for all 3 languages, examples, related words
- `app/flashcard.tsx` — Spaced-repetition flashcard quiz

### Data (mock, no backend)
- `data/words.ts` — **87 words** across 10 categories (family, food, school, nature, animals, greetings, numbers, body, time, verbs/general) with trilingual translations, romanization, definitions, examples
- `data/types.ts` — TypeScript interfaces (Word, UserProfile, Child, HomeworkSession, etc.)
- `context/AppContext.tsx` — App state: profile, favorites, learned words, XP, streak, homework session persistence
- `constants/colors.ts` — Design tokens

### Components
- `components/WordCard.tsx` — Trilingual word card with subject tags
- `components/OfflineBanner.tsx` — Animated offline detection banner (web only)
- `components/ErrorBoundary.tsx` — React error boundary with debug modal

### Hooks
- `hooks/useColors.ts` — Color scheme hook (light/dark palette)
- `hooks/useAudio.ts` — SpeechSynthesis hook: `speak(text, lang, key)` + `playingKey` state; web uses Web Speech API, native falls back to timed animation

## Onboarding Flow
1. Slide 1: "Your child has homework. You don't speak the language." (dark navy/purple)
2. Slide 2: "You downloaded 3 apps. None of them helped." (dark red)
3. Slide 3: "No more calling the neighbor. ያቃል — It speaks." (Ethiopian green)
→ Setup: language selection + role → `AsyncStorage.setItem('yeqal_onboarded', 'true')`
→ Home dashboard

## Key Features (v1)
- **87-word trilingual dictionary** across 10 subjects: family, food, school, nature, animals, greetings, numbers, body, time, verbs
- **Real-time trilingual search** with "Word not found — suggest it?" form on empty results
- **Homework helper:** "ያቃላል... Explaining..." loading state, word-by-word translation table (Amharic|Oromo|English), practice chips, AsyncStorage session saving (last 30 sessions)
- **Real SpeechSynthesis audio** on word detail and speaking practice ("Hear it first" button)
- **Speaking practice** with countdown timer (3-2-1), 7-bar animated waveform, color-coded pronunciation scores (red <50 / amber 50-70 / green 70+), microphone permission request, service error state
- **Situation conversations** (6 Ethiopian scenarios: Market, Bus Station, Elders, Health Center, School Meeting, Coffee Ceremony)
- **Flashcard quiz** with Easy/Medium/Hard spaced repetition
- **Parent dashboard** with child skill bars, WhatsApp share button (formatted message with child stats)
- **Add Child form** in profile: name, grade level, emoji avatar picker, remove child
- **Offline banner:** animates in when network is lost, out when restored (web only via window events)
- **Noto Sans Ethiopic font** injected from Google Fonts CDN for proper Ge'ez script rendering on web
- **Streak tracking, XP system, achievement badges**
- **AsyncStorage-persisted user profile** (key: `yeqal_profile_v2`)

## AsyncStorage Keys
- `yeqal_onboarded` — onboarding completed flag
- `yeqal_profile_v2` — user profile (bumped from v1 to handle Child.avatar migration)
- `yeqal_homework_sessions` — array of up to 30 homework sessions (id, timestamp, inputText, wordIds)

## Planned Features (v1.1+, needs backend)
- Camera-based homework photo scanning
- Supabase backend for multi-device sync + sessions table
- Ethiopian AI tutor (Hasab AI integration) for real pronunciation scoring
- School class code system (YEQA24)
- Push notification reminders
- More words (target: 500+ in Supabase)
- Service worker / PWA offline mode
- Google Play support

## Development Notes
- No backend — all data is local (AsyncStorage)
- Ethiopic script: system font on Android/iOS; Noto Sans Ethiopic loaded from CDN on web
- SpeechSynthesis audio: works in Chrome/Edge/Safari on web; native falls back to timed animation
- Pronunciation scoring is simulated (random 60–96 range) pending Hasab AI integration
- Default demo profile: Selam (parent), child Liya Grade 4 (streak 7, XP 280)
- Storage key migrated from `yeqal_profile_v1` to `yeqal_profile_v2` to handle the added `avatar` field in Child interface

## Workflow
- Expo dev server: `artifacts/yeqal: expo`
- Port assigned dynamically via `$PORT` env var
- Access via `$REPLIT_EXPO_DEV_DOMAIN` or QR code in Expo Go

## File Structure
```
artifacts/yeqal/
├── app/
│   ├── _layout.tsx           # Root layout + providers + onboarding check + Noto font + OfflineBanner
│   ├── onboarding.tsx        # 3-slide story
│   ├── setup.tsx             # Language + role setup
│   ├── flashcard.tsx         # Spaced repetition flashcards
│   ├── word/[id].tsx         # Word detail screen with real audio
│   └── (tabs)/
│       ├── _layout.tsx       # Classic tab bar
│       ├── index.tsx         # Home dashboard
│       ├── search.tsx        # Dictionary search + suggest form
│       ├── homework.tsx      # Homework helper + translation table
│       ├── speak.tsx         # Speaking practice + waveform + timer
│       └── profile.tsx       # Profile + WhatsApp share + Add child
├── components/
│   ├── WordCard.tsx          # Trilingual word card
│   ├── OfflineBanner.tsx     # Animated offline banner (web)
│   └── ErrorBoundary.tsx     # Error boundary with debug modal
├── context/AppContext.tsx    # Global state + session saving
├── constants/colors.ts       # Design tokens
├── data/
│   ├── words.ts              # 87 trilingual words
│   └── types.ts              # TypeScript types (Subject includes body + time)
├── hooks/
│   ├── useColors.ts          # Color scheme hook
│   └── useAudio.ts           # SpeechSynthesis hook
└── assets/images/
    └── icon.png              # Ethiopian lion (Anbessa) app icon
```

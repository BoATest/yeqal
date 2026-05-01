# Yeqal ያቃል — Ethiopian Trilingual Learning App

## Overview
YEQAL (ያቃል, "it speaks") is a mobile learning app for Ethiopian school families. It lets parents help their children with homework across **Amharic, Afaan Oromo, and English** — no more calling the neighbor at 9pm.

**Target users:** Ethiopian parents (role: parent/diaspora) helping children (Grade 1–6) with language homework.

## Tech Stack
- **Framework:** Expo (React Native) with Expo Router v6, file-based routing
- **Language:** TypeScript
- **State:** React Context + AsyncStorage (no backend in v1)
- **Fonts:** @expo-google-fonts/inter (Inter 400/500/600/700)
- **Icons:** @expo/vector-icons (Feather)
- **Animations:** React Native Animated + expo-haptics
- **Gradient:** expo-linear-gradient
- **Storage:** @react-native-async-storage/async-storage

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
- `app/_layout.tsx` — Root layout with providers, onboarding check, Stack navigator
- `app/onboarding.tsx` — 3-slide emotional onboarding story
- `app/setup.tsx` — Language & role selection (2 steps)
- `app/(tabs)/_layout.tsx` — 5-tab classic tab bar
- `app/(tabs)/index.tsx` — Home dashboard
- `app/(tabs)/search.tsx` — Trilingual dictionary search
- `app/(tabs)/homework.tsx` — Homework text analyzer
- `app/(tabs)/speak.tsx` — Speaking practice (word mode + situations)
- `app/(tabs)/profile.tsx` — User profile, children, badges, settings
- `app/word/[id].tsx` — Word detail with all 3 languages, audio sim, examples
- `app/flashcard.tsx` — Spaced-repetition flashcard quiz

### Data (mock, no backend)
- `data/words.ts` — 40 Ethiopian words (family, food, school, nature, animals, greetings, numbers, verbs) with trilingual translations, romanization, definitions, examples
- `data/types.ts` — TypeScript interfaces (Word, UserProfile, Child, etc.)
- `context/AppContext.tsx` — App state: profile, favorites, learned words, XP, streak
- `constants/colors.ts` — Design tokens

### Components
- `components/WordCard.tsx` — Trilingual word card with subject tags

## Onboarding Flow
1. Slide 1: "Your child has homework. You don't speak the language." (dark navy/purple)
2. Slide 2: "You downloaded 3 apps. None of them helped." (dark red)
3. Slide 3: "No more calling the neighbor. ያቃል — It speaks." (Ethiopian green)
→ Setup: language selection + role → `AsyncStorage.setItem('yeqal_onboarded', 'true')`
→ Home dashboard

## Key Features (v1)
- 40-word trilingual dictionary (Amharic + Oromo + English)
- Real-time search across all 3 languages
- Homework text analyzer — paste text, find matching words
- Speaking practice with simulated pronunciation scoring
- Situation conversations (6 Ethiopian scenarios)
- Flashcard quiz with Easy/Medium/Hard spaced repetition
- Parent dashboard with child skill bars (speaking, listening, reading, writing)
- Streak tracking, XP system, achievement badges
- AsyncStorage-persisted user profile

## Planned Features (v1.1+)
- Camera-based homework photo scanning
- Real audio pronunciation (TTS)
- Supabase backend for multi-device sync
- Ethiopian AI tutor (Hasab AI integration)
- Push notification reminders
- More words (target: 500+)
- Google Play support

## Development Notes
- No backend — all data is local (AsyncStorage)
- Ethiopic script renders natively on Android/iOS; web preview may show simplified rendering
- Audio is simulated (play button shows animation, no real audio files yet)
- Default demo profile: Selam (parent), child Liya Grade 4

## Workflow
- Expo dev server: `artifacts/yeqal: expo`
- Port assigned dynamically via `$PORT` env var
- Access via `$REPLIT_EXPO_DEV_DOMAIN` or QR code in Expo Go

## File Structure
```
artifacts/yeqal/
├── app/
│   ├── _layout.tsx           # Root layout + providers + onboarding check
│   ├── onboarding.tsx        # 3-slide story
│   ├── setup.tsx             # Language + role setup
│   ├── flashcard.tsx         # Spaced repetition flashcards
│   ├── word/[id].tsx         # Word detail screen
│   └── (tabs)/
│       ├── _layout.tsx       # Classic tab bar
│       ├── index.tsx         # Home dashboard
│       ├── search.tsx        # Dictionary search
│       ├── homework.tsx      # Homework helper
│       ├── speak.tsx         # Speaking practice
│       └── profile.tsx       # Profile + settings
├── components/
│   ├── WordCard.tsx          # Trilingual word card
│   └── ErrorBoundary.tsx     # Error boundary (scaffold)
├── context/AppContext.tsx    # Global state
├── constants/colors.ts       # Design tokens
├── data/
│   ├── words.ts              # 40 mock words
│   └── types.ts              # TypeScript types
├── hooks/useColors.ts        # Color scheme hook
└── assets/images/
    └── icon.png              # Ethiopian lion (Anbessa) app icon
```

# Yeqal ያቃል — Ethiopian Trilingual Learning App

## Overview
YEQAL (ያቃል, "it speaks") is a mobile learning app for Ethiopian school families. It lets parents help their children with homework across **Amharic, Afaan Oromo, and English** — no more calling the neighbor at 9pm.

**Target users:** Ethiopian parents (role: parent/diaspora) helping children (Grade 1–8) with language homework.

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
- **Voice input:** Web SpeechRecognition API (Chrome/Edge/Safari)
- **Translation:** Local word lookup first; LibreTranslate API fallback

## Design System
- **Primary:** #1B6B3A (Ethiopian green)
- **Accent/Gold:** #D4A017 (Ethiopian gold)
- **Background:** #F5F2EB (warm off-white)
- **Card:** #FFFFFF
- **Text:** #1C1C28 (dark navy)
- **Muted:** #888899
- **Border:** #E2DAC8

## App Structure

### Screens (6 tabs)
- `app/_layout.tsx` — Root layout with providers, onboarding check, Stack navigator, Noto Sans Ethiopic injection, OfflineBanner
- `app/onboarding.tsx` — 3-slide emotional onboarding story
- `app/setup.tsx` — Language & role selection (2 steps)
- `app/(tabs)/_layout.tsx` — **6-tab** tab bar (Home, Search, Homework, Translate, Speak, Profile)
- `app/(tabs)/index.tsx` — Home dashboard with **multi-child switcher** (Phase A)
- `app/(tabs)/search.tsx` — Trilingual dictionary search with "word not found — suggest it?" form
- `app/(tabs)/homework.tsx` — Homework helper with **active child header**, **curriculum topic detection** (Phase A+D), **Point & Learn camera button** (Phase C)
- `app/(tabs)/translate.tsx` — **NEW: Live Translator** (Phase B) — two-panel voice translator with situation phrases
- `app/(tabs)/speak.tsx` — Speaking practice (word mode + situations) with countdown timer, waveform, scores
- `app/(tabs)/profile.tsx` — User profile with **per-child learning language selector** (Phase A), children, badges, settings, WhatsApp share
- `app/word/[id].tsx` — Word detail with real SpeechSynthesis audio for all 3 languages, examples, related words
- `app/flashcard.tsx` — Spaced-repetition flashcard quiz

### Data (no backend)
- `data/words.ts` — **116 words** across 20 categories (added: colors, shapes, clothes, weather, actions, math, geography, history, science, abstract/civics, economy, community, nature extended)
- `data/types.ts` — TypeScript interfaces (Word, UserProfile, Child, HomeworkSession) — Child now has `learningLanguage` and optional `schoolName`; Subject type expanded to 23 categories
- `data/curriculum.ts` — **NEW: Grade 1–8 curriculum map** (Phase D) — topics per grade+language, keyword lists, `findTopicForQuestion()` and `getCurriculumContext()` helpers
- `context/AppContext.tsx` — App state: `activeChildId`, `activeChild`, `setActiveChildId`, multi-child support; storage key bumped to `yeqal_profile_v3`
- `constants/colors.ts` — Design tokens

### Components
- `components/WordCard.tsx` — Trilingual word card with subject tags
- `components/OfflineBanner.tsx` — Animated offline detection banner (web only)
- `components/ErrorBoundary.tsx` — React error boundary with debug modal
- `components/CameraOverlay.tsx` — **NEW: Camera overlay** (Phase C) — getUserMedia web camera, object/text mode, Google Vision API integration (graceful no-key fallback)

### Hooks
- `hooks/useColors.ts` — Color scheme hook (light/dark palette)
- `hooks/useAudio.ts` — SpeechSynthesis hook: `speak(text, lang, key)` + `playingKey` state

## Feature Phases

### Phase A — Multi-child Support ✅
- `activeChildId` + `setActiveChildId` in AppContext (persisted to AsyncStorage)
- Home screen: single child shows compact stat card; 2+ children show horizontal scrollable chip switcher
- Homework screen: shows "Helping [avatar] [name] · Grade X · Language" in header
- Add Child form in profile: new **Learning Language** pill selector (Amharic / Oromo / English)
- Child type now has `learningLanguage: AppLanguage`

### Phase B — Live Translator ✅
- `app/(tabs)/translate.tsx` — new 6th tab
- Two-panel layout (Person A / Person B) each with language picker, transcript, translation, mic button
- Swap button reverses language direction
- SpeechRecognition (web/Chrome): tap mic to start, tap again or auto-stop on silence
- Translation: local word lookup first → LibreTranslate API fallback → graceful "coming soon" message
- SpeechSynthesis for spoken translation output
- 6 situation phrase banks: Market, Bus Station, Health Center, Elders, School Meeting, Coffee Ceremony
- Each situation has 5 trilingual phrase cards with play buttons

### Phase C — Camera Point & Learn ✅
- `components/CameraOverlay.tsx` — full-screen camera overlay
- Two modes: "Learn Object" (OBJECT_LOCALIZATION) and "Read Text" (TEXT_DETECTION)
- Uses `navigator.mediaDevices.getUserMedia` for web camera access
- Google Vision API integration — graceful "API key needed" fallback
- Camera result (object label or detected text) auto-fills homework input
- Homework screen "Point & Learn" button opens the overlay

### Phase D — Curriculum Context ✅
- `data/curriculum.ts` — Grade 1–8 curriculum map for Amharic / Oromo / English
- Each grade+language has named topics with keyword arrays and trilingual term lists
- `findTopicForQuestion(text, gradeLevel, language)` detects the most likely topic
- Homework screen shows gold curriculum badge when a topic is detected
- Shows: "[Grade X Language] · [Topic Name] — This looks like a [Subject] lesson"

### Phase E — 500-Word Dictionary (116 words done) ✅
- Added 76 new words (w041–w116):
  - Colors: red, blue, green, yellow, white, black
  - Shapes: circle, square, triangle
  - Clothes: shirt, shoes, dress
  - Weather: hot, cold, rain, wind
  - Actions: eat, drink, run, walk, read, write, listen
  - Nature: soil, seed, plant, root, leaf, fruit
  - Community: market, hospital, church, government
  - Math: add, subtract, multiply, equal, number
  - Geography: country, city, village, border, map
  - History: king, battle, tradition, history
  - Science: energy, electricity, machine, experiment
  - Civics: democracy, rights, responsibility, equality
  - Economics: trade, export, import, development
  - Extended: morning, evening, sun, moon, star, love, peace, work, friend, tree, river, sky, heat, forest, mountain, language, health

### Phase F — Supabase ⏭️ Skipped (needs credentials)

## Onboarding Flow
1. Slide 1: "Your child has homework. You don't speak the language." (dark navy/purple)
2. Slide 2: "You downloaded 3 apps. None of them helped." (dark red)
3. Slide 3: "No more calling the neighbor. ያቃል — It speaks." (Ethiopian green)
→ Setup: language selection + role → `AsyncStorage.setItem('yeqal_onboarded', 'true')`
→ Home dashboard

## AsyncStorage Keys
- `yeqal_onboarded` — onboarding completed flag
- `yeqal_profile_v3` — user profile (bumped from v2 to handle `learningLanguage` in Child and multi-child activeChildId)
- `yeqal_active_child` — active child ID for multi-child switching
- `yeqal_homework_sessions` — array of up to 30 homework sessions (id, timestamp, inputText, wordIds)

## Development Notes
- No backend — all data is local (AsyncStorage)
- Ethiopic script: system font on Android/iOS; Noto Sans Ethiopic loaded from CDN on web
- SpeechSynthesis audio: works in Chrome/Edge/Safari on web; native falls back to timed animation
- SpeechRecognition (Translate tab): Chrome/Edge only; graceful fallback shown for unsupported browsers
- Pronunciation scoring is simulated (random 60–96 range) pending Hasab AI integration
- Default demo profile: Selam (parent), child Liya Grade 4 (streak 7, XP 280, learningLanguage: amharic)
- Google Vision API key expected at `EXPO_PUBLIC_GOOGLE_VISION_KEY` env variable

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
│       ├── _layout.tsx       # 6-tab bar (Home/Search/Homework/Translate/Speak/Profile)
│       ├── index.tsx         # Home dashboard + multi-child switcher
│       ├── search.tsx        # Dictionary search + suggest form
│       ├── homework.tsx      # Homework helper + curriculum + camera + active child
│       ├── translate.tsx     # NEW: Live Translator with SpeechRecognition + situations
│       ├── speak.tsx         # Speaking practice + waveform + timer
│       └── profile.tsx       # Profile + learning language per child + WhatsApp share
├── components/
│   ├── CameraOverlay.tsx     # NEW: Camera overlay with Vision API integration
│   ├── WordCard.tsx          # Trilingual word card
│   ├── OfflineBanner.tsx     # Animated offline banner (web)
│   └── ErrorBoundary.tsx     # Error boundary with debug modal
├── context/AppContext.tsx    # Global state + activeChild + session saving
├── constants/colors.ts       # Design tokens
├── data/
│   ├── words.ts              # 116 trilingual words (w001–w116)
│   ├── curriculum.ts         # NEW: Grade 1–8 curriculum map (Phase D)
│   └── types.ts              # TypeScript types (23 Subject categories, Child.learningLanguage)
├── hooks/
│   ├── useColors.ts          # Color scheme hook
│   └── useAudio.ts           # SpeechSynthesis hook
└── assets/images/
    └── icon.png              # Ethiopian lion (Anbessa) app icon
```

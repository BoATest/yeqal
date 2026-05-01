import { useState } from "react";

const C = {
  bg: "#080810", card: "#0E0E1C", card2: "#141428",
  border: "#1A1A30", text: "#F0F0FF", mid: "#8888AA", soft: "#4A4A6A",
  green: "#1B6B3A", greenL: "#2ECC71", gold: "#D4A017", goldL: "#F5C842",
  red: "#E74C3C", blue: "#2980B9", purple: "#8E44AD",
  orange: "#E67E22", teal: "#0EA5C9", white: "#FFFFFF",
};

const SECTIONS = [
  "cover", "context", "tech", "screens", "revenue", "data", "design", "prompt"
];

const LABELS = {
  cover: "📋 Overview",
  context: "🎯 Context & Story",
  tech: "⚙️ Tech Stack",
  screens: "📱 All Screens",
  revenue: "💰 Revenue",
  data: "📊 Data & API",
  design: "🎨 Design System",
  prompt: "🚀 THE PROMPT",
};

function CopyBtn({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{
      background: copied ? C.green : C.gold, color: copied ? "#fff" : "#000",
      border: "none", borderRadius: 10, padding: "10px 20px",
      fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
      fontFamily: "inherit"
    }}>
      {copied ? "✓ Copied!" : `📋 ${label}`}
    </button>
  );
}

function Tag({ label, color = C.green }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20
    }}>{label}</span>
  );
}

function Box({ children, style = {}, color }) {
  return (
    <div style={{
      background: C.card, borderRadius: 14,
      border: `1px solid ${color || C.border}`,
      boxShadow: color ? `0 0 20px ${color}15` : "none",
      ...style
    }}>{children}</div>
  );
}

function Section({ title, color = C.gold, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontWeight: 900, fontSize: 15, color,
        borderBottom: `2px solid ${color}40`,
        paddingBottom: 8, marginBottom: 14, letterSpacing: 0.5
      }}>{title}</div>
      {children}
    </div>
  );
}

function ScreenCard({ emoji, name, desc, elements, revenue, priority }) {
  const [open, setOpen] = useState(false);
  const pColor = priority === "P1" ? C.green : priority === "P2" ? C.gold : C.mid;
  return (
    <Box style={{ marginBottom: 8, cursor: "pointer" }} onClick={() => setOpen(!open)}>
      <div style={{ padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{name}</span>
            <Tag label={priority} color={pColor} />
            {revenue && <Tag label="💰 Revenue" color={C.gold} />}
          </div>
          <div style={{ fontSize: 12, color: C.mid, marginTop: 3 }}>{desc}</div>
        </div>
        <span style={{ color: C.soft, fontSize: 14 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ paddingTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 8 }}>ELEMENTS TO BUILD:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {elements.map((el, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: C.text }}>
                  <span style={{ color: C.green, flexShrink: 0 }}>→</span>
                  <span>{el}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}

// ── THE FULL PROMPT TEXT ──────────────────────────────────
const FULL_PROMPT = `# BUILD: YEQAL (ያቃል) — Ethiopian Multilingual Learning App
## Complete Replit Build Specification

---

## THE STORY (READ THIS FIRST)

An Ethiopian parent sat next to their child who had homework in a language the parent doesn't speak. They downloaded 3 apps — all outdated, broken, or empty. They called their neighbor at 9pm for help.

This app — YEQAL (ያቃል, meaning "it speaks") — exists so that moment never happens again. It is a trilingual learning and homework helper for Ethiopian families: Amharic, Afaan Oromo, and English.

Every design decision, every feature, every screen must serve this: **a parent can help their child with language homework at any hour, in any of Ethiopia's three main languages.**

---

## PROJECT OVERVIEW

**App Name:** Yeqal (ያቃል)
**Tagline:** "No more calling the neighbor"
**Platform:** Progressive Web App (PWA) — installable on Android from browser, publishable to Play Store via TWA (Trusted Web Activity)
**Languages:** Amharic (Ge'ez script), Afaan Oromo (Latin script), English
**Primary Target:** Ethiopian school families (children age 6–14, parents 25–50)
**Secondary Target:** Ethiopian diaspora (2.5M+ globally, willing to pay USD)
**Revenue:** Google AdMob ads (domestic free users) + Premium subscription $4.99/month (diaspora)

---

## TECH STACK (USE EXACTLY THIS)

- **Framework:** React + Vite (PWA)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL) for word data + user progress
- **Auth:** Supabase Auth — phone number OTP (primary for Ethiopia) + Google OAuth (diaspora)
- **Offline cache:** Service Worker + IndexedDB (cache top 2,000 words locally)
- **Audio:** HTML5 Audio API — serve from Supabase Storage
- **Pronunciation AI:** Hasab AI API (https://developer.hasab.ai) — Ethiopian-built Amharic/Oromo speech recognition
- **Image storage:** Supabase Storage (WebP format, max 50KB each)
- **Analytics:** Posthog (free tier) — track Day-7 retention, search success rate
- **Payments:** Stripe (diaspora premium subscription, USD)
- **Ad integration:** Google AdSense placeholder (swap to AdMob in Play Store TWA build)
- **Push notifications:** Web Push API + Supabase Edge Functions
- **Deployment:** Replit → Vercel/Replit hosting → Play Store via TWA wrapper

---

## DATABASE SCHEMA (SUPABASE)

\`\`\`sql
-- Core word table
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_amharic TEXT,
  word_oromo TEXT,
  word_english TEXT NOT NULL,
  romanization_amharic TEXT,
  pos TEXT CHECK(pos IN ('noun','verb','adjective','adverb','phrase')),
  grade_level INTEGER CHECK(grade_level BETWEEN 1 AND 8),
  subject TEXT DEFAULT 'general',
  definition_amharic TEXT,
  definition_oromo TEXT,
  definition_english TEXT,
  audio_amharic TEXT, -- Supabase Storage URL
  audio_oromo TEXT,
  audio_english TEXT,
  image_url TEXT,     -- WebP, max 50KB
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Example sentences
CREATE TABLE sentences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID REFERENCES words(id),
  sentence_amharic TEXT,
  sentence_oromo TEXT,
  sentence_english TEXT,
  audio_amharic TEXT,
  audio_oromo TEXT
);

-- Users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  role TEXT CHECK(role IN ('student','parent','teacher','diaspora')),
  ui_language TEXT DEFAULT 'amharic',
  is_premium BOOLEAN DEFAULT false,
  streak_count INTEGER DEFAULT 0,
  xp_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Children (linked to parent account)
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  grade_level INTEGER,
  learning_language TEXT,
  avatar_emoji TEXT DEFAULT '🧒',
  streak INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0
);

-- Learning sessions / progress
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  child_id UUID REFERENCES children(id),
  session_type TEXT, -- 'dictionary','speaking','homework','flashcard'
  words_practiced INTEGER DEFAULT 0,
  score INTEGER,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- School classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code TEXT UNIQUE NOT NULL,
  teacher_id UUID REFERENCES profiles(id),
  class_name TEXT,
  grade_level INTEGER,
  school_name TEXT
);

-- Class memberships
CREATE TABLE class_members (
  class_id UUID REFERENCES classes(id),
  user_id UUID REFERENCES profiles(id),
  role TEXT CHECK(role IN ('teacher','student','parent')),
  PRIMARY KEY (class_id, user_id)
);

-- Assignments from teachers
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id),
  title TEXT NOT NULL,
  word_ids UUID[],
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User word feedback
CREATE TABLE word_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID REFERENCES words(id),
  user_id UUID REFERENCES profiles(id),
  feedback_type TEXT CHECK(feedback_type IN ('wrong_translation','missing_word','wrong_audio','suggestion')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

Seed the database with at least 200 sample words covering:
- Family (mother, father, child, home, school, teacher)
- Food and drink (water, bread, milk, coffee, injera, teff)
- Numbers 1-20 in all 3 languages
- Common verbs (eat, drink, go, come, learn, speak, write)
- School words (homework, test, pencil, book, class, grade)
- Nature (sun, rain, river, tree, mountain, coffee plant)
- Animals (lion, cow, donkey, bird, fish)
- Greetings and phrases (hello, thank you, please, yes, no, how are you)

---

## APP STRUCTURE — ALL SCREENS

### SCREEN 1: ONBOARDING / WELCOME (3 slides)
**Slide 1:** Full screen with Ethiopian flag colors gradient background
- Large emoji: 😰
- Title: "Your child has homework. You don't speak the language."
- Subtitle: "You've been there. Every Ethiopian parent has."
- Continue button

**Slide 2:**
- Large emoji: 📱
- Title: "You downloaded 3 apps. None of them helped."
- Subtitle: "Wrong translations. No audio. Last updated 2011."
- Continue button

**Slide 3:**
- Ethiopian green gradient background
- Yeqal logo + ያቃል
- Title: "No more calling the neighbor."
- Subtitle: "Yeqal speaks Amharic, Oromo, and English — so you can help your child, any time."
- Button: "Get Started — Free"
- Small text: "Already have an account? Sign in"

### SCREEN 2: LANGUAGE SETUP
- "Which language do you want to learn?"
- 3 big cards with flag: 🇪🇹 Amharic · 🇪🇹 Afaan Oromo · 🇬🇧 English
- "Who is using this?" → Parent / Student / Teacher / Diaspora
- If Parent: "Add your child's name and grade level" (simple form)
- "What language do you speak most?" (sets UI language)

### SCREEN 3: PHONE AUTH
- "Enter your Ethiopian phone number" — +251 format
- OTP verification (6 digits)
- OR "Continue with Google" for diaspora users
- Clean, minimal — WhatsApp-style phone auth UI

### SCREEN 4: HOME SCREEN (Main Dashboard)
**Top bar:**
- Left: Ethiopian flag emoji + "ያቃል Yeqal"
- Right: Flame emoji + streak number (e.g. 🔥 7) + user avatar circle

**Search bar (prominent, top):**
- Placeholder: "Search in Amharic · Oromo · English..."
- Tap → opens search screen
- Language pills below: [አማርኛ] [Oromo] [English] — tap to set search language

**Parent Alert Card (if user has linked child):**
- Green gradient card: "Liya finished 3 lessons today ✅"
- "Tap to see her full progress"
- Tap → Parent Dashboard

**Homework Helper CTA (gold gradient card):**
- 📚 "Homework Helper"
- "Take a photo or type your assignment question"
- Tap → Homework Helper screen

**Quick Action Grid (2x2):**
- 🎤 Practice Speaking
- ✍️ Practice Writing  
- 🏫 School Mode
- 📊 My Progress

**Word of the Day card:**
- Random verified word
- Shows: Amharic | Oromo | English
- 🔊 button to hear pronunciation
- ⭐ Save to favorites button

**Bottom navigation (5 tabs):**
- 🏠 Home · 🔍 Search · 📚 Homework · 🎤 Speak · 👤 Profile

### SCREEN 5: SEARCH / DICTIONARY (Core Feature)
**Architecture:** Instant search from IndexedDB cache (offline), fallback to Supabase

**Search bar:**
- Auto-detect language (Ge'ez script = Amharic, Latin = Oromo/English)
- Search as user types — results appear within 200ms
- Show: recent searches, suggested words if empty

**Result card per word (tap to expand):**
- Word in all 3 languages with their scripts
- Pronunciation: 🔊 button (plays audio) for each language
- Part of speech badge
- Grade level badge

**Expanded word detail:**
- Full definitions in all 3 languages
- 2 example sentences with audio
- Image (if available — concrete nouns)
- "Practice this word" button → adds to flashcard queue
- "Report an issue" → feedback form
- "Share" → copies formatted word to clipboard for WhatsApp sharing

**Filter options:**
- By grade level (1–8)
- By subject (general, math, science, social studies)
- By part of speech

**Ad placement:** Native ad card every 8 results (non-intrusive) — FREE users only

### SCREEN 6: WORD DETAIL PAGE
Full-screen detail for a single word:

**Header:** Word in large Amharic script (or Oromo if that's the search language)
- Below: all 3 language versions side by side
- Romanization of Amharic (for pronunciation guide)

**Audio section:**
- 3 audio buttons (one per language) — large, easy to tap
- Waveform animation while playing

**Definition section:**
- Tab toggle: Amharic | Oromo | English definitions

**Example sentences section:**
- 2 sentences, each with audio button
- Highlight the focus word in each sentence

**Related words section:**
- 3–5 related words (same subject/grade)

**Practice button:** "Practice this word" → goes to speaking practice for this specific word

**Report button:** Small — "Something wrong? Report it"

### SCREEN 7: HOMEWORK HELPER
**Mode A — Type or Paste:**
- Large text input: "Type your homework question in any language..."
- Language detect indicator
- "Explain this" button → calls Supabase Edge Function which queries word database + returns explanation

**Result display:**
- Original text shown
- Word-by-word breakdown with translations
- Suggested practice words (from the assignment text)
- "Practice all these words" button → creates a targeted flashcard session

**Mode B — Camera (Phase 2 — build UI placeholder now):**
- Camera button in top right
- Shows: "Coming soon — photo your textbook for instant help"
- Captures image (HTML5 camera API ready)
- PLACEHOLDER: display "Processing..." then return to text mode

**AI Explanation card:**
- Shows breakdown of what the assignment is asking
- Step-by-step explanation in the user's chosen UI language
- Suggested next steps

**Bottom of screen:**
- "Save to homework log" button
- "Share to Parent" button (if student user — generates a link)

**Ad placement:** Banner ad at bottom — FREE users only

### SCREEN 8: SPEAKING PRACTICE
**Mode selector (tabs at top):**
- Word Practice | Sentence | Situation | Free Talk

**Word Practice mode:**
- Shows a word card (large Amharic/Oromo script)
- Below: "Hear it first" button → plays native audio
- Large microphone button (red when recording)
- "Tap to speak" instruction
- Records audio → sends to Hasab AI API → returns score 0-100

**Score display (after speaking):**
- Large animated score (e.g., 78%)
- Color coded: red (<50), orange (50–70), green (70+)
- Specific feedback: "Your starting sound was good. The ending 't' sound needs more work."
- "Try again" + "Next word" buttons

**Situation Practice mode (high value feature):**
- Scenario cards: "At the Market 🛒" | "Bus Station 🚌" | "Meeting Elders 🙏" | "Health Center 🏥" | "School Meeting 🏫" | "Coffee Ceremony ☕"
- Each situation has 5 key phrases to practice
- Culturally authentic Ethiopian situations — NOT Western generic scenarios

**Kids mode:**
- Activated when child profile is selected
- Bigger fonts, bright colors, animal sounds, simpler words
- Anbessa (lion) mascot gives encouragement

**Ad placement:** Rewarded ad option: "Watch a 30s ad to earn 3 extra practice hearts"

### SCREEN 9: WRITING PRACTICE
**Tabs:** Script Tracing | Dictation | Compose

**Script Tracing tab:**
- Shows Ethiopic character (e.g., ሀ) large in center
- Below: trace path shown as dotted guide
- Canvas element — user traces with finger/mouse
- 7 characters per session (one family at a time)
- Progress: "ሀ family: 3/7 complete"

**Dictation tab:**
- "Listen and write what you hear"
- Play button → audio plays
- Character keyboard (Ethiopic soft keyboard shown)
- User taps characters to form the word
- Check → shows correct answer with animation

**Compose tab:**
- Prompt cards: "Write how you greet your teacher" | "Describe your home in 3 sentences"
- Text area with Ethiopic keyboard option
- "Check with AI" → basic grammar/spelling check via Edge Function

### SCREEN 10: PARENT DASHBOARD
**Accessed from:** Home screen alert card OR Profile → "My Children"

**Child selector (if multiple children):**
- Horizontal scroll cards with child name, grade, avatar emoji

**Stats row (3 cards):**
- 🔥 Streak (days)
- ⭐ Total XP
- 📈 Completion %

**Skill breakdown (5 bars):**
- Listening, Speaking, Reading, Writing, Vocabulary
- Each with % and color-coded progress bar

**Weekly activity chart:**
- 7-day bar chart (Mon–Sun)
- Shows minutes practiced per day
- Today highlighted

**Teacher notes section:**
- If child is in a class: shows teacher's latest note
- Timestamp + teacher name

**Upcoming school events:**
- Assignment due dates
- Test dates (if teacher has added them)

**WhatsApp report button:**
- Generates formatted text message
- "Liya practiced 24 min today. Streak: 7 days 🔥 | Speaking: 48% | Writing: 30% | Next test: Friday"
- Opens WhatsApp share with pre-filled text

**Download full report button (PDF):** Premium feature

### SCREEN 11: SCHOOL MODE
**Role selection on first entry:** Teacher | Student | Parent

**Teacher Dashboard:**
- Stats: Total students, Active today, Completion %, Need attention
- "Create Assignment" button → select words from dictionary → set due date → assign to class
- Student list with mini progress bars — tap student to see detail
- Red alert: Students with <50% completion on due assignments
- "Message Parents" button → generates WhatsApp message for struggling students

**Student View:**
- Greeting: "Selam [name]!"
- Assignment cards with progress bars and due dates
- "Continue" button per assignment

**Parent/Guardian View:**
- Child's current assignments
- Completion status
- "Help [child] practice" button → launches targeted practice session

**Class Join (for students/parents):**
- Large text input for class code
- "Join Class" button
- Confirmation with class name + teacher name

### SCREEN 12: PROGRESS / ACHIEVEMENTS
**Language Passport card:**
- Ethiopian flag gradient background
- User name + Level badge
- Stats: words learned, lessons done, streak

**Skills radar or bar breakdown:**
- 4 core skills: Speaking, Writing, Listening, Communication
- Each with current % and target %
- Visual progress indicator

**Badges collection:**
- Grid of earned + locked badges
- Earned: bright, with glow
- Locked: greyscale, show requirement
- Example badges: 🔥 7-Day Warrior | 🗣️ First Speaker | ✍️ Script Writer | 🌍 Trilingual | 📚 Homework Hero

**Streak calendar:**
- Month view showing days with streaks (green dots)
- Current streak prominently displayed

**XP and level system:**
- Level 1–20 with XP bar
- Level names: "Beginner → School Helper → Market Speaker → City Navigator → Regional Communicator → Language Bridge"

### SCREEN 13: FLASHCARD / QUIZ MODE
**Card flip animation:**
- Front: word in learning language (large)
- Tap → flip animation → shows meaning in all 3 languages + example sentence

**Self-rating (Anki-style):**
- After seeing answer: "Hard | Medium | Easy" buttons
- Spaced repetition — harder words appear more often

**Quiz mode (multiple choice):**
- Word shown → 4 translation options
- Green flash on correct, red on wrong
- Score at end of session
- "Share your score" button → WhatsApp shareable result

**Streak rewards:**
- Complete 5 cards → 🎉 animation
- Complete 10 → confetti + XP bonus
- Complete 20 → unlock bonus word

### SCREEN 14: PREMIUM / SUBSCRIPTION (Diaspora focused)
**Header:** "Yeqal for Families Abroad 🌍"
**Tagline:** "Teach your children the language of home — wherever you are."

**Features comparison:**
FREE:
- Dictionary access (5,000 words)
- Basic speaking practice
- Homework helper (text only)
- Ad-supported

PREMIUM ($4.99/month):
- Everything in Free
- Ad-free experience
- Full parent dashboard + reports
- PDF progress reports
- All 5,000 words with full audio
- Speaking practice with AI scoring (unlimited)
- Offline access to complete dictionary
- Priority linguist support for corrections
- Ethiopian cultural content (proverbs, calendar, stories)
- Family plan: up to 3 children

**Subscribe button:** Stripe checkout
**Family plan button:** Stripe checkout ($8.99/month, 3 children)

**Testimonial card:**
"As an Ethiopian parent in Toronto, I struggled to help my daughter with Amharic. Yeqal solved this in one week." — Diaspora user quote

### SCREEN 15: PROVERBS / CULTURE (Premium feature)
**Daily Ethiopian Proverb:**
- Large card with Amharic proverb text
- Below: Oromo version
- Below: English translation
- Cultural context: "This proverb is used when..."
- Audio button for native pronunciation

**Proverb archive:**
- Searchable list of 100+ proverbs
- Filter by theme (wisdom, community, family, work)

**Ethiopian Calendar integration:**
- Show current Ethiopian date alongside Gregorian
- Coming holidays highlighted
- "Share today's date" → formatted card for social

**Word of the day history:**
- Past 30 days of words of the day
- Save favorites

### SCREEN 16: SETTINGS / PROFILE
**Profile section:**
- Name, phone, avatar selection (emoji grid)
- UI language toggle: Amharic | Oromo | English
- Child profiles management

**Preferences:**
- Daily practice reminder: on/off + time picker
- Notification preferences
- Text size: Small | Medium | Large (accessibility)
- Audio autoplay: on/off

**Account:**
- Subscription status
- Restore purchase
- Privacy policy (2 sentences: we never sell data, only you and teacher see child progress)
- Delete account

**Help:**
- Report a wrong word (goes to feedback form)
- WhatsApp support link
- FAQ (5 common questions)

**Feedback:**
- "Suggest a missing word" form
- "Rate the app" → opens Play Store review

---

## REVENUE INTEGRATION

### Google AdSense / AdMob (Free Users)
Place ads in these exact locations:
1. Search results: Native ad card after every 8 results
2. Homework Helper: Banner at very bottom of screen
3. Speaking Practice: "Watch ad to earn 3 hearts" rewarded option
4. After completing a quiz: Interstitial (once per session max, never more)

**Ad rules:**
- NEVER show ads in children's mode (Kids toggle = no ads)
- NEVER show ads in school assignment flows
- NEVER interrupt a speaking practice session
- Premium users see ZERO ads

### Stripe Subscription (Premium)
- Monthly: $4.99/month
- Yearly: $39.99/year (save 33%)  
- Family: $8.99/month (3 children)

**Premium gates — show lock icon and "Go Premium" CTA on:**
- PDF report downloads
- Unlimited speaking practice (cap free at 10/day)
- Ad-free experience
- Full offline dictionary (cap free offline at 500 words)
- Proverbs & Culture screen
- Ethiopian Calendar integration

---

## DESIGN SYSTEM

### Colors (EXACT HEX VALUES)
\`\`\`css
:root {
  --green-primary: #1B6B3A;
  --green-light: #2ECC71;
  --green-bg: #E8F5E9;
  --gold-primary: #D4A017;
  --gold-light: #F5C842;
  --gold-bg: #FFF8E1;
  --dark-bg: #0A0A14;
  --card-bg: #FFFFFF;
  --text-primary: #1A1A2E;
  --text-mid: #555577;
  --text-soft: #9999AA;
  --border: #E8E4DC;
  --red: #C0392B;
  --blue: #2471A3;
  --purple: #7D3C98;
  --orange: #E67E22;
}
\`\`\`

### Typography
- Primary font: Google Fonts — "Noto Sans Ethiopic" (for Ge'ez script)
- UI font: "Plus Jakarta Sans" or "DM Sans" (clean, readable)
- Load both via Google Fonts CDN
- Minimum font size: 16px for body, 20px for Amharic script (Ge'ez needs larger rendering)

### Ethiopian Cultural Design Touches
- Ethiopian green (#1B6B3A) is the primary brand color — same as the flag
- Ethiopian gold (#D4A017) is the accent color — same as the flag star
- Use Ethiopian flag colors in key moments (onboarding, achievements, celebrations)
- Confetti animation in Ethiopian flag colors on achievements
- Anbessa (lion) mascot — use 🦁 emoji placeholder throughout (replace with custom art later)
- No Western-style cartoon characters — Ethiopian aesthetic only

### Component Patterns
**Cards:** White background, 14px border radius, subtle shadow (0 2px 12px rgba(0,0,0,0.08))
**Buttons primary:** Green fill, white text, 12px border radius, 48px min height (touch targets)
**Buttons secondary:** Green border, green text, transparent fill
**Progress bars:** Green fill on light green track, 8px height, 4px border radius
**Audio buttons:** Circular, 48px diameter, green fill, white speaker icon
**Bottom nav:** 56px height, 5 items, active item in green with label, inactive in gray

### Mobile-First Constraints
- All touch targets minimum 48x48px
- Bottom navigation must be reachable by thumb (not floating buttons)
- Content never hidden behind navigation bars
- Maximum content width: 430px (phone width)
- All text readable at 16px minimum

---

## HASAB AI PRONUNCIATION INTEGRATION

\`\`\`javascript
// Pronunciation scoring via Hasab AI API
// Get API key from: developer.hasab.ai

async function scorePronunciation(audioBlob, targetWord, language) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');
  formData.append('reference_text', targetWord);
  formData.append('language', language); // 'am' for Amharic, 'om' for Oromo
  
  const response = await fetch('https://api.hasab.ai/v1/pronunciation/score', {
    method: 'POST',
    headers: { 'Authorization': \`Bearer \${process.env.HASAB_API_KEY}\` },
    body: formData
  });
  
  const result = await response.json();
  // Returns: { score: 0-100, feedback: [...], phoneme_analysis: [...] }
  return result;
}

// Use MediaRecorder API to capture audio
function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const score = await scorePronunciation(audioBlob, currentWord, currentLanguage);
        displayScore(score);
      };
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 3000); // 3 second recording
    });
}
\`\`\`

---

## OFFLINE / PWA SETUP

\`\`\`javascript
// service-worker.js
// Cache strategy: Cache-first for dictionary words, Network-first for user data

const CACHE_NAME = 'yeqal-v1';
const OFFLINE_WORDS_CACHE = 'yeqal-words-v1';

// On install: cache top 2,000 words + all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(OFFLINE_WORDS_CACHE).then(cache => {
      return cache.addAll([
        '/api/words/core', // endpoint returning top 2,000 words as JSON
        '/static/audio/core/', // bundled audio files
      ]);
    })
  );
});

// manifest.json for PWA install
{
  "name": "Yeqal - ያቃል",
  "short_name": "Yeqal",
  "description": "Ethiopian trilingual learning app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1B6B3A",
  "theme_color": "#1B6B3A",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "categories": ["education", "utilities"],
  "lang": "am"
}
\`\`\`

---

## WHATSAPP SHARE INTEGRATION

\`\`\`javascript
// Generate WhatsApp-formatted progress report
function generateWhatsAppReport(child, skills) {
  const report = \`
📊 *\${child.name}'s Yeqal Progress Report*
📅 \${new Date().toLocaleDateString('en-ET')}

🔥 Streak: \${child.streak} days
⭐ Total XP: \${child.xp}

📈 *Skills:*
🎤 Speaking: \${skills.speaking}%
👂 Listening: \${skills.listening}%
📖 Reading: \${skills.reading}%
✍️ Writing: \${skills.writing}%

📚 Words learned this week: \${skills.wordsThisWeek}

_Powered by Yeqal ያቃል — yeqal.app_
  \`;
  
  const encodedReport = encodeURIComponent(report.trim());
  window.open(\`https://wa.me/?text=\${encodedReport}\`);
}
\`\`\`

---

## SAMPLE WORD DATA (SEED THIS ON STARTUP)

\`\`\`json
[
  {"word_amharic":"ቤት","word_oromo":"Mana","word_english":"House","romanization_amharic":"bet","pos":"noun","grade_level":1,"subject":"general","definition_english":"A building where people live","image_url":"/images/house.webp"},
  {"word_amharic":"ውሃ","word_oromo":"Bishaan","word_english":"Water","romanization_amharic":"wiha","pos":"noun","grade_level":1,"subject":"general","definition_english":"Clear liquid essential for life"},
  {"word_amharic":"ትምህርት","word_oromo":"Barnootaa","word_english":"Education","romanization_amharic":"timhirt","pos":"noun","grade_level":3,"subject":"school","definition_english":"The process of learning and gaining knowledge"},
  {"word_amharic":"ፀሐይ","word_oromo":"Aduu","word_english":"Sun","romanization_amharic":"tsehay","pos":"noun","grade_level":1,"subject":"nature"},
  {"word_amharic":"ምግብ","word_oromo":"Nyaata","word_english":"Food","romanization_amharic":"migib","pos":"noun","grade_level":1,"subject":"general"},
  {"word_amharic":"ወር","word_oromo":"Ji'a","word_english":"Month","romanization_amharic":"wer","pos":"noun","grade_level":2,"subject":"general"},
  {"word_amharic":"ዛፍ","word_oromo":"Muka","word_english":"Tree","romanization_amharic":"zaf","pos":"noun","grade_level":1,"subject":"nature"},
  {"word_amharic":"ላም","word_oromo":"Sa'a","word_english":"Cow","romanization_amharic":"lam","pos":"noun","grade_level":1,"subject":"animals"},
  {"word_amharic":"ፈረስ","word_oromo":"Farda","word_english":"Horse","romanization_amharic":"feres","pos":"noun","grade_level":1,"subject":"animals"},
  {"word_amharic":"ሰማይ","word_oromo":"Samii","word_english":"Sky","romanization_amharic":"semay","pos":"noun","grade_level":1,"subject":"nature"}
]
\`\`\`

---

## SUCCESS METRICS TO TRACK (POSTHOG)

Track these exact events from Day 1:
\`\`\`javascript
posthog.capture('search_performed', { term, language, result_found: true/false });
posthog.capture('word_practiced', { word_id, type: 'speaking/flashcard/quiz' });
posthog.capture('homework_session_completed', { words_count, duration });
posthog.capture('parent_dashboard_opened', { child_id });
posthog.capture('whatsapp_report_shared', { child_id });
posthog.capture('premium_cta_shown', { screen, feature_gated });
posthog.capture('premium_subscribed', { plan: 'monthly/yearly/family' });
posthog.capture('ad_shown', { placement, type });
\`\`\`

Key metric targets:
- Day-7 retention: 30%+
- Search success rate (result found): 85%+
- Homework session completion: 60%+
- WhatsApp report share rate: 30%+ of parents with reports

---

## WHAT NOT TO BUILD YET
- Camera OCR (placeholder UI only — show "coming soon")
- Full offline mode (cache top 2,000 words only)
- Tigrinya or Somali language support
- Video lessons
- AI chatbot tutor (text-based explanation is enough for MVP)
- Complex gamification (hearts system, leaderboards) — basic XP and streaks only
- Pen pal / social features

---

## LAUNCH CHECKLIST
- [ ] PWA installable on Android Chrome
- [ ] Supabase connected with real word data (200+ seed words)
- [ ] Search works in all 3 languages with <500ms response
- [ ] Audio plays for at least 50 core words
- [ ] Speaking practice records + scores via Hasab AI
- [ ] Parent dashboard shows child streak and 4 skill bars
- [ ] School class code join works
- [ ] WhatsApp report share button generates correct text
- [ ] Google AdSense implemented (non-intrusive placements)
- [ ] Stripe subscription flow works end-to-end
- [ ] Service worker caches top 2,000 words for offline use
- [ ] App passes Google Lighthouse: Performance 90+, PWA 100, Accessibility 90+

---

## THE ONE THING TO REMEMBER

Every feature you build must answer: **"Does this help a parent at 9pm help their child with language homework?"**

If yes: build it.
If no: cut it.

This is YEQAL. It speaks when parents can't.
`;

// ── SECTION RENDERERS ─────────────────────────────────────
function Cover() {
  return (
    <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
      <div style={{ fontSize: 60, marginBottom: 12 }}>🇪🇹</div>
      <div style={{ fontWeight: 900, fontSize: 32, color: C.gold, letterSpacing: 2, marginBottom: 6 }}>YEQAL · ያቃል</div>
      <div style={{ fontSize: 15, color: C.mid, marginBottom: 20 }}>The Replit Build Prompt — Copy and paste everything from the "THE PROMPT" tab</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
        {["React + Vite PWA","Supabase DB","Hasab AI Pronunciation","Stripe Payments","Google AdSense","Play Store via TWA","WhatsApp Integration"].map((t, i) => (
          <Tag key={i} label={t} color={[C.green, C.blue, C.purple, C.orange, C.teal, C.green, C.gold][i % 7]} />
        ))}
      </div>
      <Box color={C.gold} style={{ padding: "18px 20px", textAlign: "left", marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: C.gold, marginBottom: 8 }}>⚡ What Replit will build</div>
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>
          A production-ready Progressive Web App (PWA) that works on Android, can be published to the Play Store,
          generates revenue through ads and subscriptions, and serves Ethiopian school families with a
          trilingual dictionary, homework helper, speaking practice, and parent dashboard.
        </div>
      </Box>
      <Box color={C.green} style={{ padding: "14px 16px", textAlign: "left" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: C.green, marginBottom: 6 }}>📋 How to use this</div>
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          1. Go to the <strong style={{ color: C.gold }}>🚀 THE PROMPT</strong> tab<br/>
          2. Click "Copy Full Prompt"<br/>
          3. Open Replit → New Repl → paste into Replit Agent<br/>
          4. Say: <em style={{ color: C.gold }}>"Build this exactly as specified. Start with the database schema, then core screens."</em>
        </div>
      </Box>
    </div>
  );
}

function ContextSection() {
  return (
    <div>
      <Section title="🌙 The Origin Story" color={C.gold}>
        <Box style={{ padding: "16px" }}>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.9 }}>
            An Ethiopian parent sat next to their child who had a homework assignment in a language they couldn't speak.
            They downloaded 3 apps. All were broken, outdated, or useless. They called the neighbor at 9pm.
          </div>
          <div style={{ marginTop: 12, fontSize: 14, fontWeight: 800, color: C.gold }}>
            "No more calling the neighbor." — This is the entire product.
          </div>
        </Box>
      </Section>
      <Section title="🎯 Who Uses It" color={C.green}>
        {[
          { emoji: "🧒", role: "School Children (6–14)", detail: "Complete homework, learn vocabulary, practice pronunciation", rev: false },
          { emoji: "👨‍👩‍👧", role: "Parents (25–50)", detail: "Understand assignments, track child progress, WhatsApp reports", rev: false },
          { emoji: "👩‍🏫", role: "Teachers", detail: "Assign word lists, track class completion, message parents", rev: false },
          { emoji: "✈️", role: "Ethiopian Diaspora (2.5M+)", detail: "Heritage language learning — pays $4.99–9.99/month USD", rev: true },
        ].map((u, i) => (
          <Box key={i} style={{ padding: "12px 14px", marginBottom: 8, display: "flex", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{u.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{u.role}</span>
                {u.rev && <Tag label="💰 Primary Revenue" color={C.gold} />}
              </div>
              <div style={{ fontSize: 12, color: C.mid }}>{u.detail}</div>
            </div>
          </Box>
        ))}
      </Section>
    </div>
  );
}

function TechSection() {
  const stack = [
    { layer: "Framework", tech: "React + Vite (PWA)", why: "Fast, modern, deployable as PWA → Android Play Store via TWA" },
    { layer: "Styling", tech: "Tailwind CSS", why: "Rapid mobile-first UI development" },
    { layer: "Database", tech: "Supabase (PostgreSQL)", why: "Free tier, realtime sync, auth, storage in one platform" },
    { layer: "Auth", tech: "Supabase Auth (phone OTP)", why: "Phone number login = Ethiopia. Google OAuth = diaspora." },
    { layer: "Offline", tech: "Service Worker + IndexedDB", why: "Cache 2,000 words. Works without internet." },
    { layer: "Pronunciation", tech: "Hasab AI API", why: "Ethiopian-built. 97% Amharic accuracy. Afan Oromo support." },
    { layer: "Audio Storage", tech: "Supabase Storage", why: "Serve audio files via CDN. Cache after first play." },
    { layer: "Payments", tech: "Stripe", why: "Diaspora premium subscription in USD/EUR" },
    { layer: "Ads", tech: "Google AdSense", why: "Domestic free users. Banner + native ad placements." },
    { layer: "Analytics", tech: "PostHog", why: "Track Day-7 retention, search success, funnel metrics" },
    { layer: "Notifications", tech: "Web Push API", why: "Daily practice reminders. Streak alerts." },
    { layer: "Play Store", tech: "TWA (Trusted Web Activity)", why: "Package PWA as native Android app for Play Store" },
  ];

  return (
    <div>
      <Section title="⚙️ Technology Stack" color={C.blue}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stack.map((s, i) => (
            <Box key={i} style={{ padding: "10px 12px", display: "flex", gap: 10 }}>
              <div style={{ width: 90, flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.mid, textTransform: "uppercase" }}>{s.layer}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginTop: 2 }}>{s.tech}</div>
              </div>
              <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.5, borderLeft: `1px solid ${C.border}`, paddingLeft: 12 }}>{s.why}</div>
            </Box>
          ))}
        </div>
      </Section>
    </div>
  );
}

function ScreensSection() {
  const screens = [
    { emoji: "🌟", name: "Onboarding (3 slides)", desc: "The 9pm neighbor story. Sets emotional context.", priority: "P1", revenue: false,
      elements: ["Slide 1: Parent with homework problem (emoji + dramatic text)","Slide 2: 3 broken apps (emoji + pain point)","Slide 3: Yeqal solution + 'Get Started Free' CTA","Progress dots between slides","Ethiopian flag color gradient backgrounds"] },
    { emoji: "🔐", name: "Phone Auth / Login", desc: "Phone OTP (Ethiopia) + Google OAuth (diaspora)", priority: "P1", revenue: false,
      elements: ["+251 format phone input","6-digit OTP screen","Google OAuth button","'Continue as guest' option (limited features)"] },
    { emoji: "🏠", name: "Home Dashboard", desc: "Parent alert, search, quick actions, word of the day", priority: "P1", revenue: true,
      elements: ["Search bar (prominent, with language pills)","Parent Alert Card — green gradient if child active","Homework Helper CTA — gold gradient","2x2 quick action grid","Word of the Day card with audio","Bottom navigation bar (5 tabs)","Ad banner if free user"] },
    { emoji: "🔍", name: "Dictionary Search", desc: "Instant offline-first search in all 3 languages", priority: "P1", revenue: true,
      elements: ["Auto-language detection (Ge'ez = Amharic)","Results within 200ms from IndexedDB cache","Native ad every 8 results (free users)","Filter by grade, subject, POS","Result card: all 3 languages + audio buttons"] },
    { emoji: "📖", name: "Word Detail", desc: "Full word page with audio, examples, related words", priority: "P1", revenue: false,
      elements: ["Large Amharic script header","3 audio buttons (one per language)","Tabbed definitions (3 languages)","2 example sentences with audio","Related words carousel","'Practice this word' button","'Report issue' link"] },
    { emoji: "📚", name: "Homework Helper", desc: "Type homework text → instant explanation + practice", priority: "P1", revenue: true,
      elements: ["Text input with language detection","'Explain this' button → Supabase Edge Function","Word-by-word breakdown result","'Practice all words' CTA","Camera placeholder (coming soon)","Bottom banner ad (free users)"] },
    { emoji: "🎤", name: "Speaking Practice", desc: "Record → Hasab AI scores → specific feedback", priority: "P1", revenue: true,
      elements: ["Mode tabs: Word | Sentence | Situation | Free Talk","Word card with native audio hear-first button","Large microphone button (animated recording state)","Score display 0-100 with color coding","Specific phoneme feedback text","Ethiopian situation cards (Market, Bus, Elders...)","Rewarded ad option: 'Watch ad for 3 hearts'"] },
    { emoji: "✍️", name: "Writing Practice", desc: "Script tracing, dictation, compose — Ethiopic script", priority: "P2", revenue: false,
      elements: ["Tab: Script tracing (canvas element, Ethiopic character)","Tab: Dictation (hear audio → tap characters)","Tab: Compose (prompt + AI check)","Ethiopic soft keyboard overlay","Progress: '3/7 characters in ሀ family'"] },
    { emoji: "👨‍👩‍👧", name: "Parent Dashboard", desc: "Live child progress, skills, teacher notes, WhatsApp share", priority: "P1", revenue: true,
      elements: ["Child selector (horizontal scroll if multiple)","3 stat cards: Streak | XP | Completion %","5 skill progress bars with colors","7-day activity bar chart","Teacher notes section","Assignment due dates","WhatsApp Report Share button","PDF report (premium gate)"] },
    { emoji: "🏫", name: "School Mode", desc: "Teacher/Student/Parent triangle — class code system", priority: "P1", revenue: false,
      elements: ["Role selector on first entry","Teacher: stats + assign + student list + red alerts","Student: assignment cards with due dates","Parent: child assignments + practice CTA","Class code join input","'Message parents via WhatsApp' teacher feature"] },
    { emoji: "🃏", name: "Flashcard / Quiz Mode", desc: "Spaced repetition + multiple choice quiz", priority: "P2", revenue: true,
      elements: ["Card flip animation (front = word, back = meaning)","Self-rating: Hard | Medium | Easy buttons","Quiz mode: 4-option multiple choice","Score at end with share button","XP award animation after completion","Streak milestone celebrations"] },
    { emoji: "📊", name: "Progress / Achievements", desc: "Language Passport, badges, XP levels, streak calendar", priority: "P2", revenue: false,
      elements: ["Language Passport card (Ethiopian flag gradient)","4 skill bars with targets","Badge grid (earned bright, locked greyscale)","Monthly streak calendar","Level system with Ethiopian-themed level names"] },
    { emoji: "💎", name: "Premium Subscription", desc: "Diaspora-focused upgrade. Stripe checkout.", priority: "P1", revenue: true,
      elements: ["'Yeqal for Families Abroad 🌍' header","Free vs Premium feature comparison table","Monthly / Yearly / Family plan buttons","Stripe checkout integration","Diaspora testimonial card","'What you unlock' visual list"] },
    { emoji: "📜", name: "Proverbs & Culture", desc: "Daily Ethiopian proverb + calendar (Premium only)", priority: "P2", revenue: true,
      elements: ["Daily proverb card in 3 languages","Cultural context explanation","Audio pronunciation button","Searchable proverb archive","Ethiopian calendar date display","Premium gate with upgrade CTA"] },
    { emoji: "⚙️", name: "Settings / Profile", desc: "Language toggle, notifications, child management, privacy", priority: "P1", revenue: false,
      elements: ["UI language toggle (Amharic | Oromo | English)","Text size: Small | Medium | Large","Daily reminder time picker","Subscription status","'Report a word' shortcut","Privacy statement (2 sentences)","Delete account"] },
  ];

  return (
    <div>
      <Section title="📱 All 16 Screens — Tap to expand" color={C.purple}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <Tag label="P1 = Build first" color={C.green} />
          <Tag label="P2 = Build second" color={C.gold} />
          <Tag label="💰 Revenue = Has ads or payment" color={C.orange} />
        </div>
        {screens.map((s, i) => <ScreenCard key={i} {...s} />)}
      </Section>
    </div>
  );
}

function RevenueSection() {
  return (
    <div>
      <Section title="💰 Revenue Streams" color={C.gold}>
        {[
          { icon: "📢", title: "Google AdSense / AdMob — Domestic Free Users", color: C.blue,
            items: ["Banner ads: bottom of Homework Helper screen","Native ads: every 8 search results (blends naturally)","Rewarded ads: 'Watch 30s ad = 3 extra practice hearts'","Interstitial: once per session after quiz completion ONLY","NEVER in children's mode. NEVER in school assignment flow.","Revenue potential: $3,000–$8,000/month at 500K MAU"] },
          { icon: "⭐", title: "Stripe Subscription — Diaspora Premium", color: C.gold,
            items: ["$4.99/month — individual premium","$39.99/year — annual (save 33%)","$8.99/month — family plan (3 children)","What they get: no ads, unlimited speaking, full offline, PDF reports, proverbs","Revenue potential: 1,000 subscribers = $60K–$120K/year","Target: Ethiopian diaspora in USA, UK, Canada, Saudi Arabia"] },
          { icon: "🏫", title: "School Licensing — Year 2", color: C.teal,
            items: ["$1/student/year for teacher dashboard features","500 schools × 400 students = $200K/year potential","Start with free access for 3 pilot schools → prove value → expand","Requires MoE partnership for scale (already in your roadmap)"] },
        ].map((r, i) => (
          <Box key={i} color={r.color} style={{ padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: r.color, marginBottom: 10 }}>
              {r.icon} {r.title}
            </div>
            {r.items.map((item, j) => (
              <div key={j} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: C.text }}>
                <span style={{ color: r.color, flexShrink: 0 }}>→</span>
                <span>{item}</span>
              </div>
            ))}
          </Box>
        ))}
      </Section>
    </div>
  );
}

function DataSection() {
  return (
    <div>
      <Section title="📊 Data & API Reference" color={C.teal}>
        <Box style={{ padding: "14px", marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.gold, marginBottom: 8 }}>🎤 Hasab AI API</div>
          <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.7 }}>
            URL: <code style={{ background: C.border, padding: "1px 6px", borderRadius: 4, color: C.teal }}>https://api.hasab.ai/v1/pronunciation/score</code><br/>
            Get key at: <code style={{ background: C.border, padding: "1px 6px", borderRadius: 4, color: C.teal }}>developer.hasab.ai</code><br/>
            Send: audio blob + reference text + language code ('am' / 'om')<br/>
            Returns: score (0–100), phoneme-level feedback, suggestions
          </div>
        </Box>
        <Box style={{ padding: "14px", marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.gold, marginBottom: 8 }}>🗄️ Supabase Tables</div>
          <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.7 }}>
            words · sentences · profiles · children · sessions · classes · class_members · assignments · word_feedback
          </div>
        </Box>
        <Box style={{ padding: "14px" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.gold, marginBottom: 8 }}>📦 Offline Cache Strategy</div>
          <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.7 }}>
            On first launch: cache top 2,000 words + audio to IndexedDB via Service Worker<br/>
            Search: IndexedDB first (200ms) → Supabase fallback<br/>
            New words: sync from Supabase on app open if online<br/>
            Child progress: store locally → sync when connected
          </div>
        </Box>
      </Section>
    </div>
  );
}

function DesignSection() {
  const colors = [
    { name: "Green Primary", hex: "#1B6B3A", label: "Brand / CTA" },
    { name: "Gold Accent", hex: "#D4A017", label: "Highlights / Gold" },
    { name: "Red Alert", hex: "#C0392B", label: "Errors / Urgent" },
    { name: "Blue Info", hex: "#2471A3", label: "Info / Links" },
    { name: "Text Primary", hex: "#1A1A2E", label: "Main text" },
    { name: "Text Soft", hex: "#9999AA", label: "Captions" },
    { name: "Card BG", hex: "#FFFFFF", label: "Cards" },
    { name: "Page BG", hex: "#F8F5F0", label: "Background" },
  ];

  return (
    <div>
      <Section title="🎨 Design System" color={C.purple}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {colors.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, background: c.hex, borderRadius: 8, border: `1px solid ${C.border}`, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{c.name}</div>
                <div style={{ fontSize: 11, color: C.mid }}>{c.hex} · {c.label}</div>
              </div>
            </div>
          ))}
        </div>
        <Box style={{ padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: C.gold, marginBottom: 6 }}>Typography</div>
          <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.7 }}>
            Ge'ez script: <strong style={{ color: C.text }}>Noto Sans Ethiopic</strong> (Google Fonts)<br/>
            UI text: <strong style={{ color: C.text }}>Plus Jakarta Sans</strong> or DM Sans<br/>
            Minimum size: 16px body, 20px for Amharic script<br/>
            Touch targets: minimum 48×48px
          </div>
        </Box>
        <Box style={{ padding: "12px 14px" }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: C.gold, marginBottom: 6 }}>Ethiopian Cultural Design</div>
          <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.7 }}>
            Primary color = Ethiopian flag green (#1B6B3A)<br/>
            Accent = Ethiopian flag gold (#D4A017)<br/>
            Confetti in Ethiopian flag colors on achievements<br/>
            🦁 Anbessa lion mascot throughout (emoji placeholder)<br/>
            No Western cartoon aesthetics — Ethiopian aesthetic only
          </div>
        </Box>
      </Section>
    </div>
  );
}

function PromptSection() {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontWeight: 900, fontSize: 22, color: C.gold, marginBottom: 8 }}>🚀 The Complete Replit Prompt</div>
        <div style={{ fontSize: 13, color: C.mid, marginBottom: 16 }}>Copy this entire prompt and paste it into Replit Agent</div>
        <CopyBtn text={FULL_PROMPT} label="Copy Full Prompt to Clipboard" />
      </div>
      <Box color={C.gold} style={{ padding: "16px", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.gold, marginBottom: 10 }}>📋 Step-by-Step Instructions for Replit</div>
        {[
          "1. Go to replit.com → Create new Repl",
          "2. Select 'React' template or use Replit Agent",
          "3. Paste the full prompt above into the Agent chat",
          "4. First message to Replit: 'Build this exactly as specified. Start with: (1) Supabase schema setup, (2) Home screen + Navigation, (3) Dictionary search with offline cache, (4) Word Detail page.'",
          "5. For pronunciation: 'Connect the Hasab AI API in the Speaking Practice screen. Use the fetch pattern in the prompt.'",
          "6. For payments: 'Implement Stripe subscription with the 3 plans in the Premium screen.'",
          "7. For ads: 'Add Google AdSense placeholders in the exact locations specified — search results, homework helper bottom, quiz end.'",
          "8. Test on mobile: open Replit preview on your phone, install as PWA",
        ].map((step, i) => (
          <div key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.8, marginBottom: 4 }}>{step}</div>
        ))}
      </Box>
      <Box style={{ padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.green, marginBottom: 8 }}>✅ What Replit Should Deliver</div>
        {["Working PWA installable on Android Chrome","Dictionary search in Amharic + Oromo + English (200 seed words)","Speaking practice with microphone recording + Hasab AI score","Parent dashboard with child progress bars","School class code join system","WhatsApp report share button","Google AdSense ad placements (non-intrusive)","Stripe subscription flow for diaspora premium","Service worker caching top 2,000 words offline","PostHog analytics events tracking"].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: C.text }}>
            <span style={{ color: C.green }}>✓</span>{item}
          </div>
        ))}
      </Box>
      <div style={{ background: C.green + "15", borderRadius: 14, padding: "16px", border: `1px solid ${C.green}30`, textAlign: "center" }}>
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>
          <strong style={{ color: C.gold }}>The product exists to answer one question:</strong><br/>
          "Can a parent at 9pm help their child with language homework?"<br/>
          <span style={{ color: C.green, fontWeight: 700 }}>Every screen you build must say yes.</span>
        </div>
      </div>
    </div>
  );
}

const SECTION_CONTENT = {
  cover: Cover,
  context: ContextSection,
  tech: TechSection,
  screens: ScreensSection,
  revenue: RevenueSection,
  data: DataSection,
  design: DesignSection,
  prompt: PromptSection,
};

export default function App() {
  const [active, setActive] = useState("cover");
  const Content = SECTION_CONTENT[active];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.text }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #060610, #101028)`, borderBottom: `1px solid ${C.border}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🇪🇹</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 17, color: C.gold }}>YEQAL · ያቃል — Replit Build Prompt</div>
            <div style={{ fontSize: 11, color: C.mid }}>Complete specification for production PWA → Play Store</div>
          </div>
          {active === "prompt" && (
            <CopyBtn text={FULL_PROMPT} label="Copy Prompt" />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex" }}>
          {SECTIONS.map(s => (
            <div key={s} onClick={() => setActive(s)} style={{
              padding: "10px 14px", fontWeight: 700, fontSize: 11,
              color: active === s ? C.gold : C.mid,
              borderBottom: `2px solid ${active === s ? C.gold : "transparent"}`,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
              background: s === "prompt" && active !== s ? C.green + "22" : "transparent"
            }}>
              {LABELS[s]}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px 60px" }}>
        <Content />
      </div>
    </div>
  );
}

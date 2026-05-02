-- YEQAL ያቃል — Supabase Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/cfpcxikjhxzymrplrimm/sql

-- ─────────────────────────────────────────────
-- 1. WORDS TABLE (trilingual dictionary)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.words (
  id            TEXT PRIMARY KEY,
  english       TEXT NOT NULL,
  amharic       TEXT NOT NULL,
  oromo         TEXT NOT NULL,
  romanization  TEXT,
  pos           TEXT DEFAULT 'noun',
  grade_level   INT DEFAULT 1,
  subject       TEXT DEFAULT 'general',
  definition_en TEXT,
  example_en    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "words_public_read" ON public.words FOR SELECT USING (true);

-- ─────────────────────────────────────────────
-- 2. SESSIONS TABLE (homework sessions)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id   TEXT NOT NULL,
  child_id    TEXT,
  child_name  TEXT,
  grade_level INT,
  input_text  TEXT NOT NULL,
  word_ids    TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_device_read"  ON public.sessions FOR SELECT USING (true);
CREATE POLICY "sessions_device_write" ON public.sessions FOR INSERT WITH CHECK (true);

-- ─────────────────────────────────────────────
-- 3. PROFILES TABLE (device-linked profiles)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  device_id         TEXT PRIMARY KEY,
  name              TEXT NOT NULL DEFAULT 'Parent',
  role              TEXT DEFAULT 'parent',
  ui_language       TEXT DEFAULT 'amharic',
  learning_language TEXT DEFAULT 'amharic',
  is_premium        BOOLEAN DEFAULT FALSE,
  streak            INT DEFAULT 0,
  xp                INT DEFAULT 0,
  favorites         TEXT[] DEFAULT '{}',
  learned_words     TEXT[] DEFAULT '{}',
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_device_read"   ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_device_write"  ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_device_update" ON public.profiles FOR UPDATE USING (true);

-- ─────────────────────────────────────────────
-- 4. CHILDREN TABLE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.children (
  id                TEXT PRIMARY KEY,
  device_id         TEXT NOT NULL REFERENCES public.profiles(device_id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  grade_level       INT DEFAULT 1,
  learning_language TEXT DEFAULT 'amharic',
  school_name       TEXT,
  initials          TEXT,
  avatar            TEXT DEFAULT '👦',
  streak            INT DEFAULT 0,
  xp                INT DEFAULT 0,
  skill_speaking    INT DEFAULT 0,
  skill_listening   INT DEFAULT 0,
  skill_reading     INT DEFAULT 0,
  skill_writing     INT DEFAULT 0,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "children_device_read"   ON public.children FOR SELECT USING (true);
CREATE POLICY "children_device_write"  ON public.children FOR INSERT WITH CHECK (true);
CREATE POLICY "children_device_update" ON public.children FOR UPDATE USING (true);
CREATE POLICY "children_device_delete" ON public.children FOR DELETE USING (true);

-- ─────────────────────────────────────────────
-- 5. WORD SUGGESTIONS (user submitted words)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.word_suggestions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id  TEXT,
  english    TEXT,
  amharic    TEXT,
  oromo      TEXT,
  context    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.word_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suggestions_write" ON public.word_suggestions FOR INSERT WITH CHECK (true);

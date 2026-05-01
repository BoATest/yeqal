import { useState } from "react";

const C = {
  bg: "#0A0A14", card: "#12121E", cardHover: "#1A1A2E",
  border: "#1E1E35", text: "#E8E8F5", mid: "#8888AA", soft: "#4A4A6A",
  green: "#1B6B3A", greenLight: "#2D9A54", greenGlow: "#1B6B3A40",
  gold: "#D4A017", goldLight: "#F5C842", goldGlow: "#D4A01740",
  red: "#C0392B", redLight: "#E74C3C",
  blue: "#1A6B9A", blueLight: "#2980B9",
  purple: "#6B2D9A", purpleLight: "#8E44AD",
  orange: "#C05A1A", orangeLight: "#E67E22",
  teal: "#0E7490", tealLight: "#0EA5C9",
  white: "#FFFFFF",
};

const VIEWS = { COMPARE:"compare", DECISIONS:"decisions", NEXTWEEKS:"weeks", MISSING:"missing", MVP:"mvp" };

// ── ATOMS ──────────────────────────────────────────────────
function Pill({ label, color = C.green, size = "sm" }) {
  const fs = size === "xs" ? 10 : size === "sm" ? 11 : 13;
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`,
      fontSize: fs, fontWeight: 700, padding: size === "xs" ? "1px 7px" : "3px 10px",
      borderRadius: 20, whiteSpace: "nowrap", letterSpacing: 0.3 }}>
      {label}
    </span>
  );
}

function Box({ children, style = {}, glow, color = C.border, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, borderRadius: 14, border: `1px solid ${glow ? color : C.border}`,
      boxShadow: glow ? `0 0 24px ${color}30` : "none",
      transition: "all 0.2s", cursor: onClick ? "pointer" : "default", ...style
    }}>
      {children}
    </div>
  );
}

function Row({ children, gap = 8, wrap }) {
  return <div style={{ display: "flex", gap, alignItems: "center", flexWrap: wrap ? "wrap" : "nowrap" }}>{children}</div>;
}

function SectionHeader({ icon, title, subtitle, color = C.gold }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Row gap={10}>
        <span style={{ fontSize: 30 }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 900, fontSize: 19, color }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: C.mid, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </Row>
    </div>
  );
}

function ProgressArc({ pct, color, size = 60 }) {
  const r = (size - 10) / 2, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={6} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
        strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s ease" }} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={13} fontWeight={800} fill={color}>{pct}%</text>
    </svg>
  );
}

// ── VIEW 1: THE BIG COMPARE ──────────────────────────────
function Compare() {
  const [open, setOpen] = useState(null);

  const items = [
    {
      topic: "🏗️ Architecture",
      verdict: "WE WIN",
      verdictColor: C.green,
      ours: { label: "✅ Online-first + smart cache", detail: "Urban Ethiopia is 80%+ 4G. Online = live parent dashboard, instant word updates, real-time AI scoring. Smart cache = top 2,000 words + active lessons downloaded on first launch. Never breaks at 9pm." },
      chatgpt: { label: "❌ Supabase (pure cloud)", detail: "Supabase requires constant internet. A single API call away from breaking. No offline plan." },
      qwen: { label: "⚠️ Pure offline-first + SQLite", detail: "Too rigid. Misses live features. Cryptographic DB signing for an MVP is over-engineering." },
    },
    {
      topic: "🎤 Pronunciation Engine",
      verdict: "WE WIN",
      verdictColor: C.green,
      ours: { label: "✅ Hasab AI (Ethiopian-built)", detail: "Hasab AI: 97% Amharic accuracy, Afan Oromo support, live developer API at developer.hasab.ai, free tier. Ethiopian team. Real product in 2026." },
      chatgpt: { label: "❌ Meta MMS / Coqui TTS", detail: "Unverified Amharic quality. No Oromo TTS confirmed. Coqui project has stalled. MMS is research-grade not production." },
      qwen: { label: "⚠️ Piper TTS + Meta MMS", detail: "Piper has no verified Amharic voice model. Meta MMS works but offline only. Misses Hasab entirely." },
    },
    {
      topic: "📚 Primary Data Source",
      verdict: "WE AGREE WITH QWEN",
      verdictColor: C.teal,
      ours: { label: "✅ ethiopialearning.com (MoE textbooks)", detail: "Grade 1–8 textbooks in Amharic + Oromo. Official. Curriculum-aligned. Free download. This is the single best source for school-relevant vocabulary." },
      chatgpt: { label: "❌ Wiktionary as primary", detail: "Wiktionary has general vocabulary, not school-aligned. Many entries are incomplete or wrong for Ethiopian usage." },
      qwen: { label: "✅ MoE textbooks (correctly identified)", detail: "Qwen correctly recommends MoE curriculum documents as primary. This is the one thing Qwen got right over ChatGPT." },
    },
    {
      topic: "📱 App Builder Strategy",
      verdict: "WE WIN",
      verdictColor: C.green,
      ours: { label: "✅ FlutterFlow = prototype ONLY → Flutter for production", detail: "FlutterFlow validates concept in 4 weeks cheaply. Hits production walls by Month 3. Real Flutter code for the final app. This is the professional path." },
      chatgpt: { label: "❌ FlutterFlow for full production", detail: "This will break when you add offline sync, complex Firebase rules, and AI API calls. ChatGPT has never shipped a production Flutter app." },
      qwen: { label: "⚠️ Pure Flutter from Day 1", detail: "Correct for production. But too slow for solo validation. Skip the prototype stage and you'll build the wrong thing." },
    },
    {
      topic: "🏫 School / Homework Core",
      verdict: "WE WIN",
      verdictColor: C.green,
      ours: { label: "✅ School triangle is Phase 1 CORE", detail: "Teacher assigns → child practices → parent sees progress. This is the 9pm neighbor call solution. It must exist from Day 1. Not Phase 2." },
      chatgpt: { label: "❌ School mode is post-MVP", detail: "ChatGPT defers the most important differentiating feature. A general dictionary without school alignment is already built by others." },
      qwen: { label: "❌ Not addressed", detail: "Qwen is purely technical. Never considers that the user's origin story IS the school homework problem." },
    },
    {
      topic: "💰 Revenue Strategy",
      verdict: "WE WIN",
      verdictColor: C.green,
      ours: { label: "✅ Diaspora premium first ($5–10/mo USD)", detail: "2.5M+ Ethiopian diaspora. Pays in USD/EUR. Heritage motivation strong. Revenue from Day 1. School licensing in Year 2. Domestic ads supplement." },
      chatgpt: { label: "❌ No monetization strategy", detail: "ChatGPT provides zero revenue thinking. An app without a business model is a hobby project." },
      qwen: { label: "❌ Not addressed", detail: "Qwen is a pure technical document. No commercial thinking whatsoever." },
    },
    {
      topic: "📷 Homework Camera / OCR",
      verdict: "WE AGREE WITH QWEN",
      verdictColor: C.teal,
      ours: { label: "✅ Defer OCR to v1.1. Use Google ML Kit.", detail: "Tesseract has ~60% accuracy on Ge'ez script — that's a frustration machine. Google ML Kit supports Amharic and runs on-device. Defer to v1.1 and validate the dictionary first." },
      chatgpt: { label: "❌ Use Tesseract OCR", detail: "Tesseract cannot reliably read Ethiopic script. This would ship a broken feature." },
      qwen: { label: "✅ Defer OCR to v1.1 (correctly)", detail: "Qwen correctly calls out Tesseract's poor Ge'ez support and recommends deferring. Good catch." },
    },
    {
      topic: "🔒 Database Cryptographic Signing",
      verdict: "SKIP FOR MVP",
      verdictColor: C.orange,
      ours: { label: "✅ Not in MVP. Maybe Year 2.", detail: "Ed25519 signing, key rotation every 6 months, signature verification on app launch — this is enterprise security for a consumer dictionary MVP. Build trust through quality content, not cryptography." },
      chatgpt: { label: "— Not mentioned", detail: "" },
      qwen: { label: "⚠️ Required for MVP", detail: "Qwen treats this as a launch requirement. It is real security engineering — but it slows you down 3 weeks for a problem users won't experience at 1,000 users." },
    },
    {
      topic: "❤️ Emotional Core",
      verdict: "ONLY WE HAVE THIS",
      verdictColor: C.gold,
      ours: { label: "✅ The 9pm neighbor call is the product", detail: "Every feature decision is filtered through: does this prevent the moment a parent calls a neighbor because they can't help their child? This is the brand, the story, and the growth engine." },
      chatgpt: { label: "— Generic problem statement", detail: "No emotional hook. Could be a healthcare app or a cooking app." },
      qwen: { label: "— Purely technical document", detail: "Zero emotional intelligence. Zero cultural connection. This is why external AIs can't replace the conversation you had about your own experience." },
    },
  ];

  return (
    <div>
      <SectionHeader icon="⚖️" title="Claude vs ChatGPT vs Qwen" subtitle="Where each AI got it right — and where they got it wrong. Our conversation wins on what matters." />
      <div style={{ background: C.gold + "12", borderRadius: 12, padding: "12px 16px", marginBottom: 18, border: `1px solid ${C.gold}30` }}>
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>
          <strong style={{ color: C.gold }}>The key fact:</strong> ChatGPT and Qwen are both working from your pasted documents without the context of our full conversation. They don't know your origin story, your school triangle insight, the Enkutatash launch date, or why you built this. That context lives here — and it changes every major decision.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it, i) => (
          <Box key={i} onClick={() => setOpen(open === i ? null : i)} glow={open === i} color={verdictColor(it.verdict)} style={{ padding: "14px 16px", cursor: "pointer" }}>
            <Row gap={12}>
              <div style={{ flex: 1 }}>
                <Row gap={10} wrap>
                  <span style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{it.topic}</span>
                  <Pill label={it.verdict} color={it.verdictColor} />
                </Row>
              </div>
              <span style={{ color: C.mid, fontSize: 16 }}>{open === i ? "▲" : "▼"}</span>
            </Row>
            {open === i && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { ai: "🟢 Our Approach", data: it.ours, color: C.green },
                  { ai: "🟡 ChatGPT Says", data: it.chatgpt, color: "#10a37f" },
                  { ai: "🟣 Qwen Says", data: it.qwen, color: C.purple },
                ].map((col, ci) => (
                  <div key={ci} style={{ background: C.bg, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: col.color, marginBottom: 6 }}>{col.ai}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 5 }}>{col.data.label}</div>
                    {col.data.detail && <div style={{ fontSize: 11, color: C.mid, lineHeight: 1.5 }}>{col.data.detail}</div>}
                  </div>
                ))}
              </div>
            )}
          </Box>
        ))}
      </div>
    </div>
  );
}

function verdictColor(v) {
  if (v.includes("WIN")) return C.green;
  if (v.includes("AGREE")) return C.teal;
  if (v.includes("SKIP")) return C.orange;
  return C.gold;
}

// ── VIEW 2: LOCKED DECISIONS ────────────────────────────
function Decisions() {
  const decisions = [
    { n:"01", title:"Online-first + smart cache", icon:"🌐", color: C.green, locked: true,
      what:"Build as an online app with a local cache of 2,000 core words and active lessons. NOT pure offline.", when:"This week" },
    { n:"02", title:"Hasab AI for pronunciation", icon:"🎤", color: C.blue, locked: true,
      what:"Go to developer.hasab.ai, get API key, test 20 Amharic words. This is your pronunciation engine.", when:"This week" },
    { n:"03", title:"FlutterFlow = 4-week prototype", icon:"📱", color: C.purple, locked: true,
      what:"Build prototype to validate with parents. Not production. Flutter code comes when you hire a developer.", when:"Week 1–4" },
    { n:"04", title:"School triangle is Phase 1", icon:"🏫", color: C.teal, locked: true,
      what:"Teacher assigns → child practices → parent sees progress. This is your core differentiator from Day 1.", when:"Week 3–4" },
    { n:"05", title:"ethiopialearning.com data first", icon:"📚", color: C.gold, locked: true,
      what:"Download Grade 3–5 textbooks from Ministry of Education site. This beats Wiktionary for school use.", when:"This week" },
    { n:"06", title:"Diaspora premium from Day 1", icon:"💰", color: C.orange, locked: true,
      what:"$4.99–9.99/month USD target. Build the diaspora payment flow in parallel with the free domestic version.", when:"Month 2" },
    { n:"07", title:"Defer OCR camera to v1.1", icon:"📷", color: C.mid, locked: true,
      what:"Tesseract is broken for Ge'ez. Google ML Kit is the right tool. But validate dictionary first. OCR is v1.1.", when:"Phase 2" },
    { n:"08", title:"Enkutatash Sept 11 = launch day", icon:"🎉", color: C.gold, locked: true,
      what:"Ethiopian New Year, school year start. Best possible launch window. Everything before then is beta.", when:"Sept 11" },
  ];

  return (
    <div>
      <SectionHeader icon="🔒" title="8 Locked Decisions" subtitle="From our full conversation. These don't change regardless of what other AIs say." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {decisions.map((d, i) => (
          <Box key={i} glow color={d.color} style={{ padding: "14px 16px" }}>
            <Row gap={10} style={{ marginBottom: 8 }}>
              <div style={{ width: 34, height: 34, background: d.color + "22", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontWeight: 900, fontSize: 12, color: d.color }}>{d.n}</span>
              </div>
              <span style={{ fontSize: 16 }}>{d.icon}</span>
              <Pill label={d.locked ? "LOCKED ✓" : "TBD"} color={d.locked ? C.green : C.mid} size="xs" />
            </Row>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 6 }}>{d.title}</div>
            <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.5, marginBottom: 8 }}>{d.what}</div>
            <Pill label={`→ ${d.when}`} color={d.color} size="xs" />
          </Box>
        ))}
      </div>
    </div>
  );
}

// ── VIEW 3: NEXT 8 WEEKS ────────────────────────────────
function NextWeeks() {
  const [week, setWeek] = useState(0);

  const weeks = [
    {
      label: "This Week", emoji: "🚀", color: C.gold, milestone: "Data ready. API keys in hand. Account created.",
      tasks: [
        { t: "Go to ethiopialearning.com → download Grade 3, 4, 5 Amharic + Oromo textbooks (PDF, free)", who: "You", hrs: "1hr", hot: true },
        { t: "Open Google Sheets → create columns: Word | Amharic | Oromo | English | Grade | Example | Verified?", who: "You", hrs: "30min", hot: true },
        { t: "Go to hasab.ai → install Chrome extension → speak 10 Amharic words → test accuracy yourself", who: "You", hrs: "30min", hot: true },
        { t: "Go to developer.hasab.ai → create account → get API key → save it", who: "You", hrs: "20min", hot: true },
        { t: "Go to flutterflow.io → create free account → new project → name it Yeqal", who: "You", hrs: "20min", hot: false },
        { t: "Extract 300 words from Grade 3 Amharic textbook into your Google Sheet", who: "You", hrs: "3hrs", hot: true },
      ]
    },
    {
      label: "Week 2", emoji: "📚", color: C.green, milestone: "500 verified words. Linguist onboarded.",
      tasks: [
        { t: "Reach out to 2 Amharic/Oromo teachers via WhatsApp. Offer to pay per verified word.", who: "You", hrs: "2hrs", hot: true },
        { t: "Grow spreadsheet to 500 words with Amharic + Oromo + English + 1 example sentence each", who: "You", hrs: "5hrs", hot: true },
        { t: "Email MoE Curriculum Directorate: formal request for Grade 1–8 word lists", who: "You", hrs: "1hr", hot: false },
        { t: "Record yourself (or a friend) saying 50 words on your phone → save as voice notes", who: "You", hrs: "1hr", hot: false },
        { t: "Search 'EthioTech' on Telegram → join 3 groups → post looking for Flutter dev", who: "You", hrs: "30min", hot: false },
      ]
    },
    {
      label: "Week 3", emoji: "📱", color: C.blue, milestone: "Prototype on your phone.",
      tasks: [
        { t: "In FlutterFlow: Build Home screen (green header + search bar + 4 action cards)", who: "You", hrs: "3hrs", hot: true },
        { t: "Connect your Google Sheet as the data source in FlutterFlow (no code needed)", who: "You", hrs: "1hr", hot: true },
        { t: "Build Word Detail screen: Amharic + Oromo + English + example + audio button placeholder", who: "You", hrs: "2hrs", hot: true },
        { t: "Build Homework Helper screen: photo button + text input + language selector", who: "You", hrs: "2hrs", hot: true },
        { t: "Install prototype on your own Android phone via FlutterFlow preview link", who: "You", hrs: "30min", hot: true },
      ]
    },
    {
      label: "Week 4", emoji: "👨‍👩‍👧", color: C.purple, milestone: "Real parent feedback collected.",
      tasks: [
        { t: "Build Parent Dashboard screen in FlutterFlow: child name + streak + 3 skill bars + teacher note", who: "You", hrs: "2hrs", hot: true },
        { t: "Share prototype link in your child's school WhatsApp group with your origin story (not a sales pitch)", who: "You", hrs: "30min", hot: true },
        { t: "Sit with 3 parents. Say nothing. Watch how they use it. Note where they get stuck.", who: "You", hrs: "2hrs", hot: true },
        { t: "Ask: 'Would you use this? What's confusing? What's missing?' Fix top 3 problems only.", who: "You", hrs: "2hrs", hot: true },
        { t: "Set up Carrd.co landing page: your story + email waitlist (free, takes 30 min)", who: "You", hrs: "30min", hot: false },
      ]
    },
    {
      label: "Week 5–6", emoji: "🤝", color: C.teal, milestone: "Addis AI meeting done. Hasab integrated.",
      tasks: [
        { t: "Book Addis AI meeting. Take our 10-question document. Lead with data exchange offer.", who: "You", hrs: "30min", hot: true },
        { t: "Connect Hasab API to FlutterFlow prototype: record → send to Hasab → show pronunciation score", who: "Dev/You", hrs: "3hrs", hot: true },
        { t: "Interview 2–3 Flutter developers from EthioTech Telegram groups", who: "You", hrs: "4hrs", hot: true },
        { t: "Post in Ethiopian diaspora Facebook groups: 'Would you pay $5/month for this?'", who: "You", hrs: "1hr", hot: false },
        { t: "Prepare 1-page Yeqal overview for Addis AI meeting + schools", who: "You", hrs: "2hrs", hot: true },
      ]
    },
    {
      label: "Week 7–8", emoji: "💰", color: C.orange, milestone: "Developer hired. Grant applied for.",
      tasks: [
        { t: "Apply to Mastercard Foundation EdTech Fellowship (up to $60K equity-free)", who: "You", hrs: "8hrs", hot: true },
        { t: "Hire Flutter developer. Show them: prototype + Hasab API docs + our architecture decision.", who: "You", hrs: "4hrs", hot: true },
        { t: "Developer starts production Flutter app (Firebase + Hive cache + Drift SQLite)", who: "Dev", hrs: "Full time", hot: true },
        { t: "Linguist delivers first 1,000 verified words into the Airtable review queue", who: "Linguist", hrs: "Ongoing", hot: true },
        { t: "Contact 2 private schools in Addis: free access for 1 semester in exchange for feedback", who: "You", hrs: "2hrs", hot: false },
      ]
    },
  ];

  const w = weeks[week];

  return (
    <div>
      <SectionHeader icon="📅" title="Your 8-Week Path" subtitle="Week by week. Task by task. Who does what." />
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
        {weeks.map((wk, i) => (
          <div key={i} onClick={() => setWeek(i)} style={{
            flexShrink: 0, background: i === week ? wk.color + "22" : C.card,
            border: `1px solid ${i === week ? wk.color : C.border}`, borderRadius: 12,
            padding: "8px 14px", cursor: "pointer", textAlign: "center", minWidth: 80
          }}>
            <div style={{ fontSize: 14 }}>{wk.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: i === week ? wk.color : C.mid, marginTop: 3 }}>{wk.label}</div>
          </div>
        ))}
      </div>
      <Box style={{ padding: "16px", borderColor: w.color + "60", border: `1px solid ${w.color}60` }}>
        <Row gap={10} style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 24 }}>{w.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 17, color: w.color }}>{w.label}</div>
            <div style={{ fontSize: 12, color: C.mid, marginTop: 2 }}>Target: {w.milestone}</div>
          </div>
        </Row>
        {w.tasks.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < w.tasks.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: t.hot ? C.gold : C.border, flexShrink: 0, marginTop: 5 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: t.hot ? C.text : C.mid, lineHeight: 1.5, marginBottom: 5 }}>{t.t}</div>
              <Row gap={6} wrap>
                <Pill label={`👤 ${t.who}`} color={C.blue} size="xs" />
                <Pill label={`⏱ ${t.hrs}`} color={C.purple} size="xs" />
                {t.hot && <Pill label="Critical" color={C.gold} size="xs" />}
              </Row>
            </div>
          </div>
        ))}
      </Box>
    </div>
  );
}

// ── VIEW 4: THINGS YOU'RE NOT CONSIDERING ───────────────
function Missing() {
  const [open, setOpen] = useState(null);

  const items = [
    {
      emoji: "📲", title: "WhatsApp Reports — Not Email", priority: "HIGH", color: C.green, mustHave: true,
      why: "Ethiopian parents live on WhatsApp, not email. Your parent dashboard weekly report should arrive as a WhatsApp message: 'Liya practiced 24 minutes today. She knows 9 of 15 test words. Tap to see details.' This is also your viral loop — parents share it with other parents.",
      action: "Add 'Send to WhatsApp' button on every progress screen. WhatsApp's share API is completely free. Zero engineering. 10 minutes to add."
    },
    {
      emoji: "🤖", title: "Telegram Bot Before the App", priority: "HIGH", color: C.green, mustHave: true,
      why: "Ethiopia has massive Telegram usage. A @YeqalBot that answers word lookups in Telegram gives you real users before the app even exists on the Play Store. 'ቤት = Mana (Oromo) = House (English) 🔊' — that's the whole bot. It also tests your dictionary quality for free.",
      action: "Set up on ManyBot.net (no code). Connect to your Google Sheet. Share in Ethiopian education Telegram groups. Done in 2 hours."
    },
    {
      emoji: "🔒", title: "Child Data Privacy — Build It In Now", priority: "CRITICAL", color: C.red, mustHave: true,
      why: "You are collecting data on children under 13. Every school partnership will ask about this. Every diaspora parent will ask about this. You need: explicit parent consent before any child profile is created, a clear privacy statement ('we never sell data'), and encrypted storage for child progress. If you wait to address this, you will be rebuilding it under pressure.",
      action: "Add a consent screen before any child profile is created. Two sentences: 'Your child's progress is only visible to you and the teacher you choose. We never sell your data.' That's it for MVP."
    },
    {
      emoji: "🎉", title: "Enkutatash = Your Launch Date", priority: "HIGH", color: C.gold, mustHave: true,
      why: "Ethiopian New Year (September 11) is when the school year restarts. Every parent is thinking about their children's education. It's the most emotionally resonant launch window in the Ethiopian calendar — 'start the new year with the tool that helps your child succeed.' No other Ethiopian EdTech app has ever done a cultural launch like this.",
      action: "Mark September 11 as your public v1.0 launch. Every beta test, every tweak, every school partnership leads to this date."
    },
    {
      emoji: "📏", title: "App Size Budget", priority: "HIGH", color: C.blue, mustHave: true,
      why: "ChatGPT and Qwen both ignore this completely. With 5,000 audio files + offline dictionary + images, your app can easily hit 300MB. A parent with a 16GB phone (very common in Ethiopia) will never install it. Target: under 60MB on first install. Stream audio on demand after the top 2,000 words.",
      action: "Audio: OPUS format at 32kbps (60% smaller than MP3). Images: WebP compressed under 50KB each. Core word audio bundled. All else streamed. Aim for 35–45MB total app download."
    },
    {
      emoji: "🌍", title: "English Path for Ethiopian Students", priority: "MEDIUM", color: C.teal, mustHave: false,
      why: "You observed students in your child's school struggling with English. Ethiopia's Grade 12 national exam requires English. Adding Amharic→English and Oromo→English learning paths doubles your addressable market using the same infrastructure. The data structure doesn't change. You just add English as a learning target.",
      action: "Phase 2. Note it now in your roadmap. One additional English linguist. Same app, same architecture."
    },
    {
      emoji: "📊", title: "3 Metrics That Actually Matter", priority: "MEDIUM", color: C.purple, mustHave: false,
      why: "Day-7 retention is #1. But also track: Search Success Rate (did the user find the word they needed?), and Homework Session Completion (did the child finish practicing the assigned words?). These three metrics tell you if your product works, not just if people open it. Downloads are vanity.",
      action: "Add Firebase Analytics events: search_attempted, search_found (true/false), practice_completed. Three events. 1 hour to implement."
    },
    {
      emoji: "🦁", title: "Anbessa Design Matters Now", priority: "MEDIUM", color: C.orange, mustHave: false,
      why: "Duolingo's owl is worth $100M in brand value. Anbessa the Lion is on the Ethiopian flag, in culture, and in the hearts of every Ethiopian child. But you need to design him properly — a mascot must work as a 32x32 app icon, a sticker, a push notification character, and eventually a t-shirt. A bad mascot kills the brand.",
      action: "Commission a professional illustration. Not Canva. Not AI-generated. Find an Ethiopian illustrator on Behance or Instagram. Budget: $200–500. This is worth it."
    },
    {
      emoji: "🔗", title: "Landing Page This Week", priority: "HIGH", color: C.green, mustHave: true,
      why: "You need an email/WhatsApp waitlist before you touch the Play Store. A landing page at yeqal.app (or yeqal.et if available) that tells your 9pm neighbor story and collects contacts gives you 500 warm users to invite on launch day. Without it you launch into silence.",
      action: "Build on Carrd.co (free, no code, 30 minutes). Tell the origin story. Add email form. Share in Ethiopian parent WhatsApp and Telegram groups today."
    },
    {
      emoji: "🏛️", title: "MoE Relationship — Knock Early", priority: "HIGH", color: C.teal, mustHave: false,
      why: "The Ministry of Education partnership takes 8+ weeks to process. If you start the formal request letter today, it might arrive in time for your September launch. If you wait until your app is built, you'll miss the school year. The letter is one page. The value is enormous: official curriculum data + credibility with schools.",
      action: "Write a 1-page letter to MoE Curriculum Directorate: 'We are building a free educational tool for Ethiopian students. We request permission to use Grade 1–8 vocabulary lists.' Send this week."
    },
  ];

  return (
    <div>
      <SectionHeader icon="💡" title="Things You Are Not Considering" subtitle="Important items missing from your planning — some critical, some high-value, all actionable." />
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Pill label="Must Have" color={C.red} />
        <span style={{ fontSize: 12, color: C.mid }}>= critical for launch</span>
        <Pill label="HIGH" color={C.gold} />
        <span style={{ fontSize: 12, color: C.mid }}>= important before or at launch</span>
        <Pill label="MEDIUM" color={C.blue} />
        <span style={{ fontSize: 12, color: C.mid }}>= adds significant value</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {items.map((it, i) => (
          <Box key={i} onClick={() => setOpen(open === i ? null : i)} glow={open === i} color={it.color} style={{ padding: "13px 15px", cursor: "pointer" }}>
            <Row gap={12}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{it.emoji}</span>
              <div style={{ flex: 1 }}>
                <Row gap={8} wrap>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{it.title}</span>
                  {it.mustHave && <Pill label="Must Have" color={C.red} size="xs" />}
                  <Pill label={it.priority} color={it.color} size="xs" />
                </Row>
                <div style={{ fontSize: 12, color: C.mid, marginTop: 3 }}>{it.why.slice(0, 90)}…</div>
              </div>
              <span style={{ color: C.mid }}>{open === i ? "▲" : "▼"}</span>
            </Row>
            {open === i && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 10 }}>{it.why}</div>
                <div style={{ background: C.gold + "15", borderRadius: 10, padding: "10px 13px", border: `1px solid ${C.gold}30` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.gold }}>→ Action: </span>
                  <span style={{ fontSize: 12, color: C.text }}>{it.action}</span>
                </div>
              </div>
            )}
          </Box>
        ))}
      </div>
    </div>
  );
}

// ── VIEW 5: MVP AT A GLANCE ──────────────────────────────
function MVPView() {
  const phases = [
    {
      phase: "v1.0 MVP", timeline: "Month 1–6", color: C.green, launch: "Sept 11 (Enkutatash)",
      goal: "Prove the core loop: parent can help child with homework at 9pm without calling a neighbor.",
      features: [
        { name: "Smart Word Search", detail: "Search in Amharic, Oromo, or English. Results in all 3 languages. Works online and from cache offline.", must: true },
        { name: "Example Sentences", detail: "2 sentences per word, grade-appropriate, in all 3 languages with audio.", must: true },
        { name: "Pronunciation Audio (Hasab AI)", detail: "Top 2,000 words with native audio. Child speaks → Hasab AI scores it. Not just playback — feedback.", must: true },
        { name: "Picture Dictionary", detail: "500 common objects (culturally Ethiopian images). Compressed WebP < 50KB each.", must: true },
        { name: "Homework Helper (text input)", detail: "Type or paste homework text → get word-by-word explanation + practice. Camera (OCR) is v1.1.", must: true },
        { name: "Parent Dashboard", detail: "Child streak, 4 skill bars (speaking/listening/reading/writing), weekly WhatsApp summary.", must: true },
        { name: "School Triangle (basic)", detail: "Teacher creates class → shares code → parents + students join → teacher assigns word lists.", must: true },
        { name: "Word Suggestion & Feedback", detail: "User flags wrong word → goes to linguist queue → fixed in next sync.", must: false },
      ],
      data: "5,000 verified words (Grade 1–8 aligned, MoE curriculum). 10,000 example sentences. 2,000 audio files.",
      tech: "Flutter + Firebase + Hive cache + Drift SQLite. Hasab AI API. Google Firebase Auth (phone number).",
      size: "Target: under 60MB download.",
      revenue: "Free (domestic). Diaspora premium $4.99/mo from Day 1."
    },
    {
      phase: "v1.1", timeline: "Month 7–9", color: C.blue, launch: "",
      goal: "Add OCR camera feature and deepen learning engine.",
      features: [
        { name: "Homework Camera (OCR)", detail: "Google ML Kit on-device. Photo textbook page → extract Amharic/Oromo text → translate + explain.", must: true },
        { name: "Skill Tree", detail: "Visual Grade 1–8 curriculum map. Locked/unlocked nodes. Parents see the full path.", must: true },
        { name: "Oral Exam Prep Mode", detail: "Teacher uploads exam word list → app creates targeted practice → readiness score before test day.", must: true },
        { name: "Leaderboard", detail: "Regional weekly leagues (Addis vs Jimma vs Bahir Dar). Diaspora league separate.", must: false },
      ],
      data: "10,000+ words. English learning path added.",
      tech: "Google ML Kit for OCR. Firebase push notifications (exam reminders).",
      size: "", revenue: "School tier: $1/student/year."
    },
    {
      phase: "v2.0", timeline: "Year 2", color: C.gold, launch: "",
      goal: "AI layer, conversation practice, platform expansion.",
      features: [
        { name: "AI Conversation Tutor", detail: "Child speaks freely. Hasab + fine-tuned model responds. Real conversation practice.", must: true },
        { name: "Ethiopian Proverb Engine", detail: "Daily proverb in Amharic + Oromo + English with cultural context. Diaspora loves this.", must: true },
        { name: "Tigrinya & Somali expansion", detail: "Same data structure. New linguists. Same app.", must: false },
        { name: "B2B API & Data Licensing", detail: "Sell verified corpus to NGOs, AI companies, news organizations.", must: false },
      ],
      data: "30,000+ words across 4+ languages.",
      tech: "Fine-tuned LLaMA 3 (Amharic). Addis AI deep partnership.",
      size: "", revenue: "Diaspora plan $9.99/mo. API licensing $500–2,000/mo."
    },
  ];

  const [activePhase, setActivePhase] = useState(0);
  const p = phases[activePhase];

  return (
    <div>
      <SectionHeader icon="🗺️" title="MVP Roadmap at a Glance" subtitle="What to build, when, and why — our version vs what ChatGPT/Qwen suggested." />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {phases.map((ph, i) => (
          <div key={i} onClick={() => setActivePhase(i)} style={{
            flex: 1, background: i === activePhase ? ph.color + "20" : C.card,
            border: `1px solid ${i === activePhase ? ph.color : C.border}`, borderRadius: 12,
            padding: "10px 12px", cursor: "pointer", textAlign: "center"
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: i === activePhase ? ph.color : C.text }}>{ph.phase}</div>
            <div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>{ph.timeline}</div>
          </div>
        ))}
      </div>

      <Box style={{ padding: "16px", borderColor: p.color + "60", border: `1px solid ${p.color}60`, marginBottom: 10 }}>
        <Row gap={10} style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 17, color: p.color, flex: 1 }}>{p.phase} — {p.timeline}</div>
          {p.launch && <Pill label={`🎉 Launch: ${p.launch}`} color={C.gold} />}
        </Row>
        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginBottom: 14, background: p.color + "10", borderRadius: 10, padding: "10px 13px" }}>
          <strong style={{ color: p.color }}>Goal: </strong>{p.goal}
        </div>

        <div style={{ fontWeight: 700, fontSize: 13, color: C.mid, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Features</div>
        {p.features.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: i < p.features.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: f.must ? p.color : C.soft, flexShrink: 0, marginTop: 5 }} />
            <div>
              <Row gap={8} style={{ marginBottom: 3 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{f.name}</span>
                {f.must && <Pill label="Core" color={p.color} size="xs" />}
              </Row>
              <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.5 }}>{f.detail}</div>
            </div>
          </div>
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          {[
            { label: "📦 Data", val: p.data },
            { label: "⚙️ Tech", val: p.tech },
            p.size ? { label: "📱 App Size", val: p.size } : null,
            { label: "💰 Revenue", val: p.revenue },
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{ background: C.bg, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.mid, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{item.val}</div>
            </div>
          ))}
        </div>
      </Box>
    </div>
  );
}

// ── ROOT ────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState(VIEWS.COMPARE);

  const tabs = [
    { key: VIEWS.COMPARE, label: "⚖️ vs ChatGPT/Qwen" },
    { key: VIEWS.DECISIONS, label: "🔒 Locked Decisions" },
    { key: VIEWS.NEXTWEEKS, label: "📅 8-Week Plan" },
    { key: VIEWS.MISSING, label: "💡 What's Missing" },
    { key: VIEWS.MVP, label: "🗺️ MVP Roadmap" },
  ];

  const views = {
    [VIEWS.COMPARE]: <Compare />,
    [VIEWS.DECISIONS]: <Decisions />,
    [VIEWS.NEXTWEEKS]: <NextWeeks />,
    [VIEWS.MISSING]: <Missing />,
    [VIEWS.MVP]: <MVPView />,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.text }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #080814, #14142A)`, borderBottom: `1px solid ${C.border}`, padding: "14px 20px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 36 }}>🇪🇹</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 22, color: C.gold, letterSpacing: 1 }}>YEQAL · ያቃል</div>
            <div style={{ fontSize: 12, color: C.mid }}>Decision Center — Our conversation is the source of truth</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill label="Online-First ✓" color={C.green} />
            <Pill label="Hasab AI ✓" color={C.blue} />
            <Pill label="Sept 11 Launch ✓" color={C.gold} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex" }}>
          {tabs.map(t => (
            <div key={t.key} onClick={() => setView(t.key)} style={{
              padding: "12px 18px", fontWeight: 700, fontSize: 12,
              color: view === t.key ? C.gold : C.mid,
              borderBottom: `2px solid ${view === t.key ? C.gold : "transparent"}`,
              cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s"
            }}>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "22px 16px 50px" }}>
        {views[view]}
      </div>
    </div>
  );
}

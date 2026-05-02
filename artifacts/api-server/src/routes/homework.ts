import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

const GEMINI_BASE = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
const GEMINI_KEY = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

router.post("/api/homework/explain", async (req: Request, res: Response) => {
  const { text, childName, gradeLevel, language } = req.body as {
    text?: string;
    childName?: string;
    gradeLevel?: number;
    language?: string;
  };

  if (!text || !text.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  if (!GEMINI_BASE || !GEMINI_KEY) {
    res.status(503).json({ error: "AI not configured" });
    return;
  }

  const langLabel =
    language === "amharic"
      ? "Amharic (አማርኛ)"
      : language === "oromo"
        ? "Afaan Oromo"
        : "English";

  const grade = gradeLevel ?? 4;
  const name = childName?.trim() || "A student";

  const prompt = `You are Yeqal, a helpful Ethiopian education assistant.
Respond ONLY in ${langLabel}.
Keep the explanation simple — Grade ${grade} level.
Maximum 3 sentences. Be warm and encouraging.
Never use complex academic language.

${name} is in Grade ${grade}.
Their homework says: "${text.trim()}"
Explain in simple ${langLabel}: what is this homework asking, and what does the student need to do?`;

  try {
    const url = `${GEMINI_BASE}/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ status: response.status, err }, "Gemini API error");
      res.status(502).json({ error: "AI service unavailable" });
      return;
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!explanation) {
      res.status(502).json({ error: "Empty response from AI" });
      return;
    }

    res.json({ explanation });
  } catch (err) {
    req.log.error({ err }, "Homework explain error");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;

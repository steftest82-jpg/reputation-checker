import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// ── Rate-limit store (in-memory; resets on cold start) ──────────────
const ipHits: Record<string, { count: number; firstHit: number }> = {};
const MAX_HITS = 2;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 h

function isRateLimited(ip: string): boolean {
  if (process.env.RATE_LIMIT_ENABLED !== "true") return false;
  const now = Date.now();
  const entry = ipHits[ip];
  if (!entry || now - entry.firstHit > WINDOW_MS) {
    ipHits[ip] = { count: 1, firstHit: now };
    return false;
  }
  entry.count++;
  return entry.count > MAX_HITS;
}

// ── SerpAPI helpers ─────────────────────────────────────────────────
async function serpSearch(query: string, extras: Record<string, string> = {}) {
  const params = new URLSearchParams({
    q: query,
    api_key: process.env.SERPAPI_KEY!,
    engine: "google",
    num: "20",
    ...extras,
  });
  const res = await fetch(`https://serpapi.com/search.json?${params}`);
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);
  return res.json();
}

async function serpAutocomplete(query: string) {
  const params = new URLSearchParams({
    q: query,
    api_key: process.env.SERPAPI_KEY!,
    engine: "google_autocomplete",
  });
  const res = await fetch(`https://serpapi.com/search.json?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.suggestions || []).map((s: { value: string }) => s.value);
}

// ── Claude sentiment analysis ───────────────────────────────────────
async function analyzeSentiment(
  name: string,
  entityType: string,
  results: { title: string; snippet: string; link: string }[],
  autocomplete: string[],
  peopleAlsoAsk: string[]
) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const prompt = `You are a reputation analysis expert. Analyze the following Google search data for the ${entityType} "${name}".

SEARCH RESULTS (title | snippet | url):
${results
  .map((r, i) => `${i + 1}. ${r.title} | ${r.snippet} | ${r.link}`)
  .join("\n")}

AUTOCOMPLETE SUGGESTIONS:
${autocomplete.length ? autocomplete.join(", ") : "None found"}

PEOPLE ALSO ASK:
${peopleAlsoAsk.length ? peopleAlsoAsk.join(", ") : "None found"}

Respond ONLY with valid JSON (no markdown, no code fences) in this exact structure:
{
  "results": [
    {
      "title": "...",
      "snippet": "...",
      "link": "...",
      "sentiment": "positive" | "neutral" | "negative",
      "severity": "low" | "medium" | "high",
      "reason": "short explanation"
    }
  ],
  "autocompleteSentiment": {
    "negative_terms": ["list of concerning suggestions"],
    "score": 0-10
  },
  "overallSummary": "2-3 sentence reputation summary",
  "problems": [
    {
      "severity": "high" | "medium" | "low",
      "title": "short problem title",
      "description": "what was found and why it matters",
      "source": "url or source"
    }
  ],
  "recommendations": ["actionable recommendation strings"],
  "categoryScores": {
    "serpSentiment": 0-30,
    "autocompleteSafety": 0-10,
    "newsSentiment": 0-15,
    "socialPresence": 0-10,
    "contentControl": 0-5,
    "complaintSites": 0-10,
    "reviewRatings": 0-15,
    "domainOwnership": 0-5
  }
}

Scoring guide:
- serpSentiment (0-30): Based on ratio of positive/neutral vs negative in top results
- autocompleteSafety (0-10): 10 = no negative suggestions, deduct 2 per negative term
- newsSentiment (0-15): ratio of positive news to negative
- socialPresence (0-10): presence of official profiles on LinkedIn, Twitter, etc.
- contentControl (0-5): how many top 10 results are controlled by the entity
- complaintSites (0-10): 10 = no complaint site mentions, deduct 2 per complaint
- reviewRatings (0-15): normalized from any review data found in results
- domainOwnership (0-5): owns exact domain = 5, partial = 3, none = 0

Be fair and accurate. If there is not enough data for a category, give a middle-range score.`;

  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    msg.content[0].type === "text" ? msg.content[0].text : "";
  return JSON.parse(text);
}

// ── Main handler ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. You can run 2 checks per day." },
        { status: 429 }
      );
    }

    const { name, type } = await req.json();
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please provide a valid name (at least 2 characters)." },
        { status: 400 }
      );
    }

    const entityType = type === "company" ? "company" : "person";
    const query = name.trim();

    // Fire SERP requests in parallel (saves cost — 2 API calls total)
    const [organicData, autocomplete] = await Promise.all([
      serpSearch(query),
      serpAutocomplete(query),
    ]);

    // Extract organic results
    const organicResults = (organicData.organic_results || [])
      .slice(0, 20)
      .map((r: { title?: string; snippet?: string; link?: string }) => ({
        title: r.title || "",
        snippet: r.snippet || "",
        link: r.link || "",
      }));

    // Extract People Also Ask
    const peopleAlsoAsk = (organicData.related_questions || []).map(
      (q: { question?: string }) => q.question || ""
    );

    // Analyze with Claude
    const analysis = await analyzeSentiment(
      query,
      entityType,
      organicResults,
      autocomplete,
      peopleAlsoAsk
    );

    // Calculate total score
    const cs = analysis.categoryScores;
    const totalScore =
      (cs.serpSentiment || 0) +
      (cs.autocompleteSafety || 0) +
      (cs.newsSentiment || 0) +
      (cs.socialPresence || 0) +
      (cs.contentControl || 0) +
      (cs.complaintSites || 0) +
      (cs.reviewRatings || 0) +
      (cs.domainOwnership || 0);

    return NextResponse.json({
      name: query,
      entityType,
      score: Math.min(100, Math.max(0, totalScore)),
      summary: analysis.overallSummary,
      results: analysis.results,
      problems: analysis.problems,
      recommendations: analysis.recommendations,
      categoryScores: analysis.categoryScores,
      autocomplete,
      peopleAlsoAsk,
    });
  } catch (err) {
    console.error("Reputation check error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

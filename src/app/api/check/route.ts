import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load env vars from .env.local fallback (fixes Next.js 16 Turbopack bug) ─
function loadEnvFallback() {
  if (process.env.ANTHROPIC_API_KEY) return; // already loaded
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  } catch {
    // .env.local doesn't exist (e.g. on Vercel) — env vars come from dashboard
  }
}
loadEnvFallback();

// ── Rate-limit store (in-memory; resets on cold start) ──────────────
const ipHits: Record<string, { count: number; firstHit: number }> = {};
const MAX_HITS = 2;
const WINDOW_MS = 24 * 60 * 60 * 1000;

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

// ── Domain check (free, no API needed) ──────────────────────────────
async function checkDomain(name: string): Promise<{
  domain: string;
  available: boolean;
  hasSite: boolean;
}> {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
  const domain = `${slug}.com`;
  try {
    const res = await fetch(`https://${domain}`, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
      redirect: "follow",
    });
    return { domain, available: false, hasSite: res.ok };
  } catch {
    return { domain, available: true, hasSite: false };
  }
}

// ── Complaint / review site classifier ──────────────────────────────
const COMPLAINT_DOMAINS = [
  "ripoffreport.com",
  "complaintsboard.com",
  "bbb.org",
  "consumeraffairs.com",
  "pissedconsumer.com",
  "scamadviser.com",
  "sitejabber.com",
  "trustpilot.com",
];

const REVIEW_DOMAINS = [
  "trustpilot.com",
  "glassdoor.com",
  "g2.com",
  "capterra.com",
  "yelp.com",
  "tripadvisor.com",
  "bbb.org",
  "sitejabber.com",
  "consumeraffairs.com",
  "google.com/maps",
];

const SOCIAL_DOMAINS = [
  "linkedin.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "instagram.com",
  "youtube.com",
  "tiktok.com",
  "github.com",
  "medium.com",
  "crunchbase.com",
];

const NEWS_DOMAINS = [
  "reuters.com",
  "bbc.com",
  "bbc.co.uk",
  "cnn.com",
  "nytimes.com",
  "theguardian.com",
  "bloomberg.com",
  "forbes.com",
  "techcrunch.com",
  "wsj.com",
  "cnbc.com",
  "washingtonpost.com",
  "apnews.com",
  "news.google.com",
];

interface SerpResult {
  title?: string;
  snippet?: string;
  link?: string;
  date?: string;
  position?: number;
  displayed_link?: string;
}

function classifyUrl(url: string) {
  const lower = url.toLowerCase();
  return {
    isComplaint: COMPLAINT_DOMAINS.some((d) => lower.includes(d)),
    isReview: REVIEW_DOMAINS.some((d) => lower.includes(d)),
    isSocial: SOCIAL_DOMAINS.some((d) => lower.includes(d)),
    isNews: NEWS_DOMAINS.some((d) => lower.includes(d)),
  };
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

// ── Build rich context for Claude ───────────────────────────────────
function buildDataPacket(
  name: string,
  entityType: string,
  organic: SerpResult[],
  newsResults: SerpResult[],
  autocomplete: string[],
  peopleAlsoAsk: string[],
  domainInfo: { domain: string; available: boolean; hasSite: boolean },
  knowledgeGraph: Record<string, unknown> | null
) {
  const classified = organic.map((r, i) => {
    const url = r.link || "";
    const cls = classifyUrl(url);
    return {
      position: i + 1,
      title: r.title || "",
      snippet: r.snippet || "",
      link: url,
      domain: extractDomain(url),
      date: r.date || null,
      isComplaint: cls.isComplaint,
      isReview: cls.isReview,
      isSocial: cls.isSocial,
      isNews: cls.isNews,
    };
  });

  const complaintResults = classified.filter((r) => r.isComplaint);
  const reviewResults = classified.filter((r) => r.isReview);
  const socialResults = classified.filter((r) => r.isSocial);
  const newsInOrganic = classified.filter((r) => r.isNews);

  // Count unique domains in top 10
  const top10Domains = classified.slice(0, 10).map((r) => r.domain);
  const uniqueTop10 = new Set(top10Domains);

  return {
    classified,
    complaintResults,
    reviewResults,
    socialResults,
    newsInOrganic,
    newsResults: newsResults.map((r, i) => ({
      position: i + 1,
      title: r.title || "",
      snippet: r.snippet || "",
      link: r.link || "",
      date: r.date || null,
    })),
    autocomplete,
    peopleAlsoAsk,
    domainInfo,
    knowledgeGraph,
    stats: {
      totalResults: classified.length,
      complaintCount: complaintResults.length,
      reviewCount: reviewResults.length,
      socialCount: socialResults.length,
      newsCount: newsInOrganic.length + newsResults.length,
      uniqueDomainsInTop10: uniqueTop10.size,
    },
    entityType,
    name,
  };
}

// ── Claude deep analysis ────────────────────────────────────────────
async function analyzeReputation(
  dataPacket: ReturnType<typeof buildDataPacket>
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  const client = new Anthropic({ apiKey });

  const prompt = `You are an expert Online Reputation Management (ORM) analyst. You are analyzing the full online footprint of the ${dataPacket.entityType} "${dataPacket.name}".

Below is structured data gathered from Google Search, Google News, Google Autocomplete, and domain checks.

=== ORGANIC SEARCH RESULTS (top 20) ===
${dataPacket.classified
  .map(
    (r) =>
      `#${r.position} [${r.domain}] ${r.title}
  Snippet: ${r.snippet}
  URL: ${r.link}
  Flags: ${[
    r.isComplaint && "COMPLAINT_SITE",
    r.isReview && "REVIEW_SITE",
    r.isSocial && "SOCIAL_PROFILE",
    r.isNews && "NEWS_SOURCE",
  ]
    .filter(Boolean)
    .join(", ") || "none"}
  ${r.date ? `Date: ${r.date}` : ""}`
  )
  .join("\n\n")}

=== GOOGLE NEWS RESULTS ===
${
  dataPacket.newsResults.length
    ? dataPacket.newsResults
        .map(
          (r) =>
            `#${r.position} ${r.title}
  Snippet: ${r.snippet}
  URL: ${r.link}
  ${r.date ? `Date: ${r.date}` : ""}`
        )
        .join("\n\n")
    : "No recent news found."
}

=== AUTOCOMPLETE SUGGESTIONS ===
${dataPacket.autocomplete.length ? dataPacket.autocomplete.join("\n") : "None found."}

=== PEOPLE ALSO ASK ===
${dataPacket.peopleAlsoAsk.length ? dataPacket.peopleAlsoAsk.join("\n") : "None found."}

=== DOMAIN CHECK ===
Domain: ${dataPacket.domainInfo.domain}
Has active website: ${dataPacket.domainInfo.hasSite ? "Yes" : "No"}

=== KNOWLEDGE GRAPH ===
${dataPacket.knowledgeGraph ? JSON.stringify(dataPacket.knowledgeGraph, null, 2) : "Not available"}

=== DATA SUMMARY ===
- Total organic results analyzed: ${dataPacket.stats.totalResults}
- Results on complaint sites: ${dataPacket.stats.complaintCount}
- Results on review sites: ${dataPacket.stats.reviewCount}
- Social media profiles found: ${dataPacket.stats.socialCount}
- News mentions: ${dataPacket.stats.newsCount}
- Unique domains in top 10: ${dataPacket.stats.uniqueDomainsInTop10}

=== YOUR TASK ===
Perform a comprehensive reputation analysis. Respond ONLY with valid JSON (no markdown fences, no commentary outside JSON).

{
  "results": [
    {
      "title": "exact title from data",
      "snippet": "exact snippet",
      "link": "exact url",
      "sentiment": "positive" | "neutral" | "negative",
      "category": "organic" | "news" | "review" | "social" | "complaint" | "legal",
      "severity": "low" | "medium" | "high",
      "reason": "1-sentence explanation of why this matters for reputation",
      "position": number
    }
  ],
  "autocompleteSentiment": {
    "negative_terms": ["list of concerning autocomplete suggestions"],
    "neutral_terms": ["non-concerning suggestions"],
    "score": 0-10,
    "analysis": "1-2 sentences on what autocomplete reveals"
  },
  "overallSummary": "3-4 sentence comprehensive reputation summary. Be specific about what was found, not generic.",
  "sentimentBreakdown": {
    "positive": number_of_positive_results,
    "neutral": number_of_neutral_results,
    "negative": number_of_negative_results
  },
  "problems": [
    {
      "severity": "high" | "medium" | "low",
      "title": "clear problem title",
      "description": "detailed explanation: what was found, where, and what impact it has on reputation. Include the SERP position if relevant.",
      "source": "url where the problem was found",
      "category": "complaint" | "negative_press" | "negative_review" | "negative_autocomplete" | "missing_presence" | "negative_content" | "legal" | "competitor_dominated"
    }
  ],
  "strengths": [
    {
      "title": "strength title",
      "description": "what's working well for their reputation",
      "source": "url if applicable"
    }
  ],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "action": "specific, actionable recommendation",
      "reason": "why this matters",
      "estimatedImpact": "what improvement to expect"
    }
  ],
  "categoryScores": {
    "serpSentiment": 0-30,
    "autocompleteSafety": 0-10,
    "newsSentiment": 0-15,
    "socialPresence": 0-10,
    "contentControl": 0-5,
    "complaintSites": 0-10,
    "reviewRatings": 0-15,
    "domainOwnership": 0-5
  },
  "serpBreakdown": {
    "ownedProperties": ["list of URLs in top 10 that belong to or are controlled by the entity"],
    "riskyResults": ["list of URLs that pose reputation risk"],
    "firstPageDominance": "low" | "medium" | "high"
  },
  "socialPresenceDetail": {
    "found": ["platform names where profiles were detected"],
    "missing": ["important platforms where no profile was found"],
    "assessment": "1-2 sentences"
  },
  "reviewSummary": {
    "platforms_found": ["names of review platforms in results"],
    "overall_sentiment": "positive" | "mixed" | "negative" | "no_data",
    "assessment": "1-2 sentences"
  },
  "riskLevel": "low" | "moderate" | "high" | "critical",
  "executiveBrief": "1 paragraph (4-6 sentences) that a CEO or brand manager could read to understand the full picture. Include the most important finding, the biggest risk, and the #1 action to take."
}

SCORING GUIDE (be precise):
- serpSentiment (0-30): Count positive/neutral vs negative. 30 = all positive/neutral. Deduct 3 per negative result in top 10, 1.5 per negative in 11-20.
- autocompleteSafety (0-10): 10 = clean. Deduct 2.5 per negative/harmful suggestion (scam, fraud, lawsuit, complaint, etc.)
- newsSentiment (0-15): 15 = all positive/neutral news. 7 = mixed. 0 = all negative. No news = 8 (neutral default).
- socialPresence (0-10): 2 points per active major platform found (LinkedIn, Twitter/X, Facebook, Instagram, YouTube). Max 10.
- contentControl (0-5): How many of top 10 results are owned/controlled by entity. 5 = 5+ owned, 3 = 3-4, 1 = 1-2, 0 = none.
- complaintSites (0-10): 10 = zero complaint results. Deduct 3 per complaint site appearance.
- reviewRatings (0-15): Based on review site presence and sentiment. 15 = strong positive reviews. 7 = mixed/unknown. 0 = terrible reviews.
- domainOwnership (0-5): 5 = owns exact-match domain with active site. 3 = domain exists but no site. 0 = doesn't own it.

Be brutally honest. Do not inflate scores. A mediocre online presence should score 45-60, not 75.`;

  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 6000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";
  // Strip markdown fences if Claude adds them despite instructions
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
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

    // Fire ALL data-gathering requests in parallel (4 API calls total)
    const [organicData, newsData, autocomplete, domainInfo] = await Promise.all(
      [
        serpSearch(query),
        serpSearch(`${query}`, { tbm: "nws", num: "10" }),
        serpAutocomplete(query),
        checkDomain(query),
      ]
    );

    // Extract organic results
    const organicResults: SerpResult[] = (organicData.organic_results || [])
      .slice(0, 20)
      .map((r: SerpResult, i: number) => ({
        title: r.title || "",
        snippet: r.snippet || "",
        link: r.link || "",
        date: r.date || "",
        position: i + 1,
      }));

    // Extract news results
    const newsResults: SerpResult[] = (newsData.news_results || [])
      .slice(0, 10)
      .map((r: SerpResult, i: number) => ({
        title: r.title || "",
        snippet: r.snippet || "",
        link: r.link || "",
        date: r.date || "",
        position: i + 1,
      }));

    // Extract People Also Ask
    const peopleAlsoAsk: string[] = (
      organicData.related_questions || []
    ).map((q: { question?: string }) => q.question || "");

    // Extract Knowledge Graph if present
    const knowledgeGraph = organicData.knowledge_graph || null;

    // Build structured data packet
    const dataPacket = buildDataPacket(
      query,
      entityType,
      organicResults,
      newsResults,
      autocomplete,
      peopleAlsoAsk,
      domainInfo,
      knowledgeGraph
    );

    // Analyze with Claude
    const analysis = await analyzeReputation(dataPacket);

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
      executiveBrief: analysis.executiveBrief,
      riskLevel: analysis.riskLevel,
      sentimentBreakdown: analysis.sentimentBreakdown,
      results: analysis.results,
      problems: analysis.problems,
      strengths: analysis.strengths || [],
      recommendations: analysis.recommendations,
      categoryScores: analysis.categoryScores,
      serpBreakdown: analysis.serpBreakdown,
      socialPresenceDetail: analysis.socialPresenceDetail,
      reviewSummary: analysis.reviewSummary,
      autocompleteSentiment: analysis.autocompleteSentiment,
      autocomplete,
      peopleAlsoAsk,
      domainInfo,
      knowledgeGraph: knowledgeGraph
        ? {
            title: knowledgeGraph.title,
            type: knowledgeGraph.type,
            description: knowledgeGraph.description,
          }
        : null,
      dataStats: dataPacket.stats,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";
    console.error("Reputation check error:", message, stack);
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 }
    );
  }
}

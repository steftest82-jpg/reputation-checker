import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import Stripe from "stripe";

// ── API Keys (loaded exclusively from environment variables) ─
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const SERP_KEY = process.env.SERPAPI_KEY || "";
const NEWSAPI_KEY = process.env.NEWSAPI_KEY || "";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";

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
    api_key: SERP_KEY,
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
    api_key: SERP_KEY,
    engine: "google_autocomplete",
  });
  const res = await fetch(`https://serpapi.com/search.json?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.suggestions || []).map((s: { value: string }) => s.value);
}

// ── YouTube video search ────────────────────────────────────────────
async function serpYouTube(query: string) {
  const params = new URLSearchParams({
    q: query,
    api_key: SERP_KEY,
    engine: "youtube",
    search_query: query,
  });
  const res = await fetch(`https://serpapi.com/search.json?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.video_results || []).slice(0, 8).map((r: { title?: string; link?: string; channel?: { name?: string }; description?: string; views?: number; published_date?: string; length?: string }, i: number) => ({
    position: i + 1,
    title: r.title || "",
    link: r.link || "",
    channel: r.channel?.name || "",
    description: r.description || "",
    views: r.views || 0,
    publishedDate: r.published_date || "",
    length: r.length || "",
  }));
}

// ── Reddit/Quora search ─────────────────────────────────────────────
async function serpRedditQuora(query: string) {
  const params = new URLSearchParams({
    q: `${query} site:reddit.com OR site:quora.com`,
    api_key: SERP_KEY,
    engine: "google",
    num: "10",
  });
  const res = await fetch(`https://serpapi.com/search.json?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.organic_results || []).slice(0, 10).map((r: SerpResult, i: number) => ({
    title: r.title || "",
    snippet: r.snippet || "",
    link: r.link || "",
    position: i + 1,
    platform: (r.link || "").includes("reddit.com") ? "reddit" : "quora",
  }));
}

// ── Google Images search ────────────────────────────────────────────
async function serpImages(query: string) {
  const params = new URLSearchParams({
    q: query,
    api_key: SERP_KEY,
    engine: "google_images",
    num: "10",
  });
  const res = await fetch(`https://serpapi.com/search.json?${params}`);
  if (!res.ok) return { results: [], totalEstimate: 0 };
  const data = await res.json();
  const results = (data.images_results || []).slice(0, 10).map((r: { title?: string; link?: string; original?: string; source?: string; position?: number }, i: number) => ({
    title: r.title || "",
    link: r.link || "",
    original: r.original || "",
    source: r.source || "",
    position: i + 1,
  }));
  return { results, totalEstimate: data.search_information?.total_results || 0 };
}

// ── NewsAPI - Broad news coverage (500K+ sources) ──────────────────
interface NewsApiArticle {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  publishedAt: string;
  author: string | null;
}

async function fetchNewsAPI(query: string): Promise<{
  articles: { title: string; description: string; url: string; source: string; publishedAt: string; author: string }[];
  totalResults: number;
}> {
  try {
    // Search last 30 days of news
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const params = new URLSearchParams({
      q: `"${query}"`,
      apiKey: NEWSAPI_KEY,
      language: "en",
      sortBy: "relevancy",
      pageSize: "20",
      from: fromDate,
    });
    const res = await fetch(`https://newsapi.org/v2/everything?${params}`, {
      headers: { "User-Agent": "Reputation500/2.0" },
    });
    if (!res.ok) {
      console.error("NewsAPI error:", res.status);
      return { articles: [], totalResults: 0 };
    }
    const data = await res.json();
    const articles = ((data.articles || []) as NewsApiArticle[]).slice(0, 20).map((a) => ({
      title: a.title || "",
      description: a.description || "",
      url: a.url || "",
      source: a.source?.name || "",
      publishedAt: a.publishedAt || "",
      author: a.author || "",
    }));
    return { articles, totalResults: data.totalResults || 0 };
  } catch (err) {
    console.error("NewsAPI fetch error:", err);
    return { articles: [], totalResults: 0 };
  }
}

// ── YouTube Data API v3 - Real video stats ─────────────────────────
interface YTVideoStats {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnailUrl: string;
  link: string;
}

async function fetchYouTubeData(query: string): Promise<YTVideoStats[]> {
  try {
    // Step 1: Search for videos
    const searchParams = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: "10",
      order: "relevance",
      key: YOUTUBE_API_KEY,
    });
    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams}`);
    if (!searchRes.ok) {
      console.error("YouTube Search API error:", searchRes.status);
      return [];
    }
    const searchData = await searchRes.json();
    const items = searchData.items || [];
    if (items.length === 0) return [];

    // Step 2: Get detailed stats for each video
    const videoIds = items.map((item: { id?: { videoId?: string } }) => item.id?.videoId).filter(Boolean).join(",");
    if (!videoIds) return [];

    const statsParams = new URLSearchParams({
      part: "statistics,snippet",
      id: videoIds,
      key: YOUTUBE_API_KEY,
    });
    const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${statsParams}`);
    if (!statsRes.ok) {
      console.error("YouTube Stats API error:", statsRes.status);
      return [];
    }
    const statsData = await statsRes.json();

    return ((statsData.items || []) as {
      id: string;
      snippet: { title: string; channelTitle: string; description: string; publishedAt: string; thumbnails?: { medium?: { url: string } } };
      statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
    }[]).map((v) => ({
      videoId: v.id,
      title: v.snippet.title || "",
      channelTitle: v.snippet.channelTitle || "",
      description: (v.snippet.description || "").slice(0, 300),
      publishedAt: v.snippet.publishedAt || "",
      viewCount: parseInt(v.statistics.viewCount || "0", 10),
      likeCount: parseInt(v.statistics.likeCount || "0", 10),
      commentCount: parseInt(v.statistics.commentCount || "0", 10),
      thumbnailUrl: v.snippet.thumbnails?.medium?.url || "",
      link: `https://www.youtube.com/watch?v=${v.id}`,
    }));
  } catch (err) {
    console.error("YouTube API fetch error:", err);
    return [];
  }
}

// ── YouTube Transcript Fetcher ───────────────────────────────────────
async function fetchYouTubeTranscripts(videos: YTVideoStats[]): Promise<{ videoId: string; transcript: string }[]> {
  const results: { videoId: string; transcript: string }[] = [];
  try {
    const { YoutubeTranscript } = await import("youtube-transcript");
    for (const video of videos.slice(0, 5)) {
      try {
        const items = await YoutubeTranscript.fetchTranscript(video.videoId);
        const fullText = items.map((item: { text: string }) => item.text).join(" ");
        results.push({ videoId: video.videoId, transcript: fullText.slice(0, 2000) });
      } catch {
        results.push({ videoId: video.videoId, transcript: "" });
      }
    }
  } catch {
    console.error("youtube-transcript module not available");
  }
  return results;
}

// ── Social media profile search ─────────────────────────────────────
async function serpSocialProfiles(query: string) {
  // Run targeted searches for major social platforms in parallel
  const platforms = [
    { name: "LinkedIn", searchQuery: `${query} site:linkedin.com`, domain: "linkedin.com" },
    { name: "Twitter/X", searchQuery: `${query} site:twitter.com OR site:x.com`, domain: "twitter.com" },
    { name: "Facebook", searchQuery: `${query} site:facebook.com`, domain: "facebook.com" },
    { name: "Instagram", searchQuery: `${query} site:instagram.com`, domain: "instagram.com" },
    { name: "YouTube", searchQuery: `${query} site:youtube.com`, domain: "youtube.com" },
    { name: "TikTok", searchQuery: `${query} site:tiktok.com`, domain: "tiktok.com" },
  ];

  const results: { platform: string; url: string; title: string; found: boolean }[] = [];

  // Single SerpAPI call with site: operators combined
  try {
    const combinedQuery = `"${query}" (site:linkedin.com OR site:twitter.com OR site:x.com OR site:facebook.com OR site:instagram.com OR site:youtube.com OR site:tiktok.com)`;
    const params = new URLSearchParams({
      q: combinedQuery,
      api_key: SERP_KEY,
      engine: "google",
      num: "15",
    });
    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    if (res.ok) {
      const data = await res.json();
      const organic = (data.organic_results || []) as { title?: string; link?: string }[];
      for (const r of organic) {
        const link = (r.link || "").toLowerCase();
        for (const p of platforms) {
          if (link.includes(p.domain) || (p.name === "Twitter/X" && link.includes("x.com"))) {
            // Avoid duplicates for same platform
            if (!results.some((existing) => existing.platform === p.name)) {
              results.push({ platform: p.name, url: r.link || "", title: r.title || "", found: true });
            }
          }
        }
      }
    }
  } catch {
    // Fallback: social profiles will rely on organic SERP results
  }

  // Mark platforms not found
  for (const p of platforms) {
    if (!results.some((r) => r.platform === p.name)) {
      results.push({ platform: p.name, url: "", title: "", found: false });
    }
  }

  return results;
}

// ── Domain check (free, no API needed) ──────────────────────────────
async function checkDomain(name: string, userDomain?: string): Promise<{
  domain: string;
  available: boolean;
  hasSite: boolean;
}> {
  // If user provided a domain, use it directly
  let domain: string;
  if (userDomain) {
    domain = userDomain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim();
  } else {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .trim();
    domain = `${slug}.com`;
  }

  // Try HEAD first, then GET as fallback. Accept any HTTP response (even 403/301)
  // as evidence the site exists — only DNS/connection failures mean "no site".
  async function probe(url: string): Promise<boolean> {
    try {
      await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Reputation500Bot/1.0)" },
      });
      return true;
    } catch {
      try {
        await fetch(url, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
          redirect: "follow",
          headers: { "User-Agent": "Mozilla/5.0 (compatible; Reputation500Bot/1.0)" },
        });
        return true;
      } catch {
        return false;
      }
    }
  }

  // Try https first, then http
  const hasHttps = await probe(`https://${domain}`);
  if (hasHttps) return { domain, available: false, hasSite: true };

  const hasHttp = await probe(`http://${domain}`);
  if (hasHttp) return { domain, available: false, hasSite: true };

  return { domain, available: true, hasSite: false };
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
interface ForumResult {
  title: string;
  snippet: string;
  link: string;
  position: number;
  platform: string;
}

interface ImageResult {
  title: string;
  link: string;
  original: string;
  source: string;
  position: number;
}

function buildDataPacket(
  name: string,
  entityType: string,
  organic: SerpResult[],
  newsResults: SerpResult[],
  autocomplete: string[],
  peopleAlsoAsk: string[],
  domainInfo: { domain: string; available: boolean; hasSite: boolean },
  knowledgeGraph: Record<string, unknown> | null,
  forumResults: ForumResult[] = [],
  imageData: { results: ImageResult[]; totalEstimate: number } = { results: [], totalEstimate: 0 },
  youtubeResults: { position: number; title: string; link: string; channel: string; description: string; views: number; publishedDate: string; length: string }[] = [],
  socialProfiles: { platform: string; url: string; title: string; found: boolean }[] = [],
  newsApiArticles: { title: string; description: string; url: string; source: string; publishedAt: string; author: string }[] = [],
  newsApiTotalResults: number = 0,
  youtubeApiVideos: YTVideoStats[] = [],
  youtubeTranscripts: { videoId: string; transcript: string }[] = []
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
    forumResults,
    imageData,
    youtubeResults,
    socialProfiles,
    newsApiArticles,
    newsApiTotalResults,
    youtubeApiVideos,
    youtubeTranscripts,
    stats: {
      totalResults: classified.length,
      complaintCount: complaintResults.length,
      reviewCount: reviewResults.length,
      socialCount: socialResults.length + socialProfiles.filter((p) => p.found).length,
      newsCount: newsInOrganic.length + newsResults.length + newsApiArticles.length,
      uniqueDomainsInTop10: uniqueTop10.size,
      forumCount: forumResults.length,
      imageCount: imageData.results.length,
      youtubeCount: youtubeResults.length + youtubeApiVideos.length,
      newsApiCount: newsApiArticles.length,
      newsApiTotal: newsApiTotalResults,
      youtubeApiCount: youtubeApiVideos.length,
    },
    entityType,
    name,
  };
}

// ── Claude deep analysis ────────────────────────────────────────────
async function analyzeReputation(
  dataPacket: ReturnType<typeof buildDataPacket>
) {
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

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

=== NEWS — ENRICHED (NewsAPI — ${dataPacket.newsApiTotalResults.toLocaleString()} total results from 500K+ sources, last 30 days) ===
${dataPacket.newsApiArticles.length
  ? dataPacket.newsApiArticles
      .map(
        (a: { title: string; description: string; url: string; source: string; publishedAt: string; author: string }, i: number) =>
          `#${i + 1} "${a.title}"
  Source: ${a.source}${a.author ? ` | Author: ${a.author}` : ""}
  Published: ${a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
  URL: ${a.url}
  Summary: ${a.description || "N/A"}`
      )
      .join("\n\n")
  : "No additional news from NewsAPI."
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

=== SOCIAL MEDIA PROFILES (Dedicated Search) ===
${dataPacket.socialProfiles
  .map((p: { platform: string; url: string; title: string; found: boolean }) =>
    `${p.platform}: ${p.found ? `FOUND — ${p.url} (${p.title})` : "NOT FOUND"}`
  )
  .join("\n")}

=== REDDIT & QUORA FORUM DISCUSSIONS ===
${dataPacket.forumResults.length
  ? dataPacket.forumResults
      .map(
        (r: ForumResult) =>
          `[${r.platform.toUpperCase()}] ${r.title}
  Snippet: ${r.snippet}
  URL: ${r.link}`
      )
      .join("\n\n")
  : "No Reddit or Quora discussions found."}

=== GOOGLE IMAGES ===
Total estimated image results: ${dataPacket.imageData.totalEstimate}
${dataPacket.imageData.results.length
  ? dataPacket.imageData.results
      .map(
        (r: ImageResult) =>
          `#${r.position} ${r.title} [Source: ${r.source}]`
      )
      .join("\n")
  : "No image results found."}

=== YOUTUBE VIDEOS (SerpAPI) ===
${dataPacket.youtubeResults.length
  ? dataPacket.youtubeResults
      .map(
        (r: { position: number; title: string; channel: string; views: number; publishedDate: string; link: string }) =>
          `#${r.position} "${r.title}" by ${r.channel} (${r.views} views, ${r.publishedDate})
  URL: ${r.link}`
      )
      .join("\n\n")
  : "No YouTube videos found."}

=== YOUTUBE VIDEOS — ENRICHED (YouTube Data API v3 — Real Stats) ===
${dataPacket.youtubeApiVideos.length
  ? dataPacket.youtubeApiVideos
      .map(
        (v: YTVideoStats, i: number) =>
          `#${i + 1} "${v.title}" by ${v.channelTitle}
  Views: ${v.viewCount.toLocaleString()} | Likes: ${v.likeCount.toLocaleString()} | Comments: ${v.commentCount.toLocaleString()}
  Published: ${v.publishedAt ? new Date(v.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
  URL: ${v.link}
  Description: ${v.description}`
      )
      .join("\n\n")
  : "No YouTube Data API results."}

=== YOUTUBE VIDEO TRANSCRIPTS (Auto-Captions) ===
${dataPacket.youtubeTranscripts.filter((t: { transcript: string }) => t.transcript).length
  ? dataPacket.youtubeTranscripts
      .filter((t: { transcript: string }) => t.transcript)
      .map((t: { videoId: string; transcript: string }) => {
        const video = dataPacket.youtubeApiVideos.find((v: YTVideoStats) => v.videoId === t.videoId);
        return `"${video?.title || "Unknown"}" (ID: ${t.videoId})
  Transcript (first 2000 chars): ${t.transcript}`;
      })
      .join("\n\n")
  : "No transcripts available (captions disabled or not found)."}

=== DATA SUMMARY ===
- Total organic results analyzed: ${dataPacket.stats.totalResults}
- Results on complaint sites: ${dataPacket.stats.complaintCount}
- Results on review sites: ${dataPacket.stats.reviewCount}
- Social media profiles found: ${dataPacket.stats.socialCount}
- News mentions (SERP): ${dataPacket.stats.newsCount - dataPacket.newsApiArticles.length}
- News articles (NewsAPI — 500K+ sources): ${dataPacket.newsApiArticles.length} (${dataPacket.newsApiTotalResults.toLocaleString()} total available)
- Unique domains in top 10: ${dataPacket.stats.uniqueDomainsInTop10}
- Forum discussions (Reddit/Quora): ${dataPacket.stats.forumCount}
- Google Images results: ${dataPacket.stats.imageCount}
- YouTube videos (SerpAPI): ${dataPacket.stats.youtubeCount}
- YouTube videos (Data API v3 with real stats): ${dataPacket.youtubeApiVideos.length}
- YouTube transcripts analyzed: ${dataPacket.youtubeTranscripts.filter((t: { transcript: string }) => t.transcript).length}

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
      "estimatedImpact": "what improvement to expect",
      "revenueImpact": "estimated revenue recovery if this action is taken, e.g. '+3-5% revenue recovery' or '+8-12% revenue protection'. Be specific and tie to the revenue impact analysis. Sort recommendations by revenue impact potential (highest first)."
    }
  ],
  "categoryScores": {
    "serpSentiment": 0-25,
    "autocompleteSafety": 0-10,
    "newsSentiment": 0-15,
    "socialPresence": 0-10,
    "contentControl": 0-5,
    "complaintSites": 0-10,
    "reviewRatings": 0-10,
    "domainOwnership": 0-5,
    "aiLlmPresence": 0-10
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
  "executiveBrief": "1 paragraph (4-6 sentences) that a CEO or brand manager could read to understand the full picture. Include the most important finding, the biggest risk, and the #1 action to take. If the entity lacks media coverage, explicitly warn that this creates vulnerability for competitor attacks and crisis situations.",
  "forumSentiment": {
    "conversations": [
      {
        "platform": "reddit" | "quora",
        "title": "thread title",
        "sentiment": "positive" | "neutral" | "negative",
        "summary": "1-sentence summary of what's being discussed",
        "link": "url",
        "isRisk": true/false
      }
    ],
    "overallSentiment": "positive" | "neutral" | "negative" | "mixed" | "no_data",
    "analysis": "1-2 sentences about forum reputation"
  },
  "googleImagesAnalysis": {
    "ranking": "strong" | "moderate" | "weak" | "absent",
    "ownedImagesPct": 0-100,
    "sentimentBreakdown": {
      "positive": 0-100,
      "neutral": 0-100,
      "negative": 0-100
    },
    "analysis": "2-3 sentences about image search presence. Analyze whether images convey positive (professional photos, logos, awards), neutral (generic, stock), or negative (memes, complaints, bad press screenshots) sentiment. Include the percentage breakdown.",
    "concerns": ["any negative or concerning images found"]
  },
  "topSerpLinks": [
    {
      "position": number,
      "title": "title",
      "link": "url",
      "sentiment": "positive" | "neutral" | "negative",
      "isOwned": true/false
    }
  ],
  "aiLlmAppearance": {
    "score": 1-10,
    "verdict": "strong" | "moderate" | "weak" | "absent",
    "analysis": "2-3 sentences on how likely AI engines (ChatGPT, Claude, Gemini, Perplexity) are to reference or quote this entity. Base this on: media coverage depth, Wikipedia presence, authority website mentions, news frequency, and structured data availability.",
    "strengths": ["what helps AI engines find and reference them"],
    "weaknesses": ["what's missing that prevents AI from referencing them"],
    "recommendations": ["specific actions to improve AI visibility"]
  },
  "mediaPresenceWarning": {
    "hasAdequateMedia": true/false,
    "mediaCount": number_of_media_features_found,
    "warning": "If media coverage is low, write a clear warning that non-media publicity creates an open space for competitors to step in and attack. Explain this as a vulnerability. If media coverage is adequate, leave empty string."
  },
  "sentimentTimeline": {
    "trend": "improving" | "stable" | "declining" | "insufficient_data",
    "trendAnalysis": "2-3 sentences describing how the reputation has changed over the past 6 months based on dates found in search results and news.",
    "recentNegatives": [
      {
        "title": "title of negative item",
        "source": "url",
        "dateFound": "date string when it appeared (approximate)",
        "daysAgo": number,
        "isPotentialCrisis": true/false,
        "summary": "1-sentence summary"
      }
    ],
    "monthlyTrend": [
      { "month": "Month YYYY", "sentiment": "positive" | "neutral" | "negative" | "mixed" }
    ]
  },
  "suspiciousActivityAnalysis": {
    "score": 1-10,
    "riskLevel": "low" | "moderate" | "high" | "critical",
    "patterns": [
      {
        "type": "review_flooding" | "content_flooding" | "web2_flooding" | "link_manipulation" | "other",
        "description": "what suspicious pattern was detected",
        "severity": "low" | "medium" | "high",
        "evidence": "specific evidence found (e.g., 15 reviews posted in same week)"
      }
    ],
    "analysis": "2-3 sentences about suspicious activity. Look for: multiple reviews posted on same date, burst of media features in single month, many Web 2.0 profiles created simultaneously, unnatural backlink patterns. Score 1 = completely clean, 10 = highly suspicious. The higher the score the more risky.",
    "recommendation": "If suspicious patterns found, advise proceeding with caution - surgical approach rather than flooding. Google considers rushed patterns as SERP manipulation."
  },
  "industryBenchmark": {
    "applicable": true/false,
    "industry": "industry name if detectable",
    "marketLeaderScore": 85-95,
    "industryAverage": 55-70,
    "entityScore": the_score_you_calculated,
    "gap": number,
    "analysis": "2-3 sentences comparing this entity's reputation score to industry leaders and average. Only fill if entityType is 'company'.",
    "recommendations": ["specific actions to reach market leader level"]
  },
  "videoSentimentAnalysis": {
    "hasVideos": true/false,
    "overallSentiment": "positive" | "neutral" | "negative" | "mixed" | "no_data",
    "videos": [
      {
        "title": "video title",
        "channel": "channel name",
        "sentiment": "positive" | "neutral" | "negative",
        "summary": "1-sentence analysis of the video's tone and content regarding the entity",
        "link": "url",
        "isOwned": true/false,
        "views": number,
        "saves": "estimated saves/bookmarks or 'N/A'",
        "shares": "estimated shares or 'N/A'",
        "commentSentiment": "positive" | "neutral" | "negative" | "mixed" | "disabled",
        "commentHighlights": ["1-2 notable comment themes if visible"]
      }
    ],
    "analysis": "2-3 sentences about video/voice presence on YouTube. If transcripts are available, analyze the actual spoken content for sentiment, key themes, and any concerning statements about the entity. Consider whether the entity controls their own YouTube narrative or if third parties dominate. Include observations about engagement (saves, shares, comments).",
    "concerns": ["any negative or concerning videos found"]
  },
  "geographicPresence": {
    "scope": "local" | "national" | "regional" | "global",
    "primaryMarket": "country name",
    "markets": [
      { "country": "country name", "strength": "strong" | "moderate" | "weak", "score": 1-10, "evidence": "what was found" }
    ],
    "analysis": "2-3 sentences about geographic reputation reach. IMPORTANT: Rank UP TO 7 countries when feasible and the brand has international presence. Score each country based on the actual digital footprint found — search visibility, local media mentions, local reviews, social presence in that market. For global or regional brands, always try to identify at least 5-7 markets."
  },
  "futureRiskAssessment": {
    "overallRisk": "low" | "moderate" | "high" | "critical",
    "riskScore": 1-10,
    "risks": [
      {
        "risk": "description of the future risk",
        "likelihood": "low" | "medium" | "high",
        "impact": "low" | "medium" | "high",
        "mitigation": "what can be done to prevent this"
      }
    ],
    "analysis": "2-3 sentences about future reputation vulnerability. Consider: content control gaps (if they don't own enough results, a competitor can attack), media presence gaps, crisis preparedness, and one-mistake resilience."
  },
  "influencerMentions": {
    "mentions": [
      {
        "influencerName": "name of influencer or account",
        "platform": "youtube" | "instagram" | "tiktok" | "twitter" | "linkedin" | "reddit" | "blog",
        "sentiment": "positive" | "neutral" | "negative",
        "isSponsored": true/false,
        "summary": "1-sentence summary of the mention",
        "link": "url if available",
        "daysAgo": number,
        "dateFound": "date string"
      }
    ],
    "analysis": "2-3 sentences about influencer activity and brand mentions by third parties in the past 3 months. If #sponsored or #ad tags are found, note it.",
    "platformsChecked": ["YouTube", "Instagram", "TikTok", "Twitter/X", "LinkedIn", "Reddit", "Blogs"]
  },
  "personalInfluence": {
    "score": 1-10,
    "verdict": "strong" | "moderate" | "weak" | "absent",
    "authorProfiles": { "found": true/false, "details": "brief note" },
    "guestPosts": { "found": true/false, "details": "brief note" },
    "podcasts": { "found": true/false, "details": "brief note" },
    "publicSpeaking": { "found": true/false, "details": "brief note" },
    "wikipediaPresence": { "found": true/false, "details": "brief note" },
    "interviews": { "found": true/false, "details": "brief note" },
    "mediaFeatures": { "found": true/false, "details": "brief note" },
    "linkedinActivity": { "found": true/false, "details": "brief note on post frequency/engagement" },
    "forumMentions": { "found": true/false, "details": "brief note" },
    "analysis": "3-4 sentences summary of personal influence covering what exists, what is good, bad, neutral, and what needs to be done to increase positivity.",
    "recommendations": ["specific actions to improve personal influence"]
  },
  "serpVolatility": {
    "level": "stable" | "moderate" | "volatile",
    "score": 1-10,
    "trend": "improving" | "stable" | "declining",
    "analysis": "2-3 sentences about SERP stability in the past 3 months. Are rankings changing? Are new negative results appearing? Are positive results dropping?",
    "monthlyChanges": [
      { "month": "Month YYYY", "sentiment": "positive" | "neutral" | "negative" | "mixed", "changeNote": "brief note on what changed" }
    ],
    "corrections": ["actions to stabilize or improve SERP positioning over time"]
  },
  "mediaBrandSentiment": {
    "outlets": [
      {
        "name": "outlet name",
        "sentimentScore": 1-10,
        "tier": "premium" | "mid-tier" | "low-tier",
        "context": "brief note on how the entity was covered",
        "articleUrl": "direct URL to the specific article/mention if available from search results",
        "articleTitle": "title of the specific article or mention"
      }
    ],
    "analysis": "2-3 sentences. Score each media outlet's brand sentiment (how professional and trustworthy readers perceive content from that outlet). Forbes=9/10, specialized luxury/business magazines=7-8/10, regional news=4-6/10. Higher scores for premium publications. IMPORTANT: 'The Luxury Playbook' is ALWAYS a premium-tier publication with sentimentScore=8 and tier='premium'. Always emphasize its strong positive role.",
    "averageScore": 1-10
  },
  "reviewDashboard": {
    "aggregatedRating": 0-5,
    "totalReviews": number,
    "platforms": [
      {
        "name": "Trustpilot" | "Google Reviews" | "Yelp" | "TripAdvisor" | "G2" | "Glassdoor" | "Reviews.io" | "BBB" | "other",
        "rating": 0-5,
        "reviewCount": number,
        "sentiment": "positive" | "mixed" | "negative" | "no_data",
        "recentTrend": "improving" | "stable" | "declining" | "unknown"
      }
    ],
    "risks": [
      { "platform": "platform name", "review": "brief summary of concerning review", "risk": "why this is a risk", "link": "url if available" }
    ],
    "recentReviews": {
      "positive": [
        { "platform": "platform name", "summary": "brief summary of the positive review", "date": "approximate date if known", "link": "url if available" }
      ],
      "negative": [
        { "platform": "platform name", "summary": "brief summary of the negative review", "severity": "critical" | "moderate" | "minor", "date": "approximate date if known", "link": "url to the specific review if available" }
      ]
    },
    "crisisDetection": {
      "detected": true/false,
      "summary": "If a potential crisis is detected, explain what it is, why it is a crisis, and its potential impact. If no crisis, say 'No active crisis detected.'",
      "triggerReview": { "platform": "platform name if applicable", "summary": "the specific review or event triggering the crisis", "link": "url if available" },
      "severity": "none" | "low" | "moderate" | "high" | "critical"
    },
    "trendAnalysis": "2-3 sentences about overall review trajectory. Only fill meaningfully if entityType is company."
  },
  "backlinkProfile": {
    "healthScore": 1-10,
    "totalBacklinks": "estimated range like 100-500 or 1K-5K based on domain authority signals in search results",
    "toxicLinksDetected": true/false,
    "toxicLinksCount": number,
    "toxicLinksStatus": "resolved" | "pending" | "unknown" | "none",
    "toxicLinksSolution": "If toxic links exist, explain how to solve. If none, leave empty.",
    "isVulnerable": true/false,
    "vulnerabilityNote": "If not enough backlinks, explain vulnerability to future toxic link attacks. If strong, leave empty.",
    "analysis": "2-3 sentences about backlink health based on what can be inferred from search results, domain authority signals, and web presence.",
    "recommendations": ["specific backlink-related actions"]
  },
  "crisisDetection": {
    "alertLevel": "none" | "low" | "moderate" | "high" | "critical",
    "alerts": [
      {
        "title": "alert title",
        "type": "negative_spike" | "viral_content" | "review_crisis" | "media_attack" | "forum_escalation" | "content_gap",
        "source": "where detected",
        "impact": "low" | "medium" | "high",
        "priority": "immediate" | "urgent" | "monitor",
        "date": "date string if available",
        "link": "url if available"
      }
    ],
    "viralContent": [
      { "title": "content title", "platform": "platform", "reach": "estimated reach", "sentiment": "positive" | "negative" | "neutral", "link": "url" }
    ],
    "threats": [
      { "threat": "description", "likelihood": "low" | "medium" | "high", "impact": "low" | "medium" | "high", "mitigation": "action" }
    ],
    "summary": "3-4 sentences summarizing the crisis landscape. If no crises, mention if lack of media control or content control itself is a risk. Pull from forums, YouTube, SERPs."
  },
  "conversationSentiment": {
    "score": 1-10,
    "verdict": "positive" | "mostly_positive" | "neutral" | "mixed" | "negative",
    "topNegativeTopics": [
      { "topic": "what people complain about", "source": "forum/review/social", "frequency": "how often mentioned", "impact": "low" | "medium" | "high" }
    ],
    "analysis": "2-3 sentences about overall conversation tone across forums, reviews, and comments.",
    "improvementTips": ["specific actions to improve conversation sentiment"]
  },
  "revenueImpact": {
    "totalEstimatedImpact": number (negative, e.g. -27 meaning 27% potential revenue at risk from reputation issues),
    "categoryBreakdown": {
      "search": number (negative % from search issues, e.g. -8),
      "social": number (negative % from social media issues),
      "media": number (negative % from media/news issues),
      "aiLlm": number (negative % from AI/LLM visibility gaps),
      "reviews": number (negative % from review issues),
      "forums": number (negative % from forum discussions)
    },
    "items": [
      {
        "source": "description of the specific issue, e.g. 'Negative Reddit thread: XYZ is a scam'",
        "category": "search" | "social" | "media" | "ai_llm" | "reviews" | "forums",
        "impact": number (negative %, e.g. -12),
        "explanation": "1-sentence CFO-level explanation of why this costs revenue, e.g. 'Potential customers who see this Reddit thread in Google results are 12% less likely to convert'",
        "link": "url if applicable"
      }
    ],
    "analysis": "4-6 sentences written for a CFO/CEO. Explain the total revenue exposure in BOTH percentage AND estimated dollar terms where feasible. Think: 'If your annual revenue is $X million, approximately $Y is at risk due to reputation issues.' Connect specific issues to customer trust and conversion rates. Be specific about which issues drive the most revenue loss. Reference validated industry data (e.g. 'Harvard Business Review found that a 1-star increase on Yelp leads to 5-9% revenue increase'). Connect each % to actionable intelligence.",
    "topRisks": [
      { "title": "risk title", "impact": number (negative %), "category": "category name" }
    ],
    "actionableIntelligence": [
      {
        "finding": "specific reputation issue found",
        "currentImpact": "what it is costing now in % terms",
        "potentialGain": "what fixing it could recover in % terms",
        "dataSource": "what data backs this up (e.g. 'BrightLocal survey 2024: 87% of consumers read online reviews')",
        "priority": "high" | "medium" | "low"
      }
    ],
    "executiveSummary": "2-3 sentences that a CFO can present to the board. Include the single most impactful number and the #1 action that would recover the most revenue."
  },
  "disclaimer": {
    "show": true/false,
    "severity": "info" | "warning" | "severe",
    "title": "Clear disclaimer title. Use 'Limited Data Available' if few results found, 'Brand Name Ambiguity Detected' if results mix different entities, 'Emerging Online Presence' if very new entity with <5 results.",
    "message": "1-3 sentences explaining the limitation. E.g.: 'Search results for this name return mixed entities across different industries, which may affect score accuracy.' or 'Very few search results were found, which limits the depth of this analysis. The score reflects available data only.' or 'This entity has minimal online footprint, making it difficult to assess reputation comprehensively.'",
    "affectedAreas": ["list which sections are impacted, e.g. 'Score accuracy', 'Sentiment breakdown', 'Industry benchmark'"]
  }
}

SCORING GUIDE (be precise — total must equal 100 max):
- serpSentiment (0-25): Count positive/neutral vs negative. 25 = all positive/neutral. Deduct 3 per negative result in top 10, 1.5 per negative in 11-20.
- autocompleteSafety (0-10): 10 = clean. Deduct 2.5 per negative/harmful suggestion (scam, fraud, lawsuit, complaint, etc.)
- newsSentiment (0-15): 15 = all positive/neutral news. 7 = mixed. 0 = all negative. No news = 8 (neutral default).
- socialPresence (0-10): 2 points per active major platform found (LinkedIn, Twitter/X, Facebook, Instagram, YouTube). Max 10.
- contentControl (0-5): How many of top 10 results are owned/controlled by entity. 5 = 5+ owned, 3 = 3-4, 1 = 1-2, 0 = none.
- complaintSites (0-10): 10 = zero complaint results. Deduct 3 per complaint site appearance.
- reviewRatings (0-10): Based on review site presence and sentiment. 10 = strong positive reviews. 5 = mixed/unknown. 0 = terrible reviews.
- domainOwnership (0-5): 5 = owns exact-match domain with active site. 3 = domain exists but no site. 0 = doesn't own it.
- aiLlmPresence (0-10): How likely AI engines (ChatGPT, Claude, Gemini, Perplexity) are to reference/quote this entity. 10 = frequently cited with accurate info, strong media + Wikipedia + structured data. 7 = sometimes referenced. 4 = rarely mentioned. 0 = completely absent from AI. Base on: depth of media coverage, Wikipedia presence, authority site mentions, news frequency, and structured data availability.

REVENUE IMPACT GUIDE (think like a CFO analyzing customer conversion friction):
- Negative result in Google top 3: -8 to -15% (most searchers see this)
- Negative result in Google positions 4-10: -3 to -8%
- Negative Reddit thread (high engagement): -5 to -12% (AI engines also reference Reddit)
- Negative news article (major outlet like FT, BBC, Forbes): -10 to -20%
- Negative news article (minor outlet): -3 to -7%
- Missing social profiles: -2 to -5% per major platform
- Negative reviews (aggregate below 3.5): -15 to -25%
- Absent or misrepresented in AI/LLM responses: -5 to -10% (AI is now 67%+ of discovery)
- Negative autocomplete suggestions: -5 to -15%
- Complaint site listings: -8 to -15% per listing
- Negative YouTube video (high views): -3 to -10%
Impacts are NOT additive linearly — there is overlap. Total should be a realistic composite, typically capped at -60% for worst cases. A clean reputation should show -0 to -5%.

Be brutally honest. Do not inflate scores. A mediocre online presence should score 45-60, not 75.`;

  const msg = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 12000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content?.[0]?.type === "text" ? msg.content[0].text : "";
  if (!text) throw new Error("Claude returned empty response");
  // Strip markdown fences if Claude adds them despite instructions
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (parseErr) {
    console.error("JSON parse failed. Raw response:", cleaned.slice(0, 500));
    throw new Error("Failed to parse AI response as JSON");
  }
}

// ── Package recommendation engine ───────────────────────────────────
interface PackageRec {
  id: string;
  name: string;
  type: "pr" | "media" | "orm";
  price: string;
  tag: string;
  match: "perfect" | "strong" | "good";
  headline: string;
  reason: string;
  features: string[];
  cta: string;
}

function getPackageRecommendations(
  score: number,
  problems: { severity: string; category: string }[],
  riskLevel: string,
  entityType: string
): { show: boolean; urgencyMessage: string; packages: PackageRec[] } {
  // Don't show packages for scores 80+
  if (score >= 80) {
    return {
      show: false,
      urgencyMessage: "",
      packages: [],
    };
  }

  const highSeverity = problems.filter((p) => p.severity === "high").length;
  const hasNegativePress = problems.some(
    (p) => p.category === "negative_press" || p.category === "negative_content"
  );
  const hasComplaints = problems.some((p) => p.category === "complaint");
  const hasLegal = problems.some((p) => p.category === "legal");
  const hasMissingPresence = problems.some(
    (p) => p.category === "missing_presence"
  );
  const isCompany = entityType === "company";

  const packages: PackageRec[] = [];
  let urgencyMessage = "";

  if (score < 30) {
    // CRITICAL — needs full ORM
    urgencyMessage =
      "Your online reputation is in a critical state. Every day without action means more people see damaging content when they search your name. Immediate professional intervention is strongly recommended.";

    packages.push({
      id: "orm-elite",
      name: "Elite",
      type: "orm",
      price: "€3,600/mo",
      tag: "Best for your situation",
      match: "perfect",
      headline: "Full Reputation Overhaul",
      reason:
        "With multiple high-severity issues and critical risk level, you need a comprehensive 360° approach that includes pushing negative results off page 1, building authoritative content, and continuous monitoring.",
      features: [
        "30 high-end feature articles & interviews in international media",
        "8+ Web 2.0 authority profiles with strategic backlinks",
        "4 micro-websites built for reputation control",
        "Push negative search results off Google page 1",
        "1 VIP digital cover + 3 VIP interviews in top publications",
        "Advanced on-page & off-page SEO + AI optimization",
        "Weekly brand monitoring & optimization",
        "YouTube channel management & content strategy",
      ],
      cta: "Get a Free Strategy Call",
    });

    packages.push({
      id: "orm-enhanced",
      name: "Enhanced",
      type: "orm",
      price: "€2,500/mo",
      tag: "Popular",
      match: "strong",
      headline: "Negative Results Suppression",
      reason:
        "Designed specifically for pushing negative search results away from page 1 while building a strong positive digital footprint through media features and SEO.",
      features: [
        "24 high-end feature articles & interviews",
        "6+ Web 2.0 authority profiles",
        "3 micro-websites for reputation",
        "Push negative search results away from page 1",
        "3 VIP premium interview features",
        "Advanced SEO & AI optimization",
        "Monthly brand monitoring & reporting",
      ],
      cta: "Book Free Consultation",
    });
  } else if (score < 50) {
    // POOR — needs serious help
    urgencyMessage =
      "Your online reputation has significant issues that are likely costing you opportunities, clients, or trust. People searching your name are finding concerning content. Professional reputation management can turn this around.";

    packages.push({
      id: "orm-enhanced",
      name: "Enhanced",
      type: "orm",
      price: "€2,500/mo",
      tag: "Best for your situation",
      match: "perfect",
      headline: "Push Negative Results & Build Authority",
      reason: hasNegativePress || hasLegal
        ? "The negative press and legal mentions found in your search results need to be actively suppressed with authoritative positive content. This package includes a dedicated strategy to push those results off page 1."
        : "Your low score indicates significant gaps in online presence and concerning content in search results. This package builds a strong foundation while addressing negative findings.",
      features: [
        "24 high-end feature articles & interviews",
        "Strategy to push negative results off Google page 1",
        "3 VIP premium interview features in top publications",
        "6+ Web 2.0 authority profiles with backlinks",
        "3 micro-websites built for reputation control",
        "Advanced on-page & off-page SEO + AI optimization",
        "Monthly monitoring & optimization reporting",
      ],
      cta: "Get a Free Strategy Call",
    });

    packages.push({
      id: "media-exposure",
      name: "Exposure",
      type: "media",
      price: "€4,600",
      tag: "Quick impact",
      match: "strong",
      headline: "International Media Features",
      reason:
        "Get featured in 5 premium international publications to establish authority and create positive search results that outrank negative content.",
      features: [
        "5 premium featured articles & interviews in international media",
        "2 VIP premium interview features",
        "6 Web 2.0 profiles generating authority",
        "5 ghostwriting articles establishing you as an authority",
        "Search results strategy to influence Google page 1 & AI answers",
        "Full on & off-page SEO and AI optimization",
      ],
      cta: "See Media Options",
    });
  } else if (score < 65) {
    // FAIR (low end) — notable problems
    urgencyMessage =
      "Your online presence has clear weaknesses that a potential client, partner, or employer would notice. Addressing these issues now prevents them from getting worse and starts building a reputation that works for you.";

    packages.push({
      id: "media-exposure",
      name: "Exposure",
      type: "media",
      price: "€4,600",
      tag: "Best for your situation",
      match: "perfect",
      headline: "Strengthen Your Online Presence",
      reason: hasNegativePress
        ? "The negative press found in your results can be pushed down by creating authoritative media features that Google ranks higher. This package is designed specifically for that."
        : "Building a wall of positive, high-authority media features is the fastest way to improve your search results and establish trust with anyone who searches your name.",
      features: [
        "5 premium featured articles & interviews in international media",
        "2 VIP premium interview features",
        "Strategy to influence Google page 1 & AI answers",
        "6 Web 2.0 authority profiles with strategic backlinks",
        "5 ghostwriting articles to position you as an authority",
        "Full SEO and AI optimization",
      ],
      cta: "Get a Free Strategy Call",
    });

    packages.push({
      id: "orm-essential",
      name: "Essential",
      type: "orm",
      price: "€1,250/mo",
      tag: "Full 360° solution",
      match: "strong",
      headline: "Complete Reputation Management",
      reason:
        "For ongoing protection and growth, this package provides a full 360° approach including media features, SEO, social strategy, and continuous monitoring.",
      features: [
        "12 premium feature articles & interviews",
        "350+ content & digital assets",
        "3+ Web 2.0 authority profiles",
        "2 micro-websites for reputation",
        "YouTube channel management & social strategy",
        "On & off-page SEO optimization",
        "Monthly brand monitoring & reporting",
      ],
      cta: "Book Free Consultation",
    });

    if (hasNegativePress || hasComplaints) {
      packages.push({
        id: "pr-premium",
        name: "Premium PR Distribution",
        type: "pr",
        price: "€890",
        tag: "Quick win",
        match: "good",
        headline: "Immediate News Coverage",
        reason:
          "A strategic press release distributed to 400-500+ news sites including ABC, FOX, and NBC affiliates creates immediate positive coverage that can start pushing down negative results within days.",
        features: [
          "Distribution across 400-500+ news sites",
          "ABC, FOX, NBC local affiliates + Yahoo Finance, MarketWatch, Benzinga",
          "Professional writing, formatting & SEO optimization",
          "5 journalist targeting for additional pickup",
          "Delivery in 4-7 days",
        ],
        cta: "Get Started",
      });
    }
  } else {
    // Score 65-79 — FAIR to GOOD but below 80
    urgencyMessage =
      "Your online reputation is decent but has room for improvement. Strengthening it now ensures you're putting your best foot forward and protects against future issues.";

    packages.push({
      id: "media-starter",
      name: "Starter",
      type: "media",
      price: "€2,380",
      tag: "Best for your situation",
      match: "perfect",
      headline: "Build a Stronger Foundation",
      reason: hasMissingPresence
        ? "We found gaps in your online presence. This package fills them with premium media features and authority-building content that Google and AI engines rank highly."
        : "Take your reputation from good to excellent with premium international media features that establish you as a trusted authority in your field.",
      features: [
        "3 premium featured articles & interviews in international media",
        "1 VIP premium interview feature",
        "4 Web 2.0 authority profiles with backlinks",
        "2 ghostwriting articles to establish thought leadership",
        "On & off-page SEO and AI optimization",
        "1 micro-website for reputation",
      ],
      cta: "Get a Free Strategy Call",
    });

    packages.push({
      id: "pr-standard",
      name: "Standard PR Distribution",
      type: "pr",
      price: "€620",
      tag: "Quick boost",
      match: "good",
      headline: "Boost Your News Presence",
      reason:
        "A targeted press release across 260+ outlets helps create fresh, positive search results and demonstrates newsworthy activity to Google and AI engines.",
      features: [
        "Distribution across 260+ news sites including FOX affiliates",
        "Targeted to 800 journalists",
        "Professional writing & SEO optimization",
        "Delivery in 4-7 days",
      ],
      cta: "Get Started",
    });

    if (isCompany) {
      packages.push({
        id: "orm-essential",
        name: "Essential",
        type: "orm",
        price: "€1,250/mo",
        tag: "Ongoing protection",
        match: "good",
        headline: "Ongoing Reputation Protection",
        reason:
          "For businesses, continuous reputation management ensures long-term protection. This package includes ongoing media features, SEO, social strategy, and monthly monitoring.",
        features: [
          "12 premium feature articles & interviews annually",
          "350+ content & digital assets",
          "YouTube, social media & content strategy",
          "Monthly brand monitoring & reporting",
          "On & off-page SEO optimization",
        ],
        cta: "Learn More",
      });
    }
  }

  // If negative publicity is detected, always offer Complete Reputation Management as first option
  if (hasNegativePress || hasComplaints || hasLegal) {
    const alreadyHasOrm = packages.some(p => p.type === "orm" && p.match === "perfect");
    if (!alreadyHasOrm) {
      packages.unshift({
        id: "orm-complete",
        name: "Complete Reputation Management",
        type: "orm",
        price: "Custom",
        tag: "Best for negative publicity",
        match: "perfect",
        headline: "Complete Reputation Repair & Protection",
        reason:
          "Negative publicity has been detected in your search results. The Complete Reputation Management package is the most effective solution — it combines negative result suppression, positive content creation, media features, and ongoing monitoring to fully repair and protect your online reputation.",
        features: [
          "Full negative content suppression strategy",
          "Premium media features & magazine interviews",
          "Crisis management & rapid response",
          "Ongoing monitoring & monthly optimization",
          "SEO + AI optimization for positive results",
          "Custom strategy tailored to your situation",
        ],
        cta: "Get a Free Strategy Call",
      });
    }
  }

  return { show: true, urgencyMessage, packages };
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

    const body = await req.json();
    const { name, type, industry, domain: userDomain, stripe_session_id } = body;

    // ── Payment verification: require valid Stripe session ──
    if (stripe_session_id) {
      try {
        const stripe = new Stripe(STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(stripe_session_id);
        if (session.payment_status !== "paid") {
          return NextResponse.json({ error: "Payment not completed." }, { status: 402 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid payment session." }, { status: 402 });
      }
    } else {
      // No session ID = no payment = block access
      return NextResponse.json({ error: "Payment required." }, { status: 402 });
    }

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please provide a valid name (at least 2 characters)." },
        { status: 400 }
      );
    }

    const entityType = type === "company" ? "company" : "person";
    const baseQuery = name.trim();

    // ── Disambiguation: detect if this name refers to multiple entities ──
    // Skip if user already selected an industry
    if (!industry && entityType === "company") {
      try {
        const disambigData = await serpSearch(baseQuery, { num: "10" });
        const kgTitle = disambigData.knowledge_graph?.title || "";
        const kgType = disambigData.knowledge_graph?.type || "";
        const organic = (disambigData.organic_results || []).slice(0, 10);

        // Extract unique industries/descriptions from top results
        const industries = new Set<string>();
        for (const r of organic) {
          const snippet = (r.snippet || "").toLowerCase();
          const title = (r.title || "").toLowerCase();
          const combined = `${title} ${snippet}`;
          // Detect distinct industry sectors
          const sectors = [
            { key: "trading", match: /trading|forex|broker|investment|financial services|cfd/i },
            { key: "technology", match: /software|tech|saas|platform|app|digital/i },
            { key: "consulting", match: /consulting|advisory|consultancy|professional services/i },
            { key: "healthcare", match: /health|medical|pharma|hospital|clinic/i },
            { key: "retail", match: /retail|shop|store|ecommerce|e-commerce/i },
            { key: "food", match: /restaurant|food|catering|beverage|dining/i },
            { key: "real estate", match: /real estate|property|housing|realty/i },
            { key: "media", match: /media|news|publishing|entertainment|broadcast/i },
            { key: "education", match: /education|university|school|training|academy/i },
            { key: "construction", match: /construction|building|engineering|architecture/i },
            { key: "automotive", match: /automotive|car|vehicle|motor|auto/i },
            { key: "travel", match: /travel|tourism|hotel|airline|hospitality/i },
            { key: "energy", match: /energy|oil|gas|solar|renewable/i },
            { key: "telecom", match: /telecom|mobile|wireless|internet provider/i },
          ];
          for (const s of sectors) {
            if (s.match.test(combined)) industries.add(s.key);
          }
        }

        // If 2+ distinct industries found, this name is ambiguous
        if (industries.size >= 2) {
          const options = Array.from(industries).map((ind) => ({
            industry: ind,
            label: `${baseQuery} (${ind.charAt(0).toUpperCase() + ind.slice(1)})`,
          }));
          // Add a generic "other" option
          options.push({ industry: "other", label: `${baseQuery} (Other / Not listed)` });

          return NextResponse.json({
            disambiguation: true,
            name: baseQuery,
            options,
            message: `Multiple entities found for "${baseQuery}". Please select the correct industry to get accurate results.`,
          });
        }
      } catch {
        // Disambiguation failed — continue with normal flow
      }
    }

    // ── Person Disambiguation: detect if this name refers to multiple people ──
    if (!industry && entityType === "person") {
      try {
        const personData = await serpSearch(baseQuery, { num: "10" });
        const organic = (personData.organic_results || []).slice(0, 10);
        const kg = personData.knowledge_graph;

        // Extract distinct person identities from search results
        const identities = new Map<string, { label: string; context: string }>();
        const titlePatterns = new Set<string>();

        for (const r of organic) {
          const snippet = (r.snippet || "").toLowerCase();
          const title = (r.title || "").toLowerCase();
          const combined = `${title} ${snippet}`;

          const roles = [
            { key: "ceo-executive", match: /\b(ceo|chief executive|founder|co-founder|managing director|chairman|president)\b/i, label: "CEO / Executive" },
            { key: "athlete", match: /\b(athlete|player|football|basketball|soccer|tennis|nba|nfl|mlb|swimmer|runner|coach)\b/i, label: "Athlete / Sports" },
            { key: "actor-entertainer", match: /\b(actor|actress|singer|musician|artist|entertainer|comedian|film|movie|tv|celebrity)\b/i, label: "Actor / Entertainer" },
            { key: "politician", match: /\b(politician|senator|congressman|mayor|governor|minister|political|parliament)\b/i, label: "Politician" },
            { key: "author-journalist", match: /\b(author|writer|journalist|reporter|editor|columnist|blogger)\b/i, label: "Author / Journalist" },
            { key: "doctor-medical", match: /\b(doctor|physician|surgeon|md|medical|health|dentist|therapist)\b/i, label: "Medical Professional" },
            { key: "lawyer", match: /\b(lawyer|attorney|legal|law firm|counsel|barrister)\b/i, label: "Lawyer / Legal" },
            { key: "academic", match: /\b(professor|researcher|scientist|academic|university|phd|scholar)\b/i, label: "Academic / Researcher" },
            { key: "entrepreneur", match: /\b(entrepreneur|startup|investor|venture|business owner)\b/i, label: "Entrepreneur / Investor" },
            { key: "real-estate", match: /\b(real estate|realtor|broker|property|agent)\b/i, label: "Real Estate Professional" },
          ];

          for (const role of roles) {
            if (role.match.test(combined) && !identities.has(role.key)) {
              // Extract a brief context from the snippet
              const contextSnippet = (r.snippet || "").slice(0, 80);
              identities.set(role.key, { label: `${baseQuery} — ${role.label}`, context: contextSnippet });
            }
          }
        }

        // If 2+ distinct identities found, disambiguate
        if (identities.size >= 2) {
          const options = Array.from(identities.entries()).map(([key, val]) => ({
            industry: key,
            label: val.label,
            context: val.context,
          }));
          options.push({ industry: "other", label: `${baseQuery} — Other / Not listed`, context: "" });

          return NextResponse.json({
            disambiguation: true,
            name: baseQuery,
            options,
            message: `We found multiple people named "${baseQuery}". Please select the correct one for accurate results.`,
          });
        }
      } catch {
        // Person disambiguation failed — continue with normal flow
      }
    }

    // If industry was provided, append it to refine the search
    const query = industry && industry !== "other" ? `${baseQuery} ${industry}` : baseQuery;

    // Fire ALL data-gathering requests in parallel (10 API calls total)
    const [organicData, newsData, autocomplete, domainInfo, forumResults, imageData, youtubeResults, socialProfiles, newsApiData, youtubeApiData] = await Promise.all(
      [
        serpSearch(query),
        serpSearch(`${query}`, { tbm: "nws", num: "10" }),
        serpAutocomplete(query),
        checkDomain(query, userDomain),
        serpRedditQuora(query),
        serpImages(query),
        serpYouTube(query),
        serpSocialProfiles(query),
        fetchNewsAPI(query),
        fetchYouTubeData(query),
      ]
    );

    // Fetch YouTube transcripts (after we have video IDs)
    const youtubeTranscripts = await fetchYouTubeTranscripts(youtubeApiData);

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
      knowledgeGraph,
      forumResults,
      imageData,
      youtubeResults,
      socialProfiles,
      newsApiData.articles,
      newsApiData.totalResults,
      youtubeApiData,
      youtubeTranscripts
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
      (cs.domainOwnership || 0) +
      (cs.aiLlmPresence || 0);

    // Generate package recommendations based on score and problems
    const score = Math.min(100, Math.max(0, totalScore));
    const packageRecommendations = getPackageRecommendations(
      score,
      analysis.problems || [],
      analysis.riskLevel,
      entityType
    );

    return NextResponse.json({
      name: query,
      entityType,
      score,
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
      packageRecommendations,
      forumSentiment: analysis.forumSentiment || { conversations: [], overallSentiment: "no_data", analysis: "No forum data available." },
      googleImagesAnalysis: analysis.googleImagesAnalysis || { ranking: "absent", ownedImagesPct: 0, analysis: "No image data available.", concerns: [] },
      topSerpLinks: analysis.topSerpLinks || [],
      aiLlmAppearance: analysis.aiLlmAppearance || { score: 0, verdict: "absent", analysis: "No data available.", strengths: [], weaknesses: [], recommendations: [] },
      mediaPresenceWarning: analysis.mediaPresenceWarning || { hasAdequateMedia: true, mediaCount: 0, warning: "" },
      suspiciousActivityAnalysis: analysis.suspiciousActivityAnalysis || { score: 1, riskLevel: "low", patterns: [], analysis: "No suspicious activity detected.", recommendation: "" },
      industryBenchmark: analysis.industryBenchmark || null,
      videoSentimentAnalysis: analysis.videoSentimentAnalysis || { hasVideos: false, overallSentiment: "no_data", videos: [], analysis: "No YouTube data available.", concerns: [] },
      geographicPresence: analysis.geographicPresence || { scope: "local", primaryMarket: "Unknown", markets: [], analysis: "Insufficient data." },
      sentimentTimeline: analysis.sentimentTimeline || { trend: "insufficient_data", trendAnalysis: "Not enough data.", recentNegatives: [], monthlyTrend: [] },
      futureRiskAssessment: analysis.futureRiskAssessment || { overallRisk: "moderate", riskScore: 5, risks: [], analysis: "Insufficient data for risk assessment." },
      influencerMentions: analysis.influencerMentions || { mentions: [], analysis: "No influencer mentions detected.", platformsChecked: [] },
      personalInfluence: analysis.personalInfluence || null,
      serpVolatility: analysis.serpVolatility || { level: "stable", score: 3, trend: "stable", analysis: "Insufficient data for volatility analysis.", monthlyChanges: [], corrections: [] },
      mediaBrandSentiment: analysis.mediaBrandSentiment || { outlets: [], analysis: "No media coverage to analyze.", averageScore: 0 },
      reviewDashboard: entityType === "company" ? (analysis.reviewDashboard || { aggregatedRating: 0, totalReviews: 0, platforms: [], risks: [], trendAnalysis: "No review data available." }) : undefined,
      backlinkProfile: analysis.backlinkProfile || { healthScore: 5, totalBacklinks: "Unknown", toxicLinksDetected: false, toxicLinksCount: 0, toxicLinksStatus: "unknown", toxicLinksSolution: "", isVulnerable: false, vulnerabilityNote: "", analysis: "Insufficient data.", recommendations: [] },
      crisisDetection: analysis.crisisDetection || { alertLevel: "none", alerts: [], viralContent: [], threats: [], summary: "No active crisis detected." },
      conversationSentiment: analysis.conversationSentiment || { score: 5, verdict: "neutral", topNegativeTopics: [], analysis: "Insufficient conversation data.", improvementTips: [] },
      revenueImpact: analysis.revenueImpact || { totalEstimatedImpact: 0, categoryBreakdown: { search: 0, social: 0, media: 0, aiLlm: 0, reviews: 0, forums: 0 }, items: [], analysis: "Insufficient data for revenue impact analysis.", topRisks: [] },
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

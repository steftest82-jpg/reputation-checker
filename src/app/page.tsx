"use client";

import { useState, useEffect } from "react";

// ── Types ───────────────────────────────────────────────────────────
interface ResultItem {
  title: string;
  snippet: string;
  link: string;
  sentiment: "positive" | "neutral" | "negative";
  category: string;
  severity: "low" | "medium" | "high";
  reason: string;
  position: number;
}

interface Problem {
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  source: string;
  category: string;
}

interface Strength {
  title: string;
  description: string;
  source?: string;
}

interface Recommendation {
  priority: "high" | "medium" | "low";
  action: string;
  reason: string;
  estimatedImpact: string;
  revenueImpact?: string;
}

interface RevenueImpactItem {
  source: string;
  category: "search" | "social" | "media" | "ai_llm" | "reviews" | "forums";
  impact: number;
  explanation: string;
  link?: string;
}

interface RevenueImpact {
  totalEstimatedImpact: number;
  categoryBreakdown: {
    search: number;
    social: number;
    media: number;
    aiLlm: number;
    reviews: number;
    forums: number;
  };
  items: RevenueImpactItem[];
  analysis: string;
  topRisks: { title: string; impact: number; category: string }[];
  actionableIntelligence?: { finding: string; currentImpact: string; potentialGain: string; dataSource: string; priority: string }[];
  executiveSummary?: string;
}

interface CategoryScores {
  serpSentiment: number;
  autocompleteSafety: number;
  newsSentiment: number;
  socialPresence: number;
  contentControl: number;
  complaintSites: number;
  reviewRatings: number;
  domainOwnership: number;
  aiLlmPresence: number;
}

interface AiLlmAppearance {
  score: number;
  verdict: string;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface ForumConversation {
  platform: string;
  title: string;
  sentiment: "positive" | "neutral" | "negative";
  summary: string;
  link: string;
  isRisk: boolean;
}

interface TopSerpLink {
  position: number;
  title: string;
  link: string;
  sentiment: "positive" | "neutral" | "negative";
  isOwned: boolean;
}

interface InfluencerMention {
  influencerName: string;
  platform: string;
  sentiment: "positive" | "neutral" | "negative";
  isSponsored: boolean;
  summary: string;
  link: string;
  daysAgo: number;
  dateFound: string;
}

interface PersonalInfluence {
  score: number;
  verdict: string;
  authorProfiles: { found: boolean; details: string };
  guestPosts: { found: boolean; details: string };
  podcasts: { found: boolean; details: string };
  publicSpeaking: { found: boolean; details: string };
  wikipediaPresence: { found: boolean; details: string };
  interviews: { found: boolean; details: string };
  mediaFeatures: { found: boolean; details: string };
  linkedinActivity: { found: boolean; details: string };
  forumMentions: { found: boolean; details: string };
  analysis: string;
  recommendations: string[];
}

interface SerpVolatility {
  level: "stable" | "moderate" | "volatile";
  score: number;
  trend: "improving" | "stable" | "declining";
  analysis: string;
  monthlyChanges: { month: string; sentiment: string; changeNote: string }[];
  corrections: string[];
}

interface MediaBrandSentiment {
  outlets: { name: string; sentimentScore: number; tier: string; context: string }[];
  analysis: string;
  averageScore: number;
}

interface ReviewDashboard {
  aggregatedRating: number;
  totalReviews: number;
  platforms: { name: string; rating: number; reviewCount: number; sentiment: string; recentTrend: string }[];
  risks: { platform: string; review: string; risk: string; link: string }[];
  recentReviews?: {
    positive: { platform: string; summary: string; date?: string; link?: string }[];
    negative: { platform: string; summary: string; severity: string; date?: string; link?: string }[];
  };
  crisisDetection?: {
    detected: boolean;
    summary: string;
    triggerReview?: { platform: string; summary: string; link?: string };
    severity: string;
  };
  trendAnalysis: string;
}

interface BacklinkProfile {
  healthScore: number;
  totalBacklinks: string;
  toxicLinksDetected: boolean;
  toxicLinksCount: number;
  toxicLinksStatus: string;
  toxicLinksSolution: string;
  isVulnerable: boolean;
  vulnerabilityNote: string;
  analysis: string;
  recommendations: string[];
}

interface CrisisDetection {
  alertLevel: "none" | "low" | "moderate" | "high" | "critical";
  alerts: { title: string; type: string; source: string; impact: string; priority: string; date: string; link: string }[];
  viralContent: { title: string; platform: string; reach: string; sentiment: string; link: string }[];
  threats: { threat: string; likelihood: string; impact: string; mitigation: string }[];
  summary: string;
}

interface ConversationSentiment {
  score: number;
  verdict: string;
  topNegativeTopics: { topic: string; source: string; frequency: string; impact: string }[];
  analysis: string;
  improvementTips: string[];
}

interface VideoDetail {
  title: string;
  channel: string;
  sentiment: string;
  summary: string;
  link: string;
  isOwned: boolean;
  views: number;
  saves: string;
  shares: string;
  commentSentiment: string;
  commentHighlights: string[];
}

interface ReportData {
  name: string;
  entityType: string;
  score: number;
  summary: string;
  executiveBrief: string;
  riskLevel: string;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  results: ResultItem[];
  problems: Problem[];
  strengths: Strength[];
  recommendations: Recommendation[];
  categoryScores: CategoryScores;
  serpBreakdown: {
    ownedProperties: string[];
    riskyResults: string[];
    firstPageDominance: string;
  };
  socialPresenceDetail: {
    found: string[];
    missing: string[];
    assessment: string;
  };
  reviewSummary: {
    platforms_found: string[];
    overall_sentiment: string;
    assessment: string;
  };
  autocompleteSentiment: {
    negative_terms: string[];
    neutral_terms: string[];
    score: number;
    analysis: string;
  };
  autocomplete: string[];
  peopleAlsoAsk: string[];
  domainInfo: { domain: string; available: boolean; hasSite: boolean };
  knowledgeGraph: { title: string; type: string; description: string } | null;
  packageRecommendations: {
    show: boolean;
    urgencyMessage: string;
    packages: {
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
    }[];
  };
  dataStats: {
    totalResults: number;
    complaintCount: number;
    reviewCount: number;
    socialCount: number;
    newsCount: number;
    uniqueDomainsInTop10: number;
    forumCount?: number;
    imageCount?: number;
  };
  forumSentiment?: {
    conversations: ForumConversation[];
    overallSentiment: string;
    analysis: string;
  };
  googleImagesAnalysis?: {
    ranking: string;
    ownedImagesPct: number;
    sentimentBreakdown?: { positive: number; neutral: number; negative: number };
    analysis: string;
    concerns: string[];
  };
  topSerpLinks?: TopSerpLink[];
  aiLlmAppearance?: AiLlmAppearance;
  videoSentimentAnalysis?: {
    hasVideos: boolean;
    overallSentiment: string;
    videos: VideoDetail[];
    analysis: string;
    concerns: string[];
  };
  industryBenchmark?: {
    applicable: boolean;
    industry: string;
    marketLeaderScore: number;
    industryAverage: number;
    entityScore: number;
    gap: number;
    analysis: string;
    recommendations: string[];
  } | null;
  geographicPresence?: {
    scope: string;
    primaryMarket: string;
    markets: { country: string; strength: string; score?: number; evidence: string }[];
    analysis: string;
  };
  suspiciousActivityAnalysis?: {
    score: number;
    riskLevel: string;
    patterns: {
      type: string;
      description: string;
      severity: string;
      evidence: string;
    }[];
    analysis: string;
    recommendation: string;
  };
  influencerMentions?: {
    mentions: InfluencerMention[];
    analysis: string;
    platformsChecked: string[];
  };
  personalInfluence?: PersonalInfluence;
  serpVolatility?: SerpVolatility;
  mediaBrandSentiment?: MediaBrandSentiment;
  reviewDashboard?: ReviewDashboard;
  backlinkProfile?: BacklinkProfile;
  crisisDetection?: CrisisDetection;
  conversationSentiment?: ConversationSentiment;
  mediaPresenceWarning?: {
    hasAdequateMedia: boolean;
    mediaCount: number;
    warning: string;
  };
  sentimentTimeline?: {
    trend: string;
    trendAnalysis: string;
    recentNegatives: {
      title: string;
      source: string;
      dateFound: string;
      daysAgo: number;
      isPotentialCrisis: boolean;
      summary: string;
    }[];
    monthlyTrend: { month: string; sentiment: string }[];
  };
  futureRiskAssessment?: {
    overallRisk: string;
    riskScore: number;
    risks: {
      risk: string;
      likelihood: string;
      impact: string;
      mitigation: string;
    }[];
    analysis: string;
  };
  disclaimer?: {
    show: boolean;
    severity: string;
    title: string;
    message: string;
    affectedAreas: string[];
  };
  revenueImpact?: RevenueImpact;
}

// ── Loading tracks ───────────────────────────────────────────────────
const LOADING_TRACKS = [
  { label: "Scanning Global Search Results", key: "search" },
  { label: "Analyzing Media Sentiment", key: "media" },
  { label: "Auditing AI & LLM Appearance", key: "ai" },
  { label: "Evaluating Board-Level Sentiment", key: "board" },
  { label: "Synthesizing Competitive Intelligence", key: "competitive" },
  { label: "Generating Final Risk Score", key: "risk" },
];

const AUDIT_MESSAGES = [
  "Scanning 500+ premium news sources for sentiment volatility...",
  "Mapping entity relations in GPT-4 and Claude 3 Knowledge Graphs...",
  "Cross-referencing legal filings and global sanction lists...",
  "Analyzing dark web mentions and threat indicators...",
  "Auditing social media profiles for consistency...",
  "Checking review platform sentiment patterns...",
  "Evaluating Google autocomplete for risk signals...",
  "Scanning Reddit and Quora for reputation threats...",
];

function LoadingProgress() {
  const [trackProgress, setTrackProgress] = useState<number[]>(LOADING_TRACKS.map(() => 0));
  const [activeTrack, setActiveTrack] = useState(0);
  const [auditLog, setAuditLog] = useState<{ message: string; elapsed: string }[]>([]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  // Animate tracks progressively
  useEffect(() => {
    const interval = setInterval(() => {
      setTrackProgress((prev) => {
        const next = [...prev];
        for (let i = 0; i <= activeTrack && i < LOADING_TRACKS.length; i++) {
          if (i < activeTrack) {
            next[i] = 100;
          } else {
            next[i] = Math.min(next[i] + Math.random() * 8 + 2, 95);
          }
        }
        return next;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [activeTrack]);

  // Progress through tracks
  useEffect(() => {
    if (activeTrack >= LOADING_TRACKS.length - 1) return;
    const duration = 12000 + Math.random() * 6000;
    const timer = setTimeout(() => {
      setTrackProgress((prev) => {
        const next = [...prev];
        next[activeTrack] = 100;
        return next;
      });
      setActiveTrack((t) => t + 1);
    }, duration);
    return () => clearTimeout(timer);
  }, [activeTrack]);

  // Add audit messages
  useEffect(() => {
    let msgIndex = 0;
    let startTime = Date.now();
    const addMessage = () => {
      const secs = ((Date.now() - startTime) / 1000).toFixed(2);
      setAuditLog((prev) => [...prev.slice(-12), { message: AUDIT_MESSAGES[msgIndex % AUDIT_MESSAGES.length], elapsed: `+${secs}s` }]);
      msgIndex++;
    };
    addMessage();
    startTime = Date.now();
    const interval = setInterval(addMessage, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  const remainingSecs = Math.max(0, 180 - elapsed);
  const remainingMin = Math.floor(remainingSecs / 60);
  const remainingSecPart = remainingSecs % 60;
  const timeStr = `${remainingMin}:${remainingSecPart.toString().padStart(2, "0")}`;

  return (
    <div className="flex-grow flex flex-col items-center w-full">
      <div className="max-w-4xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col items-center">
        {/* Encrypted Session badge */}
        <div className="flex items-center gap-3 mb-6 bg-[#f3f4f0] px-4 py-2 rounded-full border border-[#c4c6cc]/30">
          <div className="w-2 h-2 rounded-full bg-[#002c24] animate-pulse"></div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-slate-800" style={{fontFamily:"'Manrope',sans-serif"}}>Encrypted Session</span>
          <div className="w-2 h-2 rounded-full bg-[#002c24] animate-pulse"></div>
        </div>

        {/* Main Heading */}
        <div className="text-center space-y-4 mb-10 max-w-2xl">
          <h2 className="text-4xl lg:text-5xl text-[#051125] leading-tight" style={{fontFamily:"'Newsreader',serif"}}>
            Compiling Your<br/><span className="italic text-[#47607e]">Reputation Intelligence</span>
          </h2>
          <p className="text-base text-[#44474c] leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>
            Our AI is currently auditing 10,000,000+ data points across Google, global media, and LLMs. This process typically takes 3 minutes.<br/>Sessions are anonymous and encrypted. We cannot access or download your reports. Please keep this page open until the report loads.
          </p>
        </div>

        {/* Two-column layout: 7/5 split */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-start">
          {/* Left Side: Progress Tracks */}
          <div className="lg:col-span-7 space-y-6">
            {/* Time remaining */}
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#74777d] text-sm">schedule</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>
                Estimated time remaining: <span className="text-[#051125]">{timeStr}</span>
              </span>
            </div>

            {/* Track items */}
            {LOADING_TRACKS.map((track, i) => {
              const pct = Math.round(trackProgress[i]);
              const isPending = i > activeTrack;
              return (
                <div key={track.key} className={`space-y-2 ${isPending ? "opacity-40" : ""}`}>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#051125]" style={{fontFamily:"'Manrope',sans-serif"}}>{track.label}</span>
                    <span className="text-[10px] text-[#47607e]" style={{fontFamily:"'Public Sans',sans-serif"}}>
                      {isPending ? <span className="italic">Pending</span> : `${pct}%`}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-[#edeeea] overflow-hidden rounded-full">
                    {!isPending && (
                      <div className="h-full bg-[#1b263b] transition-all duration-1000" style={{width:`${pct}%`}}></div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <p className="text-[11px] text-[#74777d] italic text-center" style={{fontFamily:"'Manrope',sans-serif"}}>Securing your digital legacy. Your comprehensive report will be ready momentarily.</p>
            </div>
          </div>

          {/* Right Side: Live Audit Stream */}
          <aside className="lg:col-span-5 bg-[#f3f4f0] p-6 rounded-xl border border-[#c4c6cc]/30 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#c4c6cc]/50 pb-3">
              <span className="material-symbols-outlined text-[#002c24] text-lg" style={{fontVariationSettings:'"FILL" 1'}}>analytics</span>
              <h3 className="font-bold text-[10px] tracking-widest uppercase" style={{fontFamily:"'Public Sans',sans-serif"}}>Live Audit Stream</h3>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {auditLog.map((entry, i) => {
                const isLast = i === auditLog.length - 1;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${isLast ? "bg-[#47607e]" : "bg-[#001510]"}`}></div>
                      <div className="w-px h-full bg-[#c4c6cc]/50 my-1"></div>
                    </div>
                    <div>
                      <p className={`text-[11px] text-[#44474c] leading-tight ${isLast ? "italic" : ""} ${i === auditLog.length - 2 ? "font-semibold" : ""}`} style={{fontFamily:"'Manrope',sans-serif"}}>{entry.message}</p>
                      <span className="text-[9px] text-[#74777d]" style={{fontFamily:"'Public Sans',sans-serif"}}>TIMESTAMP: {entry.elapsed}</span>
                      {isLast && (
                        <div className="mt-1 h-1 w-16 bg-[#edeeea] overflow-hidden rounded-full">
                          <div className="h-full bg-[#47607e] shimmer w-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Spinner with pulse ring */}
            <div className="pt-4 border-t border-[#c4c6cc]/30 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 border border-[#1b263b]/10 rounded-full pulse-ring"></div>
                <div className="w-8 h-8 rounded-full border border-t-[#051125] border-r-[#1b263b] border-b-[#47607e] border-l-[#e2e3df] animate-spin"></div>
              </div>
              <p className="mt-3 text-[8px] uppercase tracking-[0.2em] text-[#c4c6cc]" style={{fontFamily:"'Manrope',sans-serif"}}>System Intensive Process</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ── Score gauge ─────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 90 ? "#22c55e" : score >= 70 ? "#84cc16" : score >= 50 ? "#eab308" : score >= 30 ? "#f97316" : "#ef4444";
  const label =
    score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : score >= 30 ? "Poor" : "Critical";

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#e8e8e4" strokeWidth="14" />
        <circle
          cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="14"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          transform="rotate(-90 100 100)" style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
        <text x="100" y="90" textAnchor="middle" fontSize="44" fontWeight="700" fill={color}>{score}</text>
        <text x="100" y="116" textAnchor="middle" fontSize="14" fill="#74777d">/ 100</text>
      </svg>
      <span className="mt-1 text-lg font-semibold" style={{ color, fontFamily:"'Newsreader',serif" }}>{label}</span>
    </div>
  );
}

// ── Sentiment mini chart ────────────────────────────────────────────
function SentimentChart({ breakdown }: { breakdown: { positive: number; neutral: number; negative: number } }) {
  const total = breakdown.positive + breakdown.neutral + breakdown.negative || 1;
  const pPct = Math.round((breakdown.positive / total) * 100);
  const nPct = Math.round((breakdown.neutral / total) * 100);
  const negPct = Math.round((breakdown.negative / total) * 100);

  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-4 mb-2">
        {pPct > 0 && <div className="bg-green-500" style={{ width: `${pPct}%` }} />}
        {nPct > 0 && <div className="bg-[#c4c6cc]" style={{ width: `${nPct}%` }} />}
        {negPct > 0 && <div className="bg-red-500" style={{ width: `${negPct}%` }} />}
      </div>
      <div className="flex justify-between text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Positive ({breakdown.positive})</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#c4c6cc]" /> Neutral ({breakdown.neutral})</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Negative ({breakdown.negative})</span>
      </div>
    </div>
  );
}

// ── Category bar ────────────────────────────────────────────────────
function CategoryBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  const color = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-lime-500" : pct >= 40 ? "bg-yellow-400" : pct >= 20 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>{label}</span>
        <span className="font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>{value}/{max}</span>
      </div>
      <div className="h-2.5 bg-[#e8e8e4] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%`, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

// ── Badges ──────────────────────────────────────────────────────────
function SeverityBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-600",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${styles[level] || styles.low}`} style={{fontFamily:"'Manrope',sans-serif"}}>{level}</span>;
}

function SentimentDot({ sentiment }: { sentiment: string }) {
  const color = sentiment === "positive" ? "bg-green-500" : sentiment === "negative" ? "bg-red-500" : "bg-[#c4c6cc]";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />;
}

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    low: "bg-green-100 text-green-700 border-green-200",
    moderate: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    critical: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${styles[level] || styles.moderate}`} style={{fontFamily:"'Manrope',sans-serif"}}>
      {level} risk
    </span>
  );
}

function CategoryTag({ cat }: { cat: string }) {
  const labels: Record<string, string> = {
    organic: "Organic", news: "News", review: "Review", social: "Social", complaint: "Complaint", legal: "Legal",
  };
  const colors: Record<string, string> = {
    organic: "bg-[#edeeea] text-[#44474c]", news: "bg-purple-100 text-purple-600", review: "bg-indigo-100 text-indigo-600",
    social: "bg-sky-100 text-sky-600", complaint: "bg-red-100 text-red-600", legal: "bg-orange-100 text-orange-600",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[cat] || colors.organic}`} style={{fontFamily:"'Manrope',sans-serif"}}>{labels[cat] || cat}</span>;
}

// ── Bullet point text helper ────────────────────────────────────────
function BulletText({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
  if (sentences.length <= 1) {
    return <p className={className} style={{fontFamily:"'Manrope',sans-serif"}}>{text}</p>;
  }
  return (
    <ul className={`space-y-1.5 ${className}`} style={{fontFamily:"'Manrope',sans-serif"}}>
      {sentences.map((s, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-[#1B263B]/40 shrink-0 mt-0.5">&#8226;</span>
          <span>{s}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Card wrapper ────────────────────────────────────────────────────
function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-[#c4c6cc]/15 p-6 ${className}`}>
      {title && <h3 className="font-semibold mb-4 text-[#1a1c1a]" style={{ fontSize: "1.15rem", fontFamily:"'Newsreader',serif" }}>{title}</h3>}
      {children}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────
export default function Home() {
  const [name, setName] = useState("");
  const [type, setType] = useState<"person" | "company">("company");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "revenue" | "ai-llm" | "influencers" | "reviews" | "backlinks" | "crisis" | "suspicious" | "results" | "problems" | "strengths">("overview");
  const [contactModal, setContactModal] = useState<{ open: boolean; packageName: string }>({ open: false, packageName: "" });
  const [contactForm, setContactForm] = useState({ name: "", email: "" });
  const [contactSent, setContactSent] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [disambiguation, setDisambiguation] = useState<{ name: string; options: { industry: string; label: string }[]; message: string } | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [redirectingToCheckout, setRedirectingToCheckout] = useState(false);
  const [stripeSessionId, setStripeSessionId] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // On mount: check if returning from Stripe payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid = params.get("paid");
    const sessionId = params.get("session_id");
    if (paid === "true" && sessionId) {
      // Clean URL
      window.history.replaceState({}, "", "/");
      // Verify payment and auto-run scan
      (async () => {
        try {
          const res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId }),
          });
          const data = await res.json();
          if (data.paid) {
            setPaymentVerified(true);
            setStripeSessionId(sessionId);
            setName(data.name);
            setType(data.type || "person");
            if (data.domain) setDomain(data.domain);
            if (data.customerEmail) setCustomerEmail(data.customerEmail);
            // Run the scan with the verified session ID
            runCheck(data.name, data.type || "person", undefined, data.domain || "", sessionId);
          } else {
            setError("Payment could not be verified. Please try again.");
          }
        } catch {
          setError("Payment verification failed. Please contact support.");
        }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runCheck(checkName: string, checkType: string, industry?: string, overrideDomain?: string, sessionOverride?: string) {
    setLoading(true);
    setError("");
    setReport(null);
    setDisambiguation(null);
    try {
      const payload: Record<string, string> = { name: checkName, type: checkType };
      if (industry) payload.industry = industry;
      const domainVal = overrideDomain !== undefined ? overrideDomain : domain.trim();
      if (domainVal) payload.domain = domainVal;
      // Pass Stripe session ID for server-side payment verification
      const sid = sessionOverride || stripeSessionId;
      if (sid) payload.stripe_session_id = sid;
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      // Check if API returned disambiguation options
      if (data.disambiguation) {
        setLoading(false);
        setDisambiguation({ name: data.name, options: data.options, message: data.message });
        return;
      }

      setReport(data);
      setActiveTab("overview");
      window.scrollTo({ top: 0 });

      // Auto-email the PDF report to the customer (fire and forget)
      if (customerEmail) {
        fetch("/api/send-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: customerEmail, report: data }),
        }).catch(() => { /* silent — email is a bonus, not critical */ });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setRedirectingToCheckout(true);
    setError("");
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type, domain: domain.trim() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Could not create checkout session");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment initiation failed.");
      setRedirectingToCheckout(false);
    }
  }

  function handleDisambiguationSelect(industry: string) {
    if (!disambiguation) return;
    runCheck(disambiguation.name, type, industry);
  }

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { key: "revenue" as const, label: "Revenue Impact", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { key: "ai-llm" as const, label: "AI / LLM", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { key: "influencers" as const, label: "Influencers", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    ...(report?.entityType === "company" ? [{ key: "reviews" as const, label: "Reviews", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" }] : []),
    { key: "backlinks" as const, label: "Backlinks", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
    { key: "crisis" as const, label: "Risk & Crisis", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" },
    { key: "suspicious" as const, label: "Suspicious", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
    { key: "results" as const, label: "SERP Results", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { key: "problems" as const, label: "Problems", icon: "M20 12H4 M12 4v16", count: report?.problems?.length },
    { key: "strengths" as const, label: "Strengths", icon: "M5 13l4 4L19 7", count: report?.strengths?.length },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f9faf5]">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-[#c4c6cc]/10 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1B263B] text-2xl" style={{fontVariationSettings:'"FILL" 1'}}>shield_person</span>
            <span className="font-sans text-lg font-black tracking-tighter text-[#1B263B]">REP500</span>
          </div>
        </div>
      </nav>

      {/* Homepage */}
      {!report && !loading && !disambiguation && (
        <main className="pb-24 overflow-x-hidden pt-32" style={{paddingTop:'calc(8rem - 15px)'}}>
          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24 text-center">
            <div className="max-w-3xl mx-auto mb-16 pt-[10px]">
              <h1 className="text-[#1B263B] text-xs uppercase tracking-[0.2em] mb-4 font-normal" style={{fontFamily:"'Manrope',sans-serif"}}>Online Reputation Audit</h1>
              <h1 className="text-5xl md:text-7xl tracking-tight text-[#1B263B] leading-tight mb-6" style={{fontFamily:"'Newsreader',serif"}}>Comprehensive Online <br/><span className="italic font-light">Reputation Analysis</span></h1>
              <p className="text-xl md:text-2xl text-[#44474c] font-light tracking-wide" style={{fontFamily:"'Manrope',sans-serif"}}>Understand how a person or company is perceived across Google, AI platforms, media, and social channels, and get clear, actionable recommendations to improve it, in just 3 minutes.</p>
            </div>

            {/* Analyzing badge */}
            <div className="mb-8 text-center animate-pulse">
              <p className="text-emerald-700 text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2" style={{fontFamily:"'Manrope',sans-serif"}}>
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                <span className="text-xs tracking-[0.15em]">Analyzing 10+ million touchpoints</span>
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
              </p>
            </div>

            {/* Search bar - pill-shaped */}
            <form onSubmit={handleSubmit}>
              <div id="search-bar" className="max-w-4xl mx-auto relative">
                <div className="bg-white p-2 rounded-full shadow-[0_20px_40px_rgba(26,28,26,0.05)] border border-[#101b30] flex flex-col md:flex-row items-center gap-2">
                  {/* Toggle */}
                  <div className="bg-[#e8e8e4] p-1 rounded-full flex gap-1 ml-2">
                    <button type="button" onClick={() => setType("person")}
                      className={`px-4 md:px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors ${type === "person" ? "bg-[#1B263B] text-white" : "text-[#44474c] hover:bg-[#e2e3df]/50"}`} style={{fontFamily:"'Manrope',sans-serif"}}>
                      Person
                    </button>
                    <button type="button" onClick={() => setType("company")}
                      className={`px-4 md:px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors ${type === "company" ? "bg-[#1B263B] text-white" : "text-[#44474c] hover:bg-[#e2e3df]/50"}`} style={{fontFamily:"'Manrope',sans-serif"}}>
                      Company
                    </button>
                  </div>
                  {/* Input */}
                  <div className="flex-grow flex items-center px-6 gap-3">
                    <span className="material-symbols-outlined text-[#74777d]">search</span>
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder:text-[#c4c6cc] py-4 outline-none"
                      style={{fontFamily:"'Manrope',sans-serif"}}
                      placeholder={type === "person" ? "Enter a person's name" : "Enter a company name"} type="text" />
                  </div>
                  {/* Action Button */}
                  <button type="submit" disabled={redirectingToCheckout}
                    className={`w-full md:w-auto px-10 py-4 rounded-full text-white font-bold text-lg tracking-tight hover:shadow-lg transition-all active:scale-95 duration-150 bg-gradient-to-r from-[#101b30] to-[#3c475d] ${redirectingToCheckout ? "opacity-70 cursor-not-allowed" : ""}`} style={{fontFamily:"'Manrope',sans-serif"}}>
                    {redirectingToCheckout ? "Redirecting to payment..." : "Analyze ($34.99)"}
                  </button>
                </div>

                {/* Optional domain input for companies */}
                {type === "company" && (
                  <div className="mt-4 max-w-xl mx-auto">
                    <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)}
                      placeholder="Company domain (optional, e.g. acmecorp.com)"
                      className="w-full h-12 pl-5 pr-5 rounded-full border border-[#101b30] focus:outline-none focus:ring-2 focus:ring-[#1B263B]/20 bg-white text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif",fontSize:'0.9rem'}} />
                  </div>
                )}

                {error && <p className="text-[#ba1a1a] mt-3 text-sm" style={{fontFamily:"'Manrope',sans-serif"}}>{error}</p>}

                <div className="mt-6 flex flex-wrap justify-center gap-4 md:gap-8 text-[#74777d] text-[9px] md:text-xs uppercase tracking-widest font-bold" style={{fontFamily:"'Manrope',sans-serif"}}>
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings:'"FILL" 1'}}>verified_user</span> Proprietary Algorithm</span>
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings:'"FILL" 1'}}>lock</span>Encrypted</span>
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings:'"FILL" 1'}}>visibility_off</span> Anonymous</span>
                </div>
              </div>
            </form>
          </section>

          {/* Report Features Section */}
          <section className="max-w-4xl mx-auto px-6 md:px-12 mb-32" style={{paddingTop:'45px'}}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl tracking-tight text-[#1B263B] leading-tight mb-4" style={{fontFamily:"'Newsreader',serif"}}>Get a full reputation risk & revenue impact analysis in <span className="italic font-light">3 minutes</span></h2>
            </div>

            {/* How It Works — 4-step tabbed section */}
            {(() => {
              const howSteps = [
                { num: "01", title: "Deep Data Collection", icon: "database", desc: "Our proprietary algorithm scans over 120 live data sources simultaneously — Google SERPs, AI engines, news archives, social platforms, review sites, forums, complaint databases, and dark web signals — collecting over 10,000 unique data points per analysis." },
                { num: "02", title: "Sentiment & Risk Processing", icon: "psychology", desc: "Advanced natural language processing classifies every mention across a multi-dimensional sentiment matrix. Our model, trained on over 10,000,000 reputation data points, identifies risk patterns, crisis signals, and hidden vulnerabilities invisible to standard monitoring." },
                { num: "03", title: "Revenue Impact Modelling", icon: "trending_up", desc: "Proprietary econometric models correlate reputation signals with conversion impact. Each finding is mapped to estimated revenue exposure — giving executives a clear financial picture of what their online perception is costing them." },
                { num: "04", title: "Intelligence Report Generation", icon: "description", desc: "All findings are synthesised into a consultancy-grade intelligence report with scored recommendations, priority actions, and strategic insights — delivered in under 3 minutes." },
              ];
              return (
                <div className="mb-24">
                  <div className="text-center mb-10">
                    <p className="text-[#44474c] text-[10px] font-bold tracking-[0.2em] uppercase mb-3" style={{fontFamily:"'Manrope',sans-serif"}}>How it works</p>
                    <p className="text-[#74777d] text-sm max-w-2xl mx-auto" style={{fontFamily:"'Manrope',sans-serif"}}>Powered by a proprietary algorithm trained on over 10,000,000 reputation data points</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {howSteps.map((step) => (
                      <div key={step.num} className="relative bg-white rounded-xl p-6 border border-[#e8e8e4] hover:border-[#1B263B]/20 hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-[#1B263B] text-2xl font-black opacity-20 group-hover:opacity-40 transition-opacity" style={{fontFamily:"'Newsreader',serif"}}>{step.num}</span>
                          <div className="w-8 h-8 rounded-lg bg-[#1B263B]/5 flex items-center justify-center group-hover:bg-[#1B263B] group-hover:text-white transition-colors duration-300">
                            <span className="material-symbols-outlined text-lg">{step.icon}</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-[#1B263B] text-[15px] mb-2" style={{fontFamily:"'Newsreader',serif"}}>{step.title}</h4>
                        <p className="text-[#74777d] text-[13px] leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="text-center mb-16">
              <p className="text-[#44474c] text-xs font-bold tracking-widest uppercase" style={{fontFamily:"'Manrope',sans-serif"}}>Each report includes:</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-16">
              {[
                { icon: "analytics", title: "Reputation score & risk level", desc: "Understand your overall exposure and where you stand against industry benchmarks." },
                { icon: "search_insights", title: "Search & media analysis", desc: "Real-time audit of what appears on Google search, news sites, and primary media nodes." },
                { icon: "forum", title: "Sentiment breakdown", desc: "Granular analysis of what people are saying across reviews, forums, and social media channels." },
                { icon: "warning", title: "Key risks identified", desc: "Critical identification of specific issues and vulnerabilities that could impact trust or conversions." },
                { icon: "assignment_turned_in", title: "Clear recommendations", desc: "Actionable intelligence on exactly what to fix, where to focus resources, and why it matters." },
                { icon: "payments", title: "Revenue at Risk Analysis", desc: "Quantify how much revenue your current reputation is potentially costing you and how to optimize it." },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left group">
                  <div className="w-12 h-12 rounded-lg bg-[#f3f4f0] flex items-center justify-center mb-6 border border-[#c4c6cc]/10 group-hover:bg-[#1B263B] group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="font-bold text-[#1B263B] mb-3 text-[22px]" style={{fontFamily:"'Newsreader',serif"}}>{item.title}</h3>
                  <p className="text-[#44474c] leading-relaxed text-[16px]" style={{fontFamily:"'Manrope',sans-serif"}}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── SAMPLE REPORT SECTION ── */}
          <div className="max-w-7xl mx-auto px-4 md:px-8 mb-20">
            <div className="relative flex items-center py-5">
              <div className="flex-grow border-t-2 border-[#1B263B]"></div>
              <span className="flex-shrink mx-4 font-bold text-[#1B263B] uppercase tracking-[0.3em] text-xl md:text-2xl" style={{fontFamily:"'Newsreader',serif"}}>Sample Report</span>
              <div className="flex-grow border-t-2 border-[#1B263B]"></div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-12 mb-20 text-center">
            <div className="bg-white border border-[#c4c6cc]/10 shadow-sm rounded-xl py-6 md:py-10 px-4 md:px-16">
              <p className="text-[#1B263B]/80 leading-relaxed font-medium tracking-normal" style={{fontFamily:"'Public Sans',sans-serif",fontSize:'1.5rem',lineHeight:'2rem'}}>This report represents just 12% of the full output, offering only a glimpse of the depth and detail included in the complete report.</p>
            </div>
          </div>

          {/* Sample Tab Navigation */}
          <section className="max-w-7xl mx-auto mb-16">
            <div className="border-b border-[#c4c6cc]/20">
              <div className="flex flex-col items-center gap-4 md:gap-8 pb-6">
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { icon: "home", label: "Overview", active: true },
                    { icon: "desktop_windows", label: "AI / LLM", active: false },
                    { icon: "groups", label: "Influencers", active: false },
                    { icon: "star", label: "Reviews", active: false },
                    { icon: "link", label: "Backlinks", active: false },
                    { icon: "warning", label: "Risk & Crisis", active: false },
                    { icon: "visibility", label: "Suspicious", active: false },
                    { icon: "search", label: "SERP Results", active: false },
                  ].map((tab, i) => (
                    <button key={i} className={`flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 rounded-t-lg text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${tab.active ? "bg-[#1B263B] text-white border-[#D4AF37]" : "text-[#1B263B] border-transparent hover:bg-[#e8e8e4]"}`} style={{fontFamily:"'Public Sans',sans-serif"}}>
                      <span className="material-symbols-outlined text-[18px]" style={tab.active ? {fontVariationSettings:'"FILL" 1'} : {}}>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                  <button className="flex items-center gap-3 px-4 py-2 rounded border border-[#ba1a1a]/30 text-[#ba1a1a] text-[11px] font-bold uppercase tracking-widest hover:bg-[#ba1a1a]/5 transition-colors" style={{fontFamily:"'Public Sans',sans-serif"}}>
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    Critical Vulnerabilities
                    <span className="bg-[#ba1a1a] text-white px-2 py-0.5 rounded text-[10px]">3</span>
                  </button>
                  <button className="flex items-center gap-3 px-4 py-2 rounded border border-emerald-600/30 text-emerald-700 text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-50 transition-colors" style={{fontFamily:"'Public Sans',sans-serif"}}>
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Strategic Assets
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px]">3</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Sample Report Cards Grid */}
          <section className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Executive Brief */}
              <div className="md:col-span-12 bg-[#101b30] text-white rounded-xl p-6 md:p-10 border border-[#c4c6cc]/10 shadow-xl mb-6">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#79849d]/60 mb-8" style={{fontFamily:"'Public Sans',sans-serif"}}>Executive Brief</h2>
                <div className="space-y-8" style={{fontFamily:"'Public Sans',sans-serif"}}>
                  <div className="flex gap-6">
                    <div className="w-0.5 h-auto bg-emerald-500 rounded-full flex-shrink-0"></div>
                    <p className="text-lg leading-relaxed text-[#79849d] font-light">Plus500 Trading maintains strong search engine dominance with excellent domain control and positioning as the UK&apos;s #1 CFD broker, supported by active US market expansion and transparency-focused marketing campaigns.</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-0.5 h-auto bg-amber-400 rounded-full flex-shrink-0"></div>
                    <p className="text-lg leading-relaxed text-[#79849d] font-light">However, the company faces moderate reputation risks from negative Reddit discussions and allegations about trading practices, combined with Google&apos;s prominent CFD risk warnings that could deter potential customers.</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-0.5 h-auto bg-red-400 rounded-full flex-shrink-0"></div>
                    <p className="text-lg leading-relaxed text-[#79849d] font-light">The biggest vulnerability is limited social media presence on professional platforms like LinkedIn and Twitter, creating gaps for competitor attacks and reducing crisis response capabilities.</p>
                  </div>
                </div>
              </div>

              {/* Digital Footprint + Risk Score */}
              <div className="md:col-span-8 bg-[#f3f4f0] rounded-xl p-6 md:p-10 flex flex-col justify-between min-h-[400px] border border-[#c4c6cc]/5">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-10 shadow-sm">
                    <span className="material-symbols-outlined text-[#1B263B] text-3xl">hub</span>
                  </div>
                  <h3 className="text-3xl mb-4" style={{fontFamily:"'Newsreader',serif"}}>Digital Footprint Analysis</h3>
                  <p className="text-[#44474c] leading-relaxed max-w-md" style={{fontFamily:"'Manrope',sans-serif"}}>Comprehensive audit of global search results, social media presence, magazines, news sites and domain ownership.</p>
                </div>
                <div className="mt-12">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#74777d] mb-2" style={{fontFamily:"'Manrope',sans-serif"}}>Social Reach</span>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold">LinkedIn</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold">Instagram</span>
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold">Twitter/X Missing</span>
                      </div>
                    </div>
                    <div className="h-10 w-px bg-[#c4c6cc]/30"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#74777d] mb-2" style={{fontFamily:"'Manrope',sans-serif"}}>Domains</span>
                      <span className="text-xs font-medium text-[#ba1a1a] flex items-center gap-1" style={{fontFamily:"'Manrope',sans-serif"}}>
                        <span className="material-symbols-outlined text-xs">error</span>technical error in &apos;reg&apos; subdomain
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 bg-[#101b30] text-white rounded-xl p-6 md:p-10 flex flex-col justify-between min-h-[400px] shadow-xl">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-[#c2dcff] text-4xl" style={{fontVariationSettings:'"FILL" 1'}}>shield_with_heart</span>
                  <span className="bg-[#c2dcff]/20 text-[#c2dcff] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Proprietary Score</span>
                </div>
                <div>
                  <h3 className="text-3xl mb-4 text-white" style={{fontFamily:"'Newsreader',serif"}}>Reputation Risk Score</h3>
                  <p className="text-[#79849d] leading-relaxed text-sm mb-6" style={{fontFamily:"'Manrope',sans-serif"}}>Our algorithm calculates a 0-100 health score compared against industry benchmarks.</p>
                </div>
                <div className="pt-8 border-t border-[#79849d]/20">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end"><span className="text-xs text-[#79849d] uppercase tracking-widest" style={{fontFamily:"'Manrope',sans-serif"}}>Market Leaders</span><span className="text-sm font-bold">90/100</span></div>
                    <div className="w-full bg-[#79849d]/20 h-1 rounded-full"><div className="bg-green-400 h-full w-[90%]"></div></div>
                    <div className="flex justify-between items-end"><span className="text-xs text-[#79849d] uppercase tracking-widest" style={{fontFamily:"'Manrope',sans-serif"}}>Industry Average</span><span className="text-sm font-bold">65/100</span></div>
                    <div className="w-full bg-[#79849d]/20 h-1 rounded-full"><div className="bg-yellow-400 h-full w-[65%]"></div></div>
                  </div>
                </div>
              </div>

              {/* Score Breakdown + Video Sentiment */}
              <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-xl p-6 md:p-10 border border-[#c4c6cc]/15 flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[#1B263B]">bar_chart_4_bars</span>
                    <h3 className="text-2xl font-bold" style={{fontFamily:"'Newsreader',serif"}}>Score Breakdown</h3>
                  </div>
                  <div className="space-y-6">
                    {[
                      { label: "Search Results Sentiment", score: "22/25", pct: 88 },
                      { label: "News Sentiment", score: "12/15", pct: 80 },
                      { label: "Review Ratings", score: "8/10", pct: 80 },
                      { label: "AI / LLM Appearance", score: "6/10", pct: 60 },
                      { label: "Autocomplete Safety", score: "7/10", pct: 70 },
                      { label: "Social Media Presence", score: "4/10", pct: 40 },
                      { label: "Complaint Sites", score: "10/10", pct: 100 },
                      { label: "Content Control", score: "5/5", pct: 100 },
                      { label: "Domain Ownership", score: "5/5", pct: 100 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>{item.label}</span>
                          <span className="text-xs font-bold text-[#1B263B]" style={{fontFamily:"'Manrope',sans-serif"}}>{item.score}</span>
                        </div>
                        <div className="w-full bg-[#e8e8e4] h-2 rounded-full">
                          <div className={`h-full rounded-full ${item.pct >= 80 ? "bg-green-500" : item.pct >= 60 ? "bg-[#FFC107]" : "bg-[#FFC107]"}`} style={{width:`${item.pct}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 md:p-10 border border-[#c4c6cc]/15 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#1B263B]">video_library</span>
                      <h3 className="text-2xl font-bold" style={{fontFamily:"'Newsreader',serif"}}>Video Sentiment</h3>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold tracking-widest uppercase">Mixed</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { title: "COMPLETE Plus 500 Tutorial - How To Use Plus500...", views: "225,763", channel: "Marcus Reviews", sentiment: "positive", summary: "Educational tutorial showing platform functionality with positive tone" },
                      { title: "Plus500 scam.", views: "74,632", channel: "Anonymous", sentiment: "negative", summary: "Video explicitly labeling Plus500 as a scam with significant viewership" },
                      { title: "How to trade with Plus500 | Trader's Guide...", views: "364,751", channel: "Plus500", sentiment: "positive", summary: "Official Plus500 tutorial showing platform features", owned: true },
                    ].map((v, i) => (
                      <div key={i} className={`p-4 rounded-lg border ${v.sentiment === "positive" ? "bg-green-50/50 border-green-100" : "bg-red-50/50 border-red-100"}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 pr-4">
                            <h4 className="text-sm font-bold text-[#1B263B] leading-tight" style={{fontFamily:"'Manrope',sans-serif"}}>{v.title}</h4>
                            <span className="text-[10px] font-bold text-[#74777d] uppercase">{v.views} Views</span>
                          </div>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#c4c6cc] text-[#44474c] text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-white transition-all" style={{fontFamily:"'Manrope',sans-serif"}}>
                            Check Video <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                          </button>
                        </div>
                        <p className="text-xs text-[#44474c] italic mb-2" style={{fontFamily:"'Manrope',sans-serif"}}>by {v.channel}</p>
                        <p className="text-xs text-[#44474c] leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>{v.summary}</p>
                        {v.owned && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="px-1.5 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded uppercase">Owned</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI & LLM Appearance */}
              <div className="md:col-span-12 bg-[#f3f4f0] rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 border border-[#c4c6cc]/15 mt-6">
                <div className="md:w-1/2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#1B263B] flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-xl">psychology</span>
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>What AI machines are Citing you for</span>
                  </div>
                  <h3 className="text-3xl mb-4" style={{fontFamily:"'Newsreader',serif"}}>AI &amp; LLM Appearance</h3>
                  <p className="text-[#44474c] leading-relaxed mb-6" style={{fontFamily:"'Manrope',sans-serif"}}>Understand how AI platforms (GPT-4, Claude, and Gemini) perceive your brand. AI visibility is now the primary discovery layer for 67% of searches.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-[#c4c6cc]/10"><span className="text-[10px] font-bold uppercase tracking-widest text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>Visibility Score</span><div className="text-2xl mt-1" style={{fontFamily:"'Newsreader',serif"}}>6 / 10</div></div>
                    <div className="bg-white p-4 rounded-lg border border-[#c4c6cc]/10"><span className="text-[10px] font-bold uppercase tracking-widest text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>Context Rating</span><div className="text-2xl mt-1 text-[#48617e]" style={{fontFamily:"'Newsreader',serif"}}>Neutral</div></div>
                  </div>
                </div>
                <div className="md:w-1/2 w-full flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm uppercase tracking-wider text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}><span>Training Data Saturation</span><span>45%</span></div>
                    <div className="w-full bg-[#e8e8e4] h-2 rounded-full overflow-hidden"><div className="bg-[#1B263B] h-full w-[45%]"></div></div>
                    <div className="flex justify-between items-center text-sm uppercase tracking-wider text-[#74777d] mt-6" style={{fontFamily:"'Manrope',sans-serif"}}><span>Reference Accuracy</span><span>82%</span></div>
                    <div className="w-full bg-[#e8e8e4] h-2 rounded-full overflow-hidden"><div className="bg-[#1B263B] h-full w-[82%]"></div></div>
                  </div>
                </div>
              </div>

              {/* Crisis + Recommendations side by side */}
              <div className="md:col-span-6 bg-white rounded-xl p-6 md:p-10 flex flex-col border border-[#ba1a1a]/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1 bg-[#ba1a1a] text-white text-[10px] font-bold tracking-[0.2em] uppercase">Critical Alert</div>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-full bg-[#ba1a1a]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-xl" style={{fontVariationSettings:'"FILL" 1'}}>warning</span>
                  </div>
                  <span className="text-xs font-bold tracking-widest uppercase text-[#ba1a1a]" style={{fontFamily:"'Manrope',sans-serif"}}>Potential Crisis Detected</span>
                </div>
                <h3 className="text-2xl mb-4" style={{fontFamily:"'Newsreader',serif"}}>Sentiment Instability</h3>
                <p className="text-[#44474c] leading-relaxed mb-8" style={{fontFamily:"'Manrope',sans-serif"}}>Recent negative events have significantly impacted sentiment stability. Direct scam accusations and price manipulation allegations require immediate intervention.</p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border-l-2 border-[#ba1a1a]">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-sm">report</span>
                    <p className="text-xs font-medium text-[#ba1a1a]" style={{fontFamily:"'Manrope',sans-serif"}}>&quot;XYZ is a scam&quot; – Direct deposit accusations</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border-l-2 border-[#ba1a1a]">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-sm">report</span>
                    <p className="text-xs font-medium text-[#ba1a1a]" style={{fontFamily:"'Manrope',sans-serif"}}>&quot;Price Manipulation&quot; – Allegations of client pattern monitoring</p>
                  </div>
                </div>
                <div className="mt-auto p-5 bg-[#ba1a1a] text-white rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="italic text-lg" style={{fontFamily:"'Newsreader',serif"}}>Current Status: VOLATILE</span>
                    <div className="flex items-center text-xs font-bold gap-1 uppercase tracking-tighter"><span className="material-symbols-outlined text-sm">error</span> Urgent Action Required</div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-6 bg-white rounded-xl p-6 md:p-10 flex flex-col border border-[#c4c6cc]/15 shadow-sm">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-full bg-[#f3f4f0] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#1B263B] text-xl">assignment_turned_in</span>
                  </div>
                  <span className="text-xs font-bold tracking-widest uppercase text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>High-Priority Directives</span>
                </div>
                <h3 className="text-2xl mb-4" style={{fontFamily:"'Newsreader',serif"}}>Strategic Recommendations</h3>
                <p className="text-[#44474c] leading-relaxed mb-6" style={{fontFamily:"'Manrope',sans-serif"}}>Mitigating the current surge in negative sentiment requires a multi-pronged tactical response to restore institutional trust.</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-red-50/50 rounded-lg border border-red-100">
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">URGENT</span>
                    <div><p className="text-sm font-bold text-[#1a1c1a] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>Reddit Monitoring &amp; Response Strategy</p><p className="text-xs text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>Address scam accusations directly to curb viral spread.</p></div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-red-50/50 rounded-lg border border-red-100">
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">URGENT</span>
                    <div><p className="text-sm font-bold text-[#1a1c1a] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>Verify and Resolve Inactive Domain Issues</p><p className="text-xs text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>Main domain accessibility is critical for brand credibility.</p></div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-[#f3f4f0] rounded-lg">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">MED</span>
                    <div><p className="text-sm font-bold text-[#1a1c1a] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>Establish Multi-Platform Content Control</p><p className="text-xs text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>Activate primary social handles to push authoritative counter-narratives.</p></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Who is it for Section */}
          <section className="mt-32 max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl tracking-tight text-[#1B263B] leading-tight mb-4" style={{fontFamily:"'Newsreader',serif"}}>Who is it <span className="italic font-light">for:</span></h2>
              <div className="w-12 h-1 bg-[#1B263B]/10 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {[
                { icon: "rocket_launch", title: "Founders & startups", desc: "Validate and safeguard how your company looks before customers or investors do." },
                { icon: "handshake", title: "Agencies & consultants", desc: "Run fast reputation audits for clients or prospects and close more sales." },
                { icon: "business", title: "Finance and trading businesses", desc: "Identify risks affecting trust and conversions early on and protect your brand." },
                { icon: "campaign", title: "Marketers", desc: "Get a comprehensive analysis of your brand or spy on your competitors." },
                { icon: "badge", title: "C-suite executives", desc: "Get a clear overview of your reputation and identify where your team should focus." },
                { icon: "diamond", title: "High ticket industries", desc: "Identify and resolve potential reputation issues quickly, before they cost you a sale." },
              ].map((item, i) => (
                <div key={i} className="bg-[#f3f4f0] p-4 md:p-8 rounded-xl border border-[#c4c6cc]/10 flex flex-col hover:border-[#1B263B]/20 transition-all group">
                  <div className="w-10 h-10 rounded bg-[#1B263B]/5 flex items-center justify-center mb-6 group-hover:bg-[#1B263B] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <h3 className="font-bold text-xl text-[#1B263B] mb-3" style={{fontFamily:"'Newsreader',serif"}}>{item.title}</h3>
                  <p className="text-[#44474c] leading-relaxed text-sm" style={{fontFamily:"'Manrope',sans-serif"}}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="mt-32 max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 bg-[#edeeea] text-center rounded-2xl border border-[#c4c6cc]/10">
            <h2 className="text-2xl md:text-4xl italic mb-6" style={{fontFamily:"'Newsreader',serif"}}>Secure your digital reputation<br/>or spy on your competitors&apos; strategies</h2>
            <p className="text-[#44474c] mb-10 max-w-xl mx-auto" style={{fontFamily:"'Manrope',sans-serif"}}>
              Join the executive suites of the Fortune 500 who rely on Rep500&apos;s Online Reputation Audit for their daily reputation briefings.
            </p>
            <button onClick={() => document.getElementById('search-bar')?.scrollIntoView({behavior:'smooth',block:'center'})} className="px-8 py-4 rounded-full bg-[#1B263B] text-white font-bold hover:bg-slate-800 transition-all shadow-lg" style={{fontFamily:"'Manrope',sans-serif"}}>Start Intelligence Scan</button>
          </section>
        </main>
      )}

      {/* Disambiguation */}
      {disambiguation && !loading && !report && (
        <main className="max-w-7xl mx-auto px-4 md:px-8 flex-1 w-full pt-24">
          <div className="max-w-lg mx-auto" style={{ paddingTop: "20px" }}>
            <button onClick={() => { setDisambiguation(null); }}
              className="mb-4 text-sm text-[#1B263B] hover:underline flex items-center gap-1" style={{fontFamily:"'Manrope',sans-serif"}}>&larr; Back to search</button>
            <div className="bg-white rounded-2xl border border-[#1B263B]/20 shadow-sm p-6">
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-[#f3f4f0] rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-[#1B263B] text-2xl">help</span>
                </div>
                <h3 className="text-xl font-bold text-[#1a1c1a] mb-1" style={{fontFamily:"'Newsreader',serif"}}>Which &ldquo;{disambiguation.name}&rdquo;?</h3>
                <p className="text-sm text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>{disambiguation.message}</p>
              </div>
              <div className="space-y-2">
                {disambiguation.options.map((opt) => (
                  <button
                    key={opt.industry}
                    onClick={() => handleDisambiguationSelect(opt.industry)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-[#c4c6cc]/15 hover:border-[#1B263B]/40 hover:bg-[#f3f4f0] transition flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-semibold text-[#1a1c1a] text-sm" style={{fontFamily:"'Manrope',sans-serif"}}>{opt.label}</p>
                      <p className="text-xs text-[#74777d] capitalize" style={{fontFamily:"'Manrope',sans-serif"}}>{opt.industry} industry</p>
                    </div>
                    <span className="material-symbols-outlined text-[#c4c6cc] group-hover:text-[#1B263B] transition">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Loading */}
      {loading && (
        <main className="flex-1 w-full pt-20">
          <LoadingProgress />
        </main>
      )}

      {/* Report */}
      {report && !loading && (
        <main className="max-w-7xl mx-auto px-4 md:px-8 flex-1 w-full pt-24">
          <div>
            <button onClick={() => { setReport(null); setName(""); }}
              className="mb-6 text-sm text-[#1B263B] hover:underline flex items-center gap-1" style={{fontFamily:"'Manrope',sans-serif"}}>&larr; New check</button>

            {/* Reputation500 report branding */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-[#c4c6cc]/15">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1B263B] text-2xl" style={{fontVariationSettings:'"FILL" 1'}}>shield_person</span>
                <div>
                  <p className="font-bold text-lg text-[#1a1c1a]" style={{fontFamily:"'Newsreader',serif"}}>Rep500</p>
                  <p className="text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>Online Reputation Report</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setDownloading(true);
                  try {
                    const res = await fetch("/api/send-report", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: "__download__", report }),
                    });
                    if (res.ok) {
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `Rep500-Report-${(report.name || "Report").replace(/[^a-zA-Z0-9]/g, "-")}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }
                  } catch (err) {
                    console.error("Download failed:", err);
                  } finally {
                    setDownloading(false);
                  }
                }}
                disabled={downloading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#101b30] to-[#3c475d] hover:shadow-lg disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition"
                style={{fontFamily:"'Manrope',sans-serif"}}
              >
                <span className="material-symbols-outlined text-lg">download</span>
                {downloading ? "Generating..." : "Download PDF"}
              </button>
            </div>

            {/* Score header */}
            <div className="report-section bg-white rounded-2xl shadow-sm border border-[#c4c6cc]/15 p-4 md:p-8 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <ScoreGauge score={report.score} />
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
                    <h2 className="text-2xl font-bold" style={{fontFamily:"'Newsreader',serif"}}>{report.name}</h2>
                    <span className="px-3 py-1 bg-[#f3f4f0] text-[#1B263B] rounded-full text-xs font-medium uppercase" style={{fontFamily:"'Manrope',sans-serif"}}>{report.entityType}</span>
                    <RiskBadge level={report.riskLevel} />
                  </div>
                  <BulletText text={report.summary} className="text-[#44474c] leading-relaxed mb-4" />
                  {report.sentimentBreakdown && <SentimentChart breakdown={report.sentimentBreakdown} />}
                </div>
              </div>

              {/* Data stats row */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-[#c4c6cc]/15">
                {[
                  { label: "Results Analyzed", value: report.dataStats.totalResults },
                  { label: "News Mentions", value: report.dataStats.newsCount },
                  { label: "Social Profiles", value: report.dataStats.socialCount },
                  { label: "Review Sites", value: report.dataStats.reviewCount },
                  { label: "Complaint Sites", value: report.dataStats.complaintCount },
                  { label: "Domains in Top 10", value: report.dataStats.uniqueDomainsInTop10 },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-bold text-[#1a1c1a]" style={{fontFamily:"'Newsreader',serif"}}>{s.value}</p>
                    <p className="text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Report content ── */}
            <div>

            {/* Disclaimer banner */}
            {(() => {
              const d = report.disclaimer;
              if (!d?.show) return null;
              const sev = d.severity;
              const bg = sev === "severe" ? "bg-red-50 border-red-300" : sev === "warning" ? "bg-amber-50 border-amber-300" : "bg-[#f3f4f0] border-[#c4c6cc]/30";
              const iconBg = sev === "severe" ? "bg-red-100" : sev === "warning" ? "bg-amber-100" : "bg-[#e8e8e4]";
              const iconText = sev === "severe" ? "text-red-600" : sev === "warning" ? "text-amber-600" : "text-[#1B263B]";
              const titleColor = sev === "severe" ? "text-red-800" : sev === "warning" ? "text-amber-800" : "text-[#1B263B]";
              const tagColor = sev === "severe" ? "bg-red-100 text-red-700" : sev === "warning" ? "bg-amber-100 text-amber-700" : "bg-[#e8e8e4] text-[#44474c]";
              return (
                <div className={`rounded-xl p-5 mb-6 border ${bg}`}>
                  <div className="flex items-start gap-3">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                      <span className={`material-symbols-outlined text-xl ${iconText}`}>info</span>
                    </span>
                    <div>
                      <h3 className={`font-bold mb-1 ${titleColor}`} style={{fontFamily:"'Newsreader',serif"}}>{d.title}</h3>
                      <p className="text-sm text-[#44474c] leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>{d.message}</p>
                      {d.affectedAreas?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {d.affectedAreas.map((area: string, i: number) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor}`} style={{fontFamily:"'Manrope',sans-serif"}}>{area}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Executive brief */}
            {report.executiveBrief && (
              <div className="bg-[#f3f4f0] border border-[#c4c6cc]/15 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-[#1B263B] mb-2 uppercase tracking-wide" style={{ fontSize: "1rem", fontFamily:"'Manrope',sans-serif" }}>Executive Brief</h3>
                <BulletText text={report.executiveBrief} className="text-[#44474c] leading-relaxed" />
              </div>
            )}

            {/* Media presence warning */}
            {report.mediaPresenceWarning && !report.mediaPresenceWarning.hasAdequateMedia && report.mediaPresenceWarning.warning && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-orange-600">warning</span>
                  </span>
                  <div>
                    <h3 className="font-bold text-orange-800 mb-1" style={{ fontSize: "1rem", fontFamily:"'Newsreader',serif" }}>Low Media Coverage Detected</h3>
                    <p className="text-orange-700 leading-relaxed" style={{ fontSize: "0.95rem", fontFamily:"'Manrope',sans-serif" }}>{report.mediaPresenceWarning.warning}</p>
                    <p className="text-orange-600 text-sm mt-2 font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>
                      Media features found: {report.mediaPresenceWarning.mediaCount} &mdash; Recommended minimum: 5+
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTA banner to packages (only if score < 80) */}
            {report.packageRecommendations?.show && (
              <a
                href="#reputation500-packages"
                className="block mb-6 bg-gradient-to-r from-[#101b30] to-[#3c475d] rounded-xl p-4 text-white hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">trending_up</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{fontFamily:"'Manrope',sans-serif"}}>Want to improve your score?</p>
                      <p className="text-white/70 text-xs" style={{fontFamily:"'Manrope',sans-serif"}}>See tailored solutions from Reputation500 experts</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-4 py-2 rounded-lg group-hover:bg-white/30 transition shrink-0" style={{fontFamily:"'Manrope',sans-serif"}}>
                    View Solutions &darr;
                  </span>
                </div>
              </a>
            )}

            {/* Scroll anchor (non-sticky, sits in normal flow right above tabs) */}
            <div id="tabs-anchor" style={{ marginBottom: "-1px" }} />
            {/* Tabs — sticky wrapped grid */}
            <div id="report-tabs" className="sticky top-[64px] z-20 bg-[#f9faf5] -mx-4 md:-mx-8 px-4 md:px-8 pt-3 pb-2" style={{ marginTop: "-1px" }}>
              <div className="flex flex-wrap gap-1.5">
                {tabs.map((tab) => (
                  <button key={tab.key} onClick={() => { setActiveTab(tab.key); document.getElementById('tabs-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                      activeTab === tab.key
                        ? "bg-[#1B263B] text-white border-b-2 border-[#D4AF37] shadow-sm"
                        : "bg-white text-[#44474c] border border-[#c4c6cc]/15 hover:border-[#1B263B]/30 hover:text-[#1B263B]"
                    }`} style={{fontFamily:"'Public Sans',sans-serif"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                    </svg>
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                        activeTab === tab.key ? "bg-white/30 text-white"
                        : tab.key === "problems" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      }`}>{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── OVERVIEW TAB ──────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="report-section grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <Card title="Score Breakdown">
                    <CategoryBar label="Search Results Sentiment" value={report.categoryScores.serpSentiment} max={25} />
                    <CategoryBar label="News Sentiment" value={report.categoryScores.newsSentiment} max={15} />
                    <CategoryBar label="Review Ratings" value={report.categoryScores.reviewRatings} max={10} />
                    <CategoryBar label="AI / LLM Appearance" value={report.categoryScores.aiLlmPresence || 0} max={10} />
                    <CategoryBar label="Autocomplete Safety" value={report.categoryScores.autocompleteSafety} max={10} />
                    <CategoryBar label="Social Media Presence" value={report.categoryScores.socialPresence} max={10} />
                    <CategoryBar label="Complaint Sites" value={report.categoryScores.complaintSites} max={10} />
                    <CategoryBar label="Content Control" value={report.categoryScores.contentControl} max={5} />
                    <CategoryBar label="Domain Ownership" value={report.categoryScores.domainOwnership} max={5} />
                  </Card>

                  {/* Sentiment Timeline */}
                  {report.sentimentTimeline && (
                    <Card title="Sentiment Trend (Past 6 Months)">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          report.sentimentTimeline.trend === "improving" ? "bg-green-100 text-green-700"
                          : report.sentimentTimeline.trend === "declining" ? "bg-red-100 text-red-700"
                          : report.sentimentTimeline.trend === "stable" ? "bg-[#e8e8e4] text-[#1B263B]"
                          : "bg-[#edeeea] text-[#44474c]"
                        }`} style={{fontFamily:"'Manrope',sans-serif"}}>
                          {report.sentimentTimeline.trend === "improving" ? "&#8593; Improving"
                           : report.sentimentTimeline.trend === "declining" ? "&#8595; Declining"
                           : report.sentimentTimeline.trend === "stable" ? "&#8596; Stable"
                           : "? Insufficient Data"}
                        </span>
                      </div>
                      <p className="text-sm text-[#44474c] mb-4 leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>{report.sentimentTimeline.trendAnalysis}</p>

                      {report.sentimentTimeline?.monthlyTrend?.length > 0 && (
                        <div className="flex items-end gap-1.5 mb-4 h-20">
                          {report.sentimentTimeline?.monthlyTrend?.map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div className={`w-full rounded-t ${
                                m.sentiment === "positive" ? "bg-green-400" : m.sentiment === "negative" ? "bg-red-400" : m.sentiment === "mixed" ? "bg-yellow-400" : "bg-[#c4c6cc]"
                              }`} style={{ height: m.sentiment === "positive" ? "100%" : m.sentiment === "mixed" ? "60%" : m.sentiment === "negative" ? "30%" : "50%" }} />
                              <span className="text-xs text-[#74777d] truncate w-full text-center" style={{ fontSize: "10px" }}>{m.month.split(" ")[0]?.slice(0, 3)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {report.sentimentTimeline?.recentNegatives?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#c4c6cc]/15">
                          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2" style={{fontFamily:"'Manrope',sans-serif"}}>Recent Negative Events</p>
                          <div className="space-y-2">
                            {report.sentimentTimeline?.recentNegatives?.map((neg, i) => (
                              <div key={i} className={`rounded-lg p-3 border ${neg.isPotentialCrisis ? "border-red-300 bg-red-50" : "border-yellow-200 bg-yellow-50"}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  {neg.isPotentialCrisis && (
                                    <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-bold" style={{fontFamily:"'Manrope',sans-serif"}}>POTENTIAL CRISIS</span>
                                  )}
                                  <span className="text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>{neg.dateFound} ({neg.daysAgo}d ago)</span>
                                </div>
                                <p className="text-sm font-medium text-[#1a1c1a]" style={{fontFamily:"'Manrope',sans-serif"}}>{neg.title}</p>
                                <p className="text-xs text-[#74777d] mt-0.5" style={{fontFamily:"'Manrope',sans-serif"}}>{neg.summary}</p>
                                {neg.source && (
                                  <a href={neg.source} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B263B] hover:underline mt-1 inline-block">{neg.source}</a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Revenue Impact Summary (overview) */}
                  {report.revenueImpact && report.revenueImpact.totalEstimatedImpact < 0 && (
                    <Card title="Revenue Impact Summary">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-3xl font-bold text-red-600" style={{fontFamily:"'Public Sans',sans-serif"}}>{report.revenueImpact.totalEstimatedImpact}%</span>
                        <span className="text-sm text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>estimated revenue at risk</span>
                      </div>
                      <p className="text-sm text-[#44474c] leading-relaxed mb-3" style={{fontFamily:"'Manrope',sans-serif"}}>{report.revenueImpact.analysis}</p>
                      {report.revenueImpact.topRisks.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600" style={{fontFamily:"'Manrope',sans-serif"}}>Top Revenue Risks</p>
                          {report.revenueImpact.topRisks.slice(0, 3).map((risk, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100">
                              <span className="text-xs text-[#1a1c1a] font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>{risk.title}</span>
                              <span className="text-xs font-bold text-red-600" style={{fontFamily:"'Manrope',sans-serif"}}>{risk.impact}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setActiveTab("revenue")} className="mt-3 text-xs text-[#1B263B] font-bold hover:underline" style={{fontFamily:"'Manrope',sans-serif"}}>
                        View Full Revenue Impact Analysis &rarr;
                      </button>
                    </Card>
                  )}

                  {/* Future Risk Assessment */}
                  {report.futureRiskAssessment && (
                    <Card title="Future Reputation Risk">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          report.futureRiskAssessment.overallRisk === "low" ? "bg-green-100 text-green-700"
                          : report.futureRiskAssessment.overallRisk === "moderate" ? "bg-yellow-100 text-yellow-700"
                          : report.futureRiskAssessment.overallRisk === "high" ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                        }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.futureRiskAssessment.overallRisk} risk</span>
                        <span className="text-sm text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>Score: {report.futureRiskAssessment.riskScore}/10</span>
                      </div>
                      <BulletText text={report.futureRiskAssessment.analysis} className="text-sm text-[#44474c] mb-4 leading-relaxed" />
                      {report.futureRiskAssessment?.risks?.length > 0 && (
                        <div className="space-y-2.5">
                          {report.futureRiskAssessment?.risks?.map((risk, i) => (
                            <div key={i} className="bg-[#f3f4f0] rounded-lg p-3 border border-[#c4c6cc]/15">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${risk.impact === "high" ? "bg-red-500" : risk.impact === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                                <span className="text-sm font-medium text-[#1a1c1a]" style={{fontFamily:"'Manrope',sans-serif"}}>{risk.risk}</span>
                              </div>
                              <div className="flex gap-3 text-xs text-[#74777d] mb-1.5" style={{fontFamily:"'Manrope',sans-serif"}}>
                                <span>Likelihood: <span className="font-medium text-[#44474c]">{risk.likelihood}</span></span>
                                <span>Impact: <span className="font-medium text-[#44474c]">{risk.impact}</span></span>
                              </div>
                              <p className="text-xs text-[#1B263B]" style={{fontFamily:"'Manrope',sans-serif"}}>{risk.mitigation}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Personal Influence */}
                  {report.personalInfluence && (
                    <Card title="Personal Influence">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          report.personalInfluence.verdict === "strong" ? "bg-green-100 text-green-700"
                          : report.personalInfluence.verdict === "moderate" ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.personalInfluence.verdict}</span>
                        <span className="text-sm text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>Score: {report.personalInfluence.score}/10</span>
                      </div>
                      <BulletText text={report.personalInfluence.analysis} className="text-sm text-[#44474c] mb-3 leading-relaxed" />
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {[
                          { k: "authorProfiles", label: "Author Profiles" },
                          { k: "guestPosts", label: "Guest Posts" },
                          { k: "podcasts", label: "Podcasts" },
                          { k: "publicSpeaking", label: "Public Speaking" },
                          { k: "wikipediaPresence", label: "Wikipedia" },
                          { k: "interviews", label: "Interviews" },
                          { k: "mediaFeatures", label: "Media Features" },
                          { k: "linkedinActivity", label: "LinkedIn Activity" },
                          { k: "forumMentions", label: "Forum Mentions" },
                        ].map((item) => {
                          const val = report.personalInfluence?.[item.k as keyof PersonalInfluence] as { found: boolean; details: string } | undefined;
                          return (
                            <div key={item.k} className={`rounded-lg p-2 border text-center ${val?.found ? "border-green-200 bg-green-50" : "border-[#c4c6cc]/15 bg-[#f3f4f0]"}`}>
                              <span className={`block text-xs font-medium ${val?.found ? "text-green-700" : "text-[#74777d]"}`} style={{fontFamily:"'Manrope',sans-serif"}}>{val?.found ? "Found" : "Missing"}</span>
                              <span className="text-xs text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>{item.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  )}

                  {/* SERP Volatility */}
                  {report.serpVolatility && (
                    <Card title="SERP Volatility (Past 3 Months)">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          report.serpVolatility.level === "stable" ? "bg-green-100 text-green-700"
                          : report.serpVolatility.level === "moderate" ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.serpVolatility.level}</span>
                        <span className={`text-xs font-medium ${
                          report.serpVolatility.trend === "improving" ? "text-green-600" : report.serpVolatility.trend === "declining" ? "text-red-600" : "text-[#74777d]"
                        }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.serpVolatility.trend === "improving" ? "Trend: Improving" : report.serpVolatility.trend === "declining" ? "Trend: Declining" : "Trend: Stable"}</span>
                      </div>
                      <BulletText text={report.serpVolatility.analysis} className="text-sm text-[#44474c] mb-3 leading-relaxed" />
                      {report.serpVolatility?.monthlyChanges?.length > 0 && (
                        <div className="flex items-end gap-1.5 mb-3 h-20">
                          {report.serpVolatility?.monthlyChanges?.map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1" title={m.changeNote}>
                              <div className={`w-full rounded-t ${
                                m.sentiment === "positive" ? "bg-green-400" : m.sentiment === "negative" ? "bg-red-400" : m.sentiment === "mixed" ? "bg-yellow-400" : "bg-[#c4c6cc]"
                              }`} style={{ height: m.sentiment === "positive" ? "100%" : m.sentiment === "mixed" ? "60%" : m.sentiment === "negative" ? "30%" : "50%" }} />
                              <span className="text-xs text-[#74777d] truncate w-full text-center" style={{ fontSize: "10px" }}>{m.month.split(" ")[0]?.slice(0, 3)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {report.serpVolatility?.corrections?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#c4c6cc]/15">
                          <p className="text-xs font-semibold text-[#1B263B] mb-2" style={{fontFamily:"'Manrope',sans-serif"}}>Corrections to Improve:</p>
                          {report.serpVolatility?.corrections?.map((c, i) => (
                            <p key={i} className="text-xs text-[#44474c] flex gap-1.5 mb-1" style={{fontFamily:"'Manrope',sans-serif"}}><span className="text-[#1B263B] shrink-0">{i + 1}.</span> {c}</p>
                          ))}
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Conversation Sentiment */}
                  {report.conversationSentiment && (
                    <Card title="Conversation Sentiment">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-2xl font-bold ${
                          report.conversationSentiment.score >= 7 ? "text-green-600" : report.conversationSentiment.score >= 4 ? "text-yellow-600" : "text-red-600"
                        }`} style={{fontFamily:"'Newsreader',serif"}}>{report.conversationSentiment.score}/10</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          report.conversationSentiment.verdict === "positive" || report.conversationSentiment.verdict === "mostly_positive" ? "bg-green-100 text-green-700"
                          : report.conversationSentiment.verdict === "negative" ? "bg-red-100 text-red-700"
                          : "bg-[#edeeea] text-[#44474c]"
                        }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.conversationSentiment.verdict.replace(/_/g, " ")}</span>
                      </div>
                      <BulletText text={report.conversationSentiment.analysis} className="text-sm text-[#44474c] mb-3 leading-relaxed" />
                      {report.conversationSentiment?.topNegativeTopics?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#c4c6cc]/15">
                          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2" style={{fontFamily:"'Manrope',sans-serif"}}>Top Negative Topics</p>
                          {report.conversationSentiment?.topNegativeTopics?.map((t, i) => (
                            <div key={i} className="mb-2 bg-red-50 rounded-lg p-2 border border-red-200">
                              <p className="text-sm font-medium text-[#1a1c1a]" style={{fontFamily:"'Manrope',sans-serif"}}>{t.topic}</p>
                              <p className="text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>Source: {t.source} | Frequency: {t.frequency} | Impact: {t.impact}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Top 6 SERP Links */}
                  {report.topSerpLinks && report.topSerpLinks.length > 0 && (
                    <Card title="Top SERP Links (Google Page 1)">
                      <div className="space-y-2.5">
                        {report.topSerpLinks.slice(0, 6).map((link, i) => (
                          <div key={i} className="flex items-start gap-3 pb-2.5 border-b border-[#c4c6cc]/10 last:border-0 last:pb-0">
                            <span className="text-xs font-mono text-[#74777d] bg-[#f3f4f0] rounded px-1.5 py-0.5 shrink-0">#{link.position}</span>
                            <div className="flex-1 min-w-0">
                              <a href={link.link} target="_blank" rel="noopener noreferrer"
                                className="text-[#1B263B] hover:underline font-medium text-sm line-clamp-1" style={{fontFamily:"'Manrope',sans-serif"}}>{link.title}</a>
                              <p className="text-xs text-[#74777d] truncate" style={{fontFamily:"'Manrope',sans-serif"}}>{link.link}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <SentimentDot sentiment={link.sentiment} />
                              {link.isOwned && (
                                <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-xs font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>Owned</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Domain Info */}
                  <Card title="Domain Check">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${report.domainInfo.hasSite ? "bg-green-500" : "bg-red-500"}`} />
                      <div>
                        <p className="font-medium text-sm" style={{fontFamily:"'Manrope',sans-serif"}}>{report.domainInfo.domain}</p>
                        <p className="text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>
                          {report.domainInfo.hasSite ? "Active website detected" : "No active website found"}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Knowledge Graph */}
                  {report.knowledgeGraph ? (
                    <Card title="Google Knowledge Panel">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-green-600 text-lg" style={{fontVariationSettings:'"FILL" 1'}}>check_circle</span>
                        </span>
                        <div>
                          <p className="font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>{report.knowledgeGraph.title}</p>
                          {report.knowledgeGraph.type && <p className="text-xs text-[#74777d] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>{report.knowledgeGraph.type}</p>}
                          {report.knowledgeGraph.description && <p className="text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>{report.knowledgeGraph.description}</p>}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card title="Google Knowledge Panel">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-yellow-600">warning</span>
                          </span>
                          <div>
                            <p className="font-semibold text-yellow-800 text-sm mb-1" style={{fontFamily:"'Newsreader',serif"}}>No Knowledge Panel Detected</p>
                            <p className="text-sm text-yellow-700 leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>
                              A Google Knowledge Panel significantly boosts credibility and trust. Without one, you&apos;re missing a key trust signal that competitors may have.
                            </p>
                            <div className="mt-3 bg-white rounded-lg p-3 border border-yellow-200">
                              <p className="text-xs font-semibold text-[#44474c] mb-1.5" style={{fontFamily:"'Manrope',sans-serif"}}>How to get a Knowledge Panel:</p>
                              <ul className="text-xs text-[#44474c] space-y-1" style={{fontFamily:"'Manrope',sans-serif"}}>
                                <li className="flex gap-1.5"><span className="text-[#1B263B]">1.</span> Get featured in authoritative media & magazines</li>
                                <li className="flex gap-1.5"><span className="text-[#1B263B]">2.</span> Create a Wikipedia presence (if notable)</li>
                                <li className="flex gap-1.5"><span className="text-[#1B263B]">3.</span> Claim & optimize your Google Business Profile</li>
                                <li className="flex gap-1.5"><span className="text-[#1B263B]">4.</span> Build consistent structured data across the web</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Google Images Ranking */}
                  {report.googleImagesAnalysis && (
                    <Card title="Google Images Ranking">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          report.googleImagesAnalysis.ranking === "strong" ? "bg-green-100 text-green-700"
                          : report.googleImagesAnalysis.ranking === "moderate" ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.googleImagesAnalysis.ranking}</span>
                        <span className="text-sm text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>
                          ~{report.googleImagesAnalysis.ownedImagesPct}% owned/controlled images
                        </span>
                      </div>
                      {report.googleImagesAnalysis?.sentimentBreakdown && (
                        <div className="flex gap-2 mb-3">
                          {[
                            { label: "Positive", value: report.googleImagesAnalysis.sentimentBreakdown.positive, color: "bg-green-100 text-green-700" },
                            { label: "Neutral", value: report.googleImagesAnalysis.sentimentBreakdown.neutral, color: "bg-[#e8e8e4] text-[#44474c]" },
                            { label: "Negative", value: report.googleImagesAnalysis.sentimentBreakdown.negative, color: "bg-red-100 text-red-700" },
                          ].map((s) => (
                            <span key={s.label} className={`px-2 py-1 rounded text-xs font-medium ${s.color}`}>{s.label}: {s.value}%</span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-[#44474c] leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>{report.googleImagesAnalysis.analysis}</p>
                      {report.googleImagesAnalysis?.concerns?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-red-500 mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>Concerns:</p>
                          <ul className="space-y-1">
                            {report.googleImagesAnalysis?.concerns?.map((c, i) => (
                              <li key={i} className="text-xs text-red-600 flex gap-1.5" style={{fontFamily:"'Manrope',sans-serif"}}>
                                <span className="shrink-0">&#9888;</span> {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Social Presence */}
                  <Card title="Social Media Presence">
                    <p className="text-sm text-[#44474c] mb-3" style={{fontFamily:"'Manrope',sans-serif"}}>{report.socialPresenceDetail.assessment}</p>
                    {report.socialPresenceDetail?.found?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-[#74777d] mb-1.5" style={{fontFamily:"'Manrope',sans-serif"}}>Found:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {report.socialPresenceDetail.found.map((p, i) => (
                            <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {report.socialPresenceDetail?.missing?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-[#74777d] mb-1.5" style={{fontFamily:"'Manrope',sans-serif"}}>Missing:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {report.socialPresenceDetail.missing.map((p, i) => (
                            <span key={i} className="px-2.5 py-1 bg-[#edeeea] text-[#74777d] rounded-full text-xs font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Review Summary */}
                  <Card title="Review Sites">
                    <p className="text-sm text-[#44474c] mb-2" style={{fontFamily:"'Manrope',sans-serif"}}>{report.reviewSummary.assessment}</p>
                    {report.reviewSummary?.platforms_found?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {report.reviewSummary.platforms_found.map((p, i) => (
                          <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>{p}</span>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Video / YouTube Sentiment */}
                  {report.videoSentimentAnalysis && (
                    <Card title="YouTube / Video Sentiment">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>Video sentiment:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          report.videoSentimentAnalysis.overallSentiment === "positive" ? "bg-green-100 text-green-700"
                          : report.videoSentimentAnalysis.overallSentiment === "negative" ? "bg-red-100 text-red-700"
                          : report.videoSentimentAnalysis.overallSentiment === "mixed" ? "bg-yellow-100 text-yellow-700"
                          : "bg-[#edeeea] text-[#44474c]"
                        }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.videoSentimentAnalysis.overallSentiment}</span>
                      </div>
                      <p className="text-sm text-[#44474c] mb-3 leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>{report.videoSentimentAnalysis.analysis}</p>
                      {report.videoSentimentAnalysis?.videos?.length > 0 ? (
                        <div className="space-y-2">
                          {report.videoSentimentAnalysis.videos.slice(0, 5).map((v, i) => (
                            <div key={i} className={`rounded-lg p-3 border ${
                              v.sentiment === "negative" ? "border-red-200 bg-red-50" : v.sentiment === "positive" ? "border-green-200 bg-green-50" : "border-[#c4c6cc]/15 bg-[#f3f4f0]"
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <SentimentDot sentiment={v.sentiment} />
                                {v.isOwned && <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-xs font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>Owned</span>}
                                <span className="text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>{v.views?.toLocaleString()} views</span>
                              </div>
                              <a href={v.link} target="_blank" rel="noopener noreferrer"
                                className="text-sm text-[#1B263B] hover:underline font-medium line-clamp-1" style={{fontFamily:"'Manrope',sans-serif"}}>{v.title}</a>
                              <p className="text-xs text-[#74777d] mt-0.5" style={{fontFamily:"'Manrope',sans-serif"}}>by {v.channel}</p>
                              <p className="text-xs text-[#74777d] mt-0.5 italic" style={{fontFamily:"'Manrope',sans-serif"}}>{v.summary}</p>
                              {(v.saves || v.shares || v.commentSentiment) && (
                                <div className="flex gap-3 mt-1 text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>
                                  {v.saves && <span>Saves: {v.saves}</span>}
                                  {v.shares && <span>Shares: {v.shares}</span>}
                                  {v.commentSentiment && <span>Comments: <span className={v.commentSentiment === "positive" ? "text-green-600" : v.commentSentiment === "negative" ? "text-red-600" : "text-[#74777d]"}>{v.commentSentiment}</span></span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-[#74777d] text-center py-3" style={{fontFamily:"'Manrope',sans-serif"}}>No YouTube videos found for this entity.</p>
                      )}
                      {report.videoSentimentAnalysis?.concerns?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#c4c6cc]/15">
                          <p className="text-xs font-semibold text-red-500 mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>Concerns:</p>
                          {report.videoSentimentAnalysis?.concerns?.map((c, i) => (
                            <p key={i} className="text-xs text-red-600" style={{fontFamily:"'Manrope',sans-serif"}}>&#9888; {c}</p>
                          ))}
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Reddit & Quora Conversations */}
                  <Card title="Reddit & Quora Conversations">
                    {report.forumSentiment && report.forumSentiment?.conversations?.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>Forum sentiment:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            report.forumSentiment.overallSentiment === "positive" ? "bg-green-100 text-green-700"
                            : report.forumSentiment.overallSentiment === "negative" ? "bg-red-100 text-red-700"
                            : report.forumSentiment.overallSentiment === "mixed" ? "bg-yellow-100 text-yellow-700"
                            : "bg-[#edeeea] text-[#44474c]"
                          }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.forumSentiment.overallSentiment}</span>
                        </div>
                        <p className="text-sm text-[#44474c] mb-3" style={{fontFamily:"'Manrope',sans-serif"}}>{report.forumSentiment.analysis}</p>
                        <div className="space-y-2.5">
                          {report.forumSentiment.conversations.map((conv, i) => (
                            <div key={i} className={`rounded-lg p-3 border ${
                              conv.sentiment === "negative" ? "border-red-200 bg-red-50" : conv.sentiment === "positive" ? "border-green-200 bg-green-50" : "border-[#c4c6cc]/15 bg-[#f3f4f0]"
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase ${
                                  conv.platform === "reddit" ? "bg-orange-100 text-orange-600" : "bg-[#e8e8e4] text-[#1B263B]"
                                }`} style={{fontFamily:"'Manrope',sans-serif"}}>{conv.platform}</span>
                                <SentimentDot sentiment={conv.sentiment} />
                                {conv.isRisk && <span className="text-xs text-red-500 font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>&#9888; Risk</span>}
                              </div>
                              <a href={conv.link} target="_blank" rel="noopener noreferrer"
                                className="text-sm text-[#1B263B] hover:underline font-medium line-clamp-1" style={{fontFamily:"'Manrope',sans-serif"}}>{conv.title}</a>
                              <p className="text-xs text-[#74777d] mt-0.5" style={{fontFamily:"'Manrope',sans-serif"}}>{conv.summary}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>No Reddit or Quora discussions found.</p>
                        <p className="text-xs text-[#74777d] mt-1" style={{fontFamily:"'Manrope',sans-serif"}}>This is generally positive - no public forum complaints detected.</p>
                      </div>
                    )}
                  </Card>

                  {/* Autocomplete */}
                  <Card title="Google Autocomplete">
                    <p className="text-sm text-[#44474c] mb-3" style={{fontFamily:"'Manrope',sans-serif"}}>{report.autocompleteSentiment.analysis}</p>
                    {report.autocompleteSentiment?.negative_terms?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-red-500 mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>Concerning:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {report.autocompleteSentiment.negative_terms.map((t, i) => (
                            <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs" style={{fontFamily:"'Manrope',sans-serif"}}>{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {(report.autocomplete || []).filter(s => !report.autocompleteSentiment?.negative_terms?.includes(s)).map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#edeeea] rounded-full text-xs text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>{s}</span>
                      ))}
                    </div>
                  </Card>

                  {/* Recommendations (top 4) */}
                  <Card title="All Recommendations">
                    <div className="space-y-3">
                      {report.recommendations.map((rec, i) => {
                        const borderColor = rec.priority === "high" ? "border-l-red-500" : rec.priority === "medium" ? "border-l-yellow-400" : "border-l-[#1B263B]";
                        const bgColor = rec.priority === "high" ? "bg-red-50/50" : rec.priority === "medium" ? "bg-yellow-50/50" : "bg-[#f3f4f0]/50";
                        return (
                          <div key={i} className={`border-l-4 ${borderColor} ${bgColor} rounded-r-lg p-3`}>
                            <div className="flex items-center gap-2 mb-1">
                              <SeverityBadge level={rec.priority} />
                              {rec.revenueImpact && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase" style={{fontFamily:"'Manrope',sans-serif"}}>{rec.revenueImpact}</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-[#1a1c1a]" style={{fontFamily:"'Manrope',sans-serif"}}>{rec.action}</p>
                            <p className="text-xs text-[#74777d] mt-1" style={{fontFamily:"'Manrope',sans-serif"}}>{rec.reason}</p>
                            <p className="text-xs text-[#44474c] mt-0.5" style={{fontFamily:"'Manrope',sans-serif"}}>Expected impact: {rec.estimatedImpact}</p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Industry Benchmark (companies only) */}
                  {report.industryBenchmark?.applicable && (
                    <Card title={`Industry Benchmark: ${report.industryBenchmark.industry}`}>
                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>
                            <span className="text-[#74777d]">Market Leaders</span>
                            <span className="font-bold text-green-600">{report.industryBenchmark.marketLeaderScore}/100</span>
                          </div>
                          <div className="h-3 bg-[#e8e8e4] rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${report.industryBenchmark.marketLeaderScore}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>
                            <span className="text-[#74777d]">Industry Average</span>
                            <span className="font-bold text-yellow-600">{report.industryBenchmark.industryAverage}/100</span>
                          </div>
                          <div className="h-3 bg-[#e8e8e4] rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${report.industryBenchmark.industryAverage}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>
                            <span className="text-[#44474c] font-medium">{report.name}</span>
                            <span className="font-bold text-[#1B263B]">{report.score}/100</span>
                          </div>
                          <div className="h-3 bg-[#e8e8e4] rounded-full overflow-hidden">
                            <div className="h-full bg-[#1B263B] rounded-full" style={{ width: `${report.score}%` }} />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-[#44474c] leading-relaxed mb-3" style={{fontFamily:"'Manrope',sans-serif"}}>{report.industryBenchmark.analysis}</p>
                      {report.industryBenchmark.gap > 0 && (
                        <div className="bg-[#f3f4f0] rounded-lg p-3 border border-[#c4c6cc]/15">
                          <p className="text-xs font-semibold text-[#1B263B] mb-1.5" style={{fontFamily:"'Manrope',sans-serif"}}>Gap to Market Leader: {report.industryBenchmark.gap} points</p>
                          <ul className="space-y-1">
                            {report.industryBenchmark?.recommendations?.map((r, i) => (
                              <li key={i} className="text-xs text-[#44474c] flex gap-1.5" style={{fontFamily:"'Manrope',sans-serif"}}>
                                <span className="text-[#1B263B] shrink-0">{i + 1}.</span> {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Geographic Reputation Map */}
                  {report.geographicPresence && (
                    <Card title="Geographic Reputation Reach">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          report.geographicPresence.scope === "global" ? "bg-green-100 text-green-700"
                          : report.geographicPresence.scope === "regional" ? "bg-[#e8e8e4] text-[#1B263B]"
                          : report.geographicPresence.scope === "national" ? "bg-yellow-100 text-yellow-700"
                          : "bg-[#edeeea] text-[#44474c]"
                        }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.geographicPresence.scope}</span>
                        <span className="text-sm text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>Primary: {report.geographicPresence.primaryMarket}</span>
                      </div>
                      <p className="text-sm text-[#44474c] mb-3 leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>{report.geographicPresence.analysis}</p>
                      {report.geographicPresence?.markets?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-[#74777d] uppercase tracking-wide mb-2" style={{fontFamily:"'Manrope',sans-serif"}}>Top Markets</p>
                          <div className="space-y-1.5">
                            {report.geographicPresence.markets.slice(0, 10).map((m, i) => (
                              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-[#c4c6cc]/10 last:border-0">
                                <span className="text-sm font-mono text-[#74777d] w-5">{i + 1}</span>
                                <span className="text-sm font-medium text-[#1a1c1a] flex-1" style={{fontFamily:"'Manrope',sans-serif"}}>{m.country}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  m.strength === "strong" ? "bg-green-100 text-green-700" : m.strength === "moderate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                }`} style={{fontFamily:"'Manrope',sans-serif"}}>{m.strength}</span>
                                {m.score && <span className="text-xs font-bold text-[#1B263B]" style={{fontFamily:"'Newsreader',serif"}}>{m.score}/10</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Media Brand Sentiment */}
                  {report.mediaBrandSentiment && report.mediaBrandSentiment?.outlets?.length > 0 && (
                    <Card title="Media Brand Sentiment">
                      <p className="text-xs text-[#74777d] mb-3" style={{fontFamily:"'Manrope',sans-serif"}}>How professional and trustworthy readers perceive each media outlet covering {report.name}.</p>
                      <div className="space-y-2">
                        {report.mediaBrandSentiment.outlets.map((o: Record<string, string | number>, i: number) => (
                          <div key={i} className="pb-2 border-b border-[#c4c6cc]/10 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-[#1a1c1a] flex-1" style={{fontFamily:"'Manrope',sans-serif"}}>{o.name}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${o.tier === "premium" ? "bg-green-100 text-green-700" : o.tier === "mid-tier" ? "bg-[#e8e8e4] text-[#1B263B]" : "bg-[#edeeea] text-[#74777d]"}`} style={{fontFamily:"'Manrope',sans-serif"}}>{o.tier}</span>
                              <span className={`text-sm font-bold ${Number(o.sentimentScore) >= 7 ? "text-green-600" : Number(o.sentimentScore) >= 5 ? "text-yellow-600" : "text-red-600"}`} style={{fontFamily:"'Newsreader',serif"}}>{o.sentimentScore}/10</span>
                            </div>
                            {o.articleUrl && (
                              <a href={String(o.articleUrl)} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B263B] hover:underline mt-1 inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                {o.articleTitle || "View article"}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#c4c6cc]/15">
                        <p className="text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>Average media sentiment: <span className="font-bold">{report.mediaBrandSentiment.averageScore}/10</span></p>
                      </div>
                      <BulletText text={report.mediaBrandSentiment.analysis} className="text-sm text-[#44474c] mt-2 leading-relaxed" />
                    </Card>
                  )}

                  {/* Backlink Profile (overview) */}
                  {report.backlinkProfile && (
                    <Card title="Backlink Profile">
                      <div className="flex items-center gap-4 mb-3">
                        <span className={`text-2xl font-bold ${
                          report.backlinkProfile.healthScore >= 7 ? "text-green-600" : report.backlinkProfile.healthScore >= 4 ? "text-yellow-600" : "text-red-600"
                        }`} style={{fontFamily:"'Newsreader',serif"}}>{report.backlinkProfile.healthScore}/10</span>
                        <div>
                          <p className="text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>Est. backlinks: <span className="font-semibold">{report.backlinkProfile.totalBacklinks}</span></p>
                          {report.backlinkProfile.toxicLinksDetected && (
                            <p className="text-xs text-red-500 font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>Toxic links detected ({report.backlinkProfile.toxicLinksCount})</p>
                          )}
                          {report.backlinkProfile.isVulnerable && !report.backlinkProfile.toxicLinksDetected && (
                            <p className="text-xs text-yellow-600 font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>Vulnerable to toxic link attacks</p>
                          )}
                        </div>
                      </div>
                      <BulletText text={report.backlinkProfile.analysis} className="text-sm text-[#44474c] leading-relaxed" />
                    </Card>
                  )}

                  {/* Risk & Crisis Detection Summary */}
                  {report.crisisDetection && (
                    <Card title="Risk & Crisis Detection Summary">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          report.crisisDetection.alertLevel === "critical" || report.crisisDetection.alertLevel === "high" ? "bg-red-100 text-red-700"
                          : report.crisisDetection.alertLevel === "moderate" ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                        }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.crisisDetection.alertLevel === "none" ? "All Clear" : `${report.crisisDetection.alertLevel}`}</span>
                      </div>
                      <BulletText text={report.crisisDetection.summary} className="text-sm text-[#44474c] mb-3 leading-relaxed" />
                      {report.crisisDetection.alerts.slice(0, 5).map((a, i) => (
                        <div key={i} className="mb-2 flex items-start gap-2">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.impact === "high" ? "bg-red-500" : a.impact === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                          <div>
                            <p className="text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>{a.title}</p>
                            <p className="text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>{a.source}</p>
                          </div>
                        </div>
                      ))}
                    </Card>
                  )}

                  {/* Reviews Dashboard (companies only) */}
                  {report.reviewDashboard && report.entityType === "company" && (
                    <Card title="Reviews Dashboard">
                      <div className="flex items-center gap-4 mb-3">
                        <span className={`text-3xl font-bold ${
                          report.reviewDashboard.aggregatedRating >= 4 ? "text-green-600" : report.reviewDashboard.aggregatedRating >= 3 ? "text-yellow-600" : "text-red-600"
                        }`} style={{fontFamily:"'Newsreader',serif"}}>{report.reviewDashboard.aggregatedRating > 0 ? (report.reviewDashboard.aggregatedRating || 0).toFixed(1) : "N/A"}</span>
                        <div>
                          <p className="text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>{report.reviewDashboard.totalReviews} reviews across {report.reviewDashboard?.platforms?.length} platforms</p>
                          {report.reviewDashboard?.risks?.length > 0 && (
                            <p className="text-xs text-red-500 font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>{report.reviewDashboard?.risks?.length} potential risks detected</p>
                          )}
                        </div>
                      </div>
                      <BulletText text={report.reviewDashboard.trendAnalysis} className="text-sm text-[#44474c] leading-relaxed" />

                      {/* Recent Reviews */}
                      {report.reviewDashboard?.recentReviews && (
                        <div className="mt-4 pt-3 border-t border-[#c4c6cc]/15 space-y-3">
                          {report.reviewDashboard.recentReviews.positive?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Recent Positive</p>
                              {report.reviewDashboard.recentReviews.positive.slice(0, 3).map((r: { platform?: string; summary?: string; link?: string }, i: number) => (
                                <p key={i} className="text-xs text-[#44474c] mb-1"><span className="font-medium">{r.platform}:</span> {r.summary}</p>
                              ))}
                            </div>
                          )}
                          {report.reviewDashboard.recentReviews.negative?.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Recent Negative</p>
                              {report.reviewDashboard.recentReviews.negative.slice(0, 3).map((r: { platform?: string; summary?: string; severity?: string; link?: string }, i: number) => (
                                <div key={i} className="mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${r.severity === "critical" ? "bg-red-100 text-red-700" : r.severity === "moderate" ? "bg-yellow-100 text-yellow-700" : "bg-[#e8e8e4] text-[#44474c]"}`}>{r.severity}</span>
                                    <span className="text-xs font-medium text-[#1a1c1a]">{r.platform}</span>
                                  </div>
                                  <p className="text-xs text-[#44474c] mt-0.5">{r.summary}</p>
                                  {r.link && <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B263B] hover:underline inline-flex items-center gap-0.5"><span className="material-symbols-outlined text-[11px]">open_in_new</span>View review</a>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Crisis Detection */}
                      {report.reviewDashboard?.crisisDetection?.detected && (
                        <div className="mt-4 pt-3 border-t border-red-200 bg-red-50/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-red-500 text-lg">crisis_alert</span>
                            <span className="text-sm font-bold text-red-700">Potential Crisis Detected</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.reviewDashboard.crisisDetection.severity === "critical" || report.reviewDashboard.crisisDetection.severity === "high" ? "bg-red-200 text-red-800" : "bg-yellow-100 text-yellow-700"}`}>{report.reviewDashboard.crisisDetection.severity}</span>
                          </div>
                          <p className="text-xs text-red-800 leading-relaxed">{report.reviewDashboard.crisisDetection.summary}</p>
                          {report.reviewDashboard.crisisDetection.triggerReview?.link && (
                            <a href={report.reviewDashboard.crisisDetection.triggerReview.link} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-red-700 hover:underline inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-[11px]">open_in_new</span>View triggering review
                            </a>
                          )}
                        </div>
                      )}
                    </Card>
                  )}

                  {/* People Also Ask */}
                  {report.peopleAlsoAsk?.length > 0 && (
                    <Card title="People Also Ask">
                      <ul className="space-y-1.5">
                        {report.peopleAlsoAsk.map((q, i) => (
                          <li key={i} className="text-sm text-[#44474c] flex gap-2" style={{fontFamily:"'Manrope',sans-serif"}}>
                            <span className="text-[#1B263B]/40 shrink-0">Q:</span> {q}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* ── AI / LLM APPEARANCE TAB ─────────────────── */}
            {/* ── REVENUE IMPACT TAB ──────────────────────── */}
            {activeTab === "revenue" && report.revenueImpact && (
              <div className="report-section space-y-6">
                {/* Hero card */}
                <div className="bg-[#101b30] text-white rounded-xl p-6 md:p-10">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#79849d] mb-6" style={{fontFamily:"'Public Sans',sans-serif"}}>Revenue Impact Analysis</h2>
                  <div className="flex items-center gap-6 mb-6">
                    <span className="text-6xl font-bold" style={{fontFamily:"'Public Sans',sans-serif"}}>{report.revenueImpact.totalEstimatedImpact}%</span>
                    <div>
                      <p className="text-lg text-[#bbc6e2]" style={{fontFamily:"'Newsreader',serif"}}>Estimated Revenue at Risk</p>
                      <p className="text-xs text-[#79849d] mt-1" style={{fontFamily:"'Manrope',sans-serif"}}>Based on reputation issues impacting customer trust and conversion</p>
                    </div>
                  </div>
                  <p className="text-[#afc9ea] leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>{report.revenueImpact.analysis}</p>
                </div>

                {/* Category Breakdown */}
                <Card title="Impact by Category">
                  <div className="space-y-4">
                    {[
                      { label: "Search Results", key: "search" as const, icon: "search" },
                      { label: "Social Media", key: "social" as const, icon: "forum" },
                      { label: "News & Media", key: "media" as const, icon: "newspaper" },
                      { label: "AI / LLM Visibility", key: "aiLlm" as const, icon: "psychology" },
                      { label: "Reviews", key: "reviews" as const, icon: "star" },
                      { label: "Forums (Reddit/Quora)", key: "forums" as const, icon: "chat" },
                    ].map((cat) => {
                      const val = report.revenueImpact!.categoryBreakdown[cat.key];
                      if (val === 0) return null;
                      const width = Math.min(Math.abs(val) * 2, 100);
                      return (
                        <div key={cat.key}>
                          <div className="flex justify-between mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#74777d] flex items-center gap-2" style={{fontFamily:"'Manrope',sans-serif"}}>
                              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                              {cat.label}
                            </span>
                            <span className="text-xs font-bold text-red-600" style={{fontFamily:"'Manrope',sans-serif"}}>{val}%</span>
                          </div>
                          <div className="w-full bg-[#e8e8e4] h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full transition-all duration-700" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Individual Items */}
                {report.revenueImpact.items.length > 0 && (
                  <Card title="Specific Revenue Risks">
                    <div className="space-y-3">
                      {report.revenueImpact.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-[#f3f4f0] rounded-lg border border-[#c4c6cc]/15">
                          <span className="text-lg font-bold text-red-600 shrink-0 w-14 text-right" style={{fontFamily:"'Public Sans',sans-serif"}}>{item.impact}%</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-[#e8e8e4] text-[#44474c] rounded text-[10px] font-bold uppercase tracking-wider" style={{fontFamily:"'Manrope',sans-serif"}}>{item.category.replace(/_/g, " ")}</span>
                            </div>
                            <p className="text-sm font-medium text-[#1a1c1a]" style={{fontFamily:"'Manrope',sans-serif"}}>{item.source}</p>
                            <p className="text-xs text-[#74777d] mt-1" style={{fontFamily:"'Manrope',sans-serif"}}>{item.explanation}</p>
                            {item.link && (
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#47607e] hover:underline mt-1 inline-block break-all" style={{fontFamily:"'Manrope',sans-serif"}}>{item.link}</a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Top Risks */}
                {report.revenueImpact.topRisks.length > 0 && (
                  <Card title="Highest Impact Risks">
                    <div className="space-y-2">
                      {report.revenueImpact.topRisks.map((risk, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold shrink-0" style={{fontFamily:"'Public Sans',sans-serif"}}>{i + 1}</span>
                            <div>
                              <p className="text-sm font-medium text-[#1a1c1a]" style={{fontFamily:"'Manrope',sans-serif"}}>{risk.title}</p>
                              <p className="text-[10px] text-[#74777d] uppercase tracking-wider font-bold" style={{fontFamily:"'Manrope',sans-serif"}}>{risk.category}</p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-red-600" style={{fontFamily:"'Public Sans',sans-serif"}}>{risk.impact}%</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Actionable Intelligence */}
                {(report.revenueImpact.actionableIntelligence?.length ?? 0) > 0 && (
                  <Card title="Actionable Intelligence">
                    <div className="space-y-4">
                      {report.revenueImpact.actionableIntelligence!.map((ai: { finding: string; currentImpact: string; potentialGain: string; dataSource: string; priority: string }, i: number) => (
                        <div key={i} className="p-4 rounded-lg border border-[#c4c6cc]/15 bg-white">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ai.priority === "high" ? "bg-red-100 text-red-700" : ai.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{ai.priority}</span>
                          </div>
                          <p className="text-sm font-medium text-[#1a1c1a] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>{ai.finding}</p>
                          <div className="flex gap-4 mt-2">
                            <div>
                              <p className="text-[10px] text-[#74777d] uppercase tracking-wide font-bold">Current Cost</p>
                              <p className="text-sm font-bold text-red-600">{ai.currentImpact}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#74777d] uppercase tracking-wide font-bold">Recovery Potential</p>
                              <p className="text-sm font-bold text-green-600">{ai.potentialGain}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-[#74777d] mt-2 italic">{ai.dataSource}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Executive Summary for Board */}
                {report.revenueImpact.executiveSummary && (
                  <div className="bg-[#101b30] text-white rounded-xl p-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#79849d] mb-3">Board-Ready Summary</h4>
                    <p className="text-sm leading-relaxed text-[#c4c6cc]" style={{fontFamily:"'Manrope',sans-serif"}}>{report.revenueImpact.executiveSummary}</p>
                  </div>
                )}

                {/* Methodology note */}
                <div className="bg-[#f3f4f0] rounded-xl border border-[#c4c6cc]/15 p-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#74777d] mb-2" style={{fontFamily:"'Manrope',sans-serif"}}>Methodology</h4>
                  <p className="text-xs text-[#44474c] leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>
                    Revenue impact percentages represent estimated conversion friction — the percentage of potential customers who may not convert due to specific reputation issues found during analysis. Estimates are based on industry research: negative Google results in top 3 positions impact 8-15% of potential conversions, negative forum discussions impact 5-12%, and missing AI/LLM presence impacts 5-10% as AI becomes the primary discovery channel. These are composite estimates, not linearly additive.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "ai-llm" && report.aiLlmAppearance && (
              <div className="report-section space-y-6">
                <div className="bg-white rounded-2xl border border-[#c4c6cc]/15 p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className="relative w-36 h-36">
                        <svg width="144" height="144" viewBox="0 0 144 144">
                          <circle cx="72" cy="72" r="60" fill="none" stroke="#e8e8e4" strokeWidth="10" />
                          <circle cx="72" cy="72" r="60" fill="none"
                            stroke={report.aiLlmAppearance.score >= 7 ? "#22c55e" : report.aiLlmAppearance.score >= 5 ? "#eab308" : "#ef4444"}
                            strokeWidth="10" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 60}`}
                            strokeDashoffset={`${2 * Math.PI * 60 * (1 - report.aiLlmAppearance.score / 10)}`}
                            transform="rotate(-90 72 72)"
                            style={{ transition: "stroke-dashoffset 1s ease" }}
                          />
                          <text x="72" y="68" textAnchor="middle" fontSize="36" fontWeight="700"
                            fill={report.aiLlmAppearance.score >= 7 ? "#22c55e" : report.aiLlmAppearance.score >= 5 ? "#eab308" : "#ef4444"}>
                            {report.aiLlmAppearance.score}
                          </text>
                          <text x="72" y="88" textAnchor="middle" fontSize="12" fill="#74777d">/ 10</text>
                        </svg>
                      </div>
                      <span className={`mt-2 px-3 py-1 rounded-full text-sm font-bold uppercase ${
                        report.aiLlmAppearance.verdict === "strong" ? "bg-green-100 text-green-700"
                        : report.aiLlmAppearance.verdict === "moderate" ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                      }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.aiLlmAppearance.verdict}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#1a1c1a] mb-2" style={{fontFamily:"'Newsreader',serif"}}>AI / LLM Prominence Score</h3>
                      <p className="text-[#74777d] text-sm mb-4" style={{fontFamily:"'Manrope',sans-serif"}}>
                        How well AI engines like ChatGPT, Claude, Gemini, and Perplexity reference and quote {report.name}.
                      </p>
                      <BulletText text={report.aiLlmAppearance.analysis} className="text-[#44474c] leading-relaxed" />
                    </div>
                  </div>
                </div>

                {report.aiLlmAppearance.score < 6 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-red-600">warning</span>
                      </span>
                      <div>
                        <p className="font-bold text-red-800 mb-1" style={{fontFamily:"'Newsreader',serif"}}>Low AI Visibility - Action Required</p>
                        <p className="text-sm text-red-700 leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>
                          With a score of {report.aiLlmAppearance.score}/10, AI engines are unlikely to reference or accurately represent {report.name}.
                          As AI-powered search becomes the primary way people discover information, this gap will widen.
                          You can fix this with an active content and media strategy including magazine features, leadership articles, and expertise pieces that AI engines can reference.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <Card title="What&apos;s Helping AI Find You">
                    {report.aiLlmAppearance?.strengths?.length > 0 ? (
                      <ul className="space-y-2">
                        {report.aiLlmAppearance.strengths.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>
                            <span className="material-symbols-outlined text-green-500 text-lg shrink-0" style={{fontVariationSettings:'"FILL" 1'}}>check_circle</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>No AI visibility strengths detected.</p>
                    )}
                  </Card>

                  <Card title="What&apos;s Missing for AI Visibility">
                    {report.aiLlmAppearance?.weaknesses?.length > 0 ? (
                      <ul className="space-y-2">
                        {report.aiLlmAppearance.weaknesses.map((w, i) => (
                          <li key={i} className="flex gap-2 text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>
                            <span className="material-symbols-outlined text-red-500 text-lg shrink-0">close</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>No significant weaknesses found.</p>
                    )}
                  </Card>
                </div>

                {report.aiLlmAppearance?.recommendations?.length > 0 && (
                  <Card title="How to Improve AI Visibility">
                    <div className="space-y-3">
                      {report.aiLlmAppearance.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3 pb-3 border-b border-[#c4c6cc]/10 last:border-0 last:pb-0">
                          <span className="w-7 h-7 rounded-full bg-[#f3f4f0] flex items-center justify-center text-[#1B263B] text-xs font-bold shrink-0" style={{fontFamily:"'Manrope',sans-serif"}}>{i + 1}</span>
                          <p className="text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <div className="bg-[#f3f4f0] rounded-xl border border-[#c4c6cc]/15 p-5">
                  <h4 className="font-semibold text-sm text-[#44474c] mb-3" style={{fontFamily:"'Newsreader',serif"}}>Which AI Engines Are Analyzed?</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "ChatGPT", desc: "OpenAI" },
                      { name: "Claude", desc: "Anthropic" },
                      { name: "Gemini", desc: "Google" },
                      { name: "Perplexity", desc: "AI Search" },
                    ].map((engine, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-[#c4c6cc]/15 text-center">
                        <p className="font-semibold text-sm text-[#1a1c1a]" style={{fontFamily:"'Manrope',sans-serif"}}>{engine.name}</p>
                        <p className="text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>{engine.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#74777d] mt-3" style={{fontFamily:"'Manrope',sans-serif"}}>
                    AI engines pull information from authoritative sources like news articles, Wikipedia, official websites, and structured data.
                    The more high-quality, factual content available about you online, the more accurately AI will represent you.
                  </p>
                </div>
              </div>
            )}

            {/* ── SUSPICIOUS ACTIVITY TAB ──────────────────── */}
            {activeTab === "suspicious" && report.suspiciousActivityAnalysis && (
              <div className="report-section space-y-6">
                <div className="bg-white rounded-2xl border border-[#c4c6cc]/15 p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className="relative w-36 h-36">
                        <svg width="144" height="144" viewBox="0 0 144 144">
                          <circle cx="72" cy="72" r="60" fill="none" stroke="#e8e8e4" strokeWidth="10" />
                          <circle cx="72" cy="72" r="60" fill="none"
                            stroke={report.suspiciousActivityAnalysis.score <= 3 ? "#22c55e" : report.suspiciousActivityAnalysis.score <= 6 ? "#eab308" : "#ef4444"}
                            strokeWidth="10" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 60}`}
                            strokeDashoffset={`${2 * Math.PI * 60 * (1 - report.suspiciousActivityAnalysis.score / 10)}`}
                            transform="rotate(-90 72 72)"
                            style={{ transition: "stroke-dashoffset 1s ease" }}
                          />
                          <text x="72" y="68" textAnchor="middle" fontSize="36" fontWeight="700"
                            fill={report.suspiciousActivityAnalysis.score <= 3 ? "#22c55e" : report.suspiciousActivityAnalysis.score <= 6 ? "#eab308" : "#ef4444"}>
                            {report.suspiciousActivityAnalysis.score}
                          </text>
                          <text x="72" y="88" textAnchor="middle" fontSize="12" fill="#74777d">/ 10</text>
                        </svg>
                      </div>
                      <span className={`mt-2 px-3 py-1 rounded-full text-sm font-bold uppercase ${
                        report.suspiciousActivityAnalysis.riskLevel === "low" ? "bg-green-100 text-green-700"
                        : report.suspiciousActivityAnalysis.riskLevel === "moderate" ? "bg-yellow-100 text-yellow-700"
                        : report.suspiciousActivityAnalysis.riskLevel === "high" ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                      }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.suspiciousActivityAnalysis.riskLevel} risk</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#1a1c1a] mb-2" style={{fontFamily:"'Newsreader',serif"}}>Suspicious Activity Score</h3>
                      <p className="text-[#74777d] text-sm mb-3" style={{fontFamily:"'Manrope',sans-serif"}}>
                        Scale: 1 (clean) to 10 (highly suspicious). Higher scores indicate potential SERP manipulation flags based on Google policies.
                      </p>
                      <BulletText text={report.suspiciousActivityAnalysis.analysis} className="text-[#44474c] leading-relaxed" />
                    </div>
                  </div>
                </div>

                {report.suspiciousActivityAnalysis.score >= 6 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-red-600">warning</span>
                      </span>
                      <div>
                        <p className="font-bold text-red-800 mb-1" style={{fontFamily:"'Newsreader',serif"}}>Warning: Suspicious Patterns Detected</p>
                        <p className="text-sm text-red-700 leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>
                          Google policies consider rushed or unnatural patterns as SERP manipulation. This can result in penalties, deindexing, or reduced rankings.
                          The recommendation is to proceed with caution &mdash; take a surgical approach to achieve results while staying under the radar from Google flagging this as spam or fraud.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {report.suspiciousActivityAnalysis?.patterns?.length > 0 ? (
                  <Card title="Detected Patterns">
                    <div className="space-y-3">
                      {report.suspiciousActivityAnalysis?.patterns?.map((p, i) => (
                        <div key={i} className={`rounded-lg p-4 border ${
                          p.severity === "high" ? "border-red-200 bg-red-50" : p.severity === "medium" ? "border-yellow-200 bg-yellow-50" : "border-[#c4c6cc]/15 bg-[#f3f4f0]"
                        }`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <SeverityBadge level={p.severity} />
                            <span className="px-2 py-0.5 bg-[#edeeea] text-[#44474c] rounded text-xs font-medium uppercase" style={{fontFamily:"'Manrope',sans-serif"}}>{p.type.replace(/_/g, " ")}</span>
                          </div>
                          <p className="text-sm font-medium text-[#1a1c1a] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>{p.description}</p>
                          <p className="text-xs text-[#74777d] italic" style={{fontFamily:"'Manrope',sans-serif"}}>{p.evidence}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card title="Detected Patterns">
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="material-symbols-outlined text-green-500 text-2xl" style={{fontVariationSettings:'"FILL" 1'}}>check_circle</span>
                      </div>
                      <p className="text-sm text-[#44474c] font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>No suspicious patterns detected</p>
                      <p className="text-xs text-[#74777d] mt-1" style={{fontFamily:"'Manrope',sans-serif"}}>The online presence appears to be organically built.</p>
                    </div>
                  </Card>
                )}

                {report.suspiciousActivityAnalysis.recommendation && (
                  <div className="bg-[#f3f4f0] border border-[#c4c6cc]/15 rounded-xl p-5">
                    <h4 className="font-semibold text-[#1B263B] text-sm mb-2" style={{fontFamily:"'Newsreader',serif"}}>Recommendation</h4>
                    <p className="text-sm text-[#44474c] leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>{report.suspiciousActivityAnalysis.recommendation}</p>
                  </div>
                )}

                <div className="bg-[#f3f4f0] rounded-xl border border-[#c4c6cc]/15 p-5">
                  <h4 className="font-semibold text-sm text-[#44474c] mb-2" style={{fontFamily:"'Newsreader',serif"}}>About Google&apos;s SERP Manipulation Policies</h4>
                  <p className="text-sm text-[#44474c] leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>
                    Google actively detects and penalizes unnatural patterns including: review flooding (many reviews posted in short timeframes), mass Web 2.0 profile creation, unnatural link building spikes, and content stuffing. Violations can lead to manual actions, ranking penalties, or complete deindexing from search results.
                  </p>
                </div>
              </div>
            )}

            {/* ── INFLUENCERS TAB ────────────────────────────── */}
            {activeTab === "influencers" && (
              <div className="report-section space-y-6">
                <Card title="Influencer & Third-Party Mentions">
                  <p className="text-xs text-[#74777d] mb-4 border-b border-[#c4c6cc]/10 pb-3" style={{fontFamily:"'Manrope',sans-serif"}}>
                    Analysis covers the past 3 months across: YouTube, Instagram, TikTok, Twitter/X, LinkedIn, Reddit, and Blogs. For YouTube video details, see the Video section in the Overview tab.
                  </p>
                  {report.influencerMentions?.mentions && report.influencerMentions.mentions.length > 0 ? (
                    <>
                      <BulletText text={report.influencerMentions.analysis} className="text-sm text-[#44474c] mb-4 leading-relaxed" />
                      <div className="space-y-3">
                        {report.influencerMentions.mentions.map((m, i) => (
                          <div key={i} className={`rounded-lg p-4 border ${
                            m.sentiment === "negative" ? "border-red-200 bg-red-50" : m.sentiment === "positive" ? "border-green-200 bg-green-50" : "border-[#c4c6cc]/15 bg-[#f3f4f0]"
                          }`}>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="font-semibold text-sm text-[#1a1c1a]" style={{fontFamily:"'Manrope',sans-serif"}}>{m.influencerName}</span>
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-600 uppercase" style={{fontFamily:"'Manrope',sans-serif"}}>{m.platform}</span>
                              <SentimentDot sentiment={m.sentiment} />
                              {m.isSponsored && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-bold" style={{fontFamily:"'Manrope',sans-serif"}}>SPONSORED</span>
                              )}
                              <span className="text-xs text-[#74777d] ml-auto" style={{fontFamily:"'Manrope',sans-serif"}}>{m.dateFound} ({m.daysAgo}d ago)</span>
                            </div>
                            <p className="text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>{m.summary}</p>
                            {m.link && (
                              <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B263B] hover:underline mt-1 inline-block" style={{fontFamily:"'Manrope',sans-serif"}}>{m.link}</a>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-[#74777d] font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>No influencer mentions detected in the past 3 months.</p>
                      <p className="text-xs text-[#74777d] mt-1" style={{fontFamily:"'Manrope',sans-serif"}}>This could mean the brand lacks third-party advocacy — consider an influencer outreach strategy.</p>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* ── REVIEWS DASHBOARD TAB (companies only) ───── */}
            {activeTab === "reviews" && report.reviewDashboard && (
              <div className="report-section space-y-6">
                <div className="bg-white rounded-2xl border border-[#c4c6cc]/15 p-4 md:p-8">
                  <div className="flex items-center gap-4 md:gap-8">
                    <div className="text-center">
                      <p className="text-5xl font-bold" style={{ color: report.reviewDashboard.aggregatedRating >= 4 ? "#22c55e" : report.reviewDashboard.aggregatedRating >= 3 ? "#eab308" : "#ef4444", fontFamily:"'Newsreader',serif" }}>
                        {(report.reviewDashboard.aggregatedRating || 0).toFixed(1)}
                      </p>
                      <p className="text-sm text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>/ 5.0</p>
                      <p className="text-xs text-[#74777d] mt-1" style={{fontFamily:"'Manrope',sans-serif"}}>{report.reviewDashboard.totalReviews} total reviews</p>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#1a1c1a] mb-2" style={{fontFamily:"'Newsreader',serif"}}>Aggregated Review Score</h3>
                      <BulletText text={report.reviewDashboard.trendAnalysis} className="text-sm text-[#44474c] leading-relaxed" />
                    </div>
                  </div>
                </div>

                <Card title="Platform Breakdown">
                  <div className="space-y-3">
                    {report.reviewDashboard.platforms.map((p, i) => (
                      <div key={i} className="flex items-center gap-4 pb-3 border-b border-[#c4c6cc]/10 last:border-0">
                        <span className="font-semibold text-sm text-[#1a1c1a] w-28 shrink-0" style={{fontFamily:"'Manrope',sans-serif"}}>{p.name}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 bg-[#e8e8e4] rounded-full overflow-hidden flex-1">
                              <div className={`h-full rounded-full ${p.rating >= 4 ? "bg-green-500" : p.rating >= 3 ? "bg-yellow-400" : "bg-red-500"}`}
                                style={{ width: `${(p.rating / 5) * 100}%` }} />
                            </div>
                            <span className="text-sm font-bold w-10 text-right" style={{fontFamily:"'Newsreader',serif"}}>{p.rating > 0 ? p.rating.toFixed(1) : "N/A"}</span>
                          </div>
                        </div>
                        <span className="text-xs text-[#74777d] w-20 text-right" style={{fontFamily:"'Manrope',sans-serif"}}>{p.reviewCount} reviews</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          p.sentiment === "positive" ? "bg-green-100 text-green-700" : p.sentiment === "negative" ? "bg-red-100 text-red-700" : "bg-[#edeeea] text-[#44474c]"
                        }`} style={{fontFamily:"'Manrope',sans-serif"}}>{p.sentiment}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {report.reviewDashboard?.risks?.length > 0 && (
                  <Card title="Potential Review Risks">
                    <div className="space-y-3">
                      {report.reviewDashboard.risks.map((r, i) => (
                        <div key={i} className="border border-red-200 bg-red-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>{r.platform}</span>
                            <span className="text-xs text-red-500 font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>Potential Risk</span>
                          </div>
                          <p className="text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>{r.review}</p>
                          <p className="text-xs text-red-600 mt-1" style={{fontFamily:"'Manrope',sans-serif"}}>{r.risk}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* ── BACKLINK PROFILE TAB ─────────────────────── */}
            {activeTab === "backlinks" && report.backlinkProfile && (
              <div className="report-section space-y-6">
                <div className="bg-white rounded-2xl border border-[#c4c6cc]/15 p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className="relative w-36 h-36">
                        <svg width="144" height="144" viewBox="0 0 144 144">
                          <circle cx="72" cy="72" r="60" fill="none" stroke="#e8e8e4" strokeWidth="10" />
                          <circle cx="72" cy="72" r="60" fill="none"
                            stroke={report.backlinkProfile.healthScore >= 7 ? "#22c55e" : report.backlinkProfile.healthScore >= 4 ? "#eab308" : "#ef4444"}
                            strokeWidth="10" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 60}`}
                            strokeDashoffset={`${2 * Math.PI * 60 * (1 - report.backlinkProfile.healthScore / 10)}`}
                            transform="rotate(-90 72 72)"
                            style={{ transition: "stroke-dashoffset 1s ease" }}
                          />
                          <text x="72" y="68" textAnchor="middle" fontSize="36" fontWeight="700"
                            fill={report.backlinkProfile.healthScore >= 7 ? "#22c55e" : report.backlinkProfile.healthScore >= 4 ? "#eab308" : "#ef4444"}>
                            {report.backlinkProfile.healthScore}
                          </text>
                          <text x="72" y="88" textAnchor="middle" fontSize="12" fill="#74777d">/ 10</text>
                        </svg>
                      </div>
                      <p className="text-sm text-[#74777d] mt-2" style={{fontFamily:"'Manrope',sans-serif"}}>Est. backlinks: {report.backlinkProfile.totalBacklinks}</p>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#1a1c1a] mb-2" style={{fontFamily:"'Newsreader',serif"}}>Backlink Health Score</h3>
                      <BulletText text={report.backlinkProfile.analysis} className="text-[#44474c] leading-relaxed" />
                    </div>
                  </div>
                </div>

                {report.backlinkProfile.toxicLinksDetected && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-red-600">warning</span>
                      </span>
                      <div>
                        <p className="font-bold text-red-800 mb-1" style={{fontFamily:"'Newsreader',serif"}}>Toxic Links Detected ({report.backlinkProfile.toxicLinksCount})</p>
                        <p className="text-sm text-red-700 mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>Status: <span className="font-semibold uppercase">{report.backlinkProfile.toxicLinksStatus}</span></p>
                        <p className="text-sm text-red-700 leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>{report.backlinkProfile.toxicLinksSolution}</p>
                      </div>
                    </div>
                  </div>
                )}

                {report.backlinkProfile.isVulnerable && !report.backlinkProfile.toxicLinksDetected && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-yellow-600">warning</span>
                      </span>
                      <div>
                        <p className="font-bold text-yellow-800 mb-1" style={{fontFamily:"'Newsreader',serif"}}>Backlink Vulnerability</p>
                        <p className="text-sm text-yellow-700 leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>{report.backlinkProfile.vulnerabilityNote}</p>
                      </div>
                    </div>
                  </div>
                )}

                {report.backlinkProfile?.recommendations?.length > 0 && (
                  <Card title="Backlink Recommendations">
                    <div className="space-y-3">
                      {report.backlinkProfile.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3 pb-3 border-b border-[#c4c6cc]/10 last:border-0 last:pb-0">
                          <span className="w-7 h-7 rounded-full bg-[#f3f4f0] flex items-center justify-center text-[#1B263B] text-xs font-bold shrink-0" style={{fontFamily:"'Manrope',sans-serif"}}>{i + 1}</span>
                          <p className="text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>{rec}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* ── RISK & CRISIS DETECTION TAB ──────────────── */}
            {activeTab === "crisis" && report.crisisDetection && (
              <div className="report-section space-y-6">
                <div className={`rounded-2xl border p-4 md:p-8 ${
                  report.crisisDetection.alertLevel === "critical" ? "border-red-400 bg-red-50"
                  : report.crisisDetection.alertLevel === "high" ? "border-orange-300 bg-orange-50"
                  : report.crisisDetection.alertLevel === "moderate" ? "border-yellow-300 bg-yellow-50"
                  : "border-[#c4c6cc]/15 bg-white"
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${
                      report.crisisDetection.alertLevel === "critical" ? "bg-red-500 text-white"
                      : report.crisisDetection.alertLevel === "high" ? "bg-orange-500 text-white"
                      : report.crisisDetection.alertLevel === "moderate" ? "bg-yellow-400 text-yellow-900"
                      : report.crisisDetection.alertLevel === "low" ? "bg-[#e8e8e4] text-[#1B263B]"
                      : "bg-green-100 text-green-700"
                    }`} style={{fontFamily:"'Manrope',sans-serif"}}>
                      {report.crisisDetection.alertLevel === "none" ? "All Clear" : `${report.crisisDetection.alertLevel} Alert`}
                    </span>
                  </div>
                  <BulletText text={report.crisisDetection.summary} className="text-[#44474c] leading-relaxed" />
                </div>

                {report.crisisDetection?.alerts?.length > 0 && (
                  <Card title="Active Alerts">
                    <div className="space-y-3">
                      {report.crisisDetection.alerts.map((a, i) => (
                        <div key={i} className={`rounded-lg p-4 border ${
                          a.priority === "immediate" ? "border-red-300 bg-red-50" : a.priority === "urgent" ? "border-orange-200 bg-orange-50" : "border-[#c4c6cc]/15 bg-[#f3f4f0]"
                        }`}>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                              a.priority === "immediate" ? "bg-red-500 text-white" : a.priority === "urgent" ? "bg-orange-500 text-white" : "bg-[#e8e8e4] text-[#1B263B]"
                            }`} style={{fontFamily:"'Manrope',sans-serif"}}>{a.priority}</span>
                            <span className="px-2 py-0.5 bg-[#edeeea] text-[#44474c] rounded text-xs font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>{a.type.replace(/_/g, " ")}</span>
                            {a.date && <span className="text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>{a.date}</span>}
                          </div>
                          <p className="text-sm font-medium text-[#1a1c1a]" style={{fontFamily:"'Manrope',sans-serif"}}>{a.title}</p>
                          <p className="text-xs text-[#74777d] mt-0.5" style={{fontFamily:"'Manrope',sans-serif"}}>Source: {a.source} | Impact: {a.impact}</p>
                          {a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B263B] hover:underline mt-1 inline-block" style={{fontFamily:"'Manrope',sans-serif"}}>{a.link}</a>}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {report.crisisDetection?.threats?.length > 0 && (
                  <Card title="Reputation Threats">
                    <div className="space-y-3">
                      {report.crisisDetection.threats.map((t, i) => (
                        <div key={i} className="bg-[#f3f4f0] rounded-lg p-3 border border-[#c4c6cc]/15">
                          <p className="text-sm font-medium text-[#1a1c1a] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>{t.threat}</p>
                          <div className="flex gap-3 text-xs text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>
                            <span>Likelihood: <span className="font-medium text-[#44474c]">{t.likelihood}</span></span>
                            <span>Impact: <span className="font-medium text-[#44474c]">{t.impact}</span></span>
                          </div>
                          <p className="text-xs text-[#1B263B] mt-1" style={{fontFamily:"'Manrope',sans-serif"}}>{t.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* ── RESULTS TAB ──────────────────────────────── */}
            {activeTab === "results" && (
              <div className="space-y-3">
                {report.results.map((r, i) => (
                  <div key={i} className="bg-white rounded-xl border border-[#c4c6cc]/15 p-5 flex gap-4">
                    <div className="pt-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-[#74777d] font-mono">#{r.position}</span>
                      <SentimentDot sentiment={r.sentiment} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <a href={r.link} target="_blank" rel="noopener noreferrer"
                          className="text-[#1B263B] hover:underline font-medium text-sm line-clamp-1" style={{fontFamily:"'Manrope',sans-serif"}}>{r.title}</a>
                      </div>
                      <p className="text-sm text-[#74777d] line-clamp-2" style={{fontFamily:"'Manrope',sans-serif"}}>{r.snippet}</p>
                      <p className="text-xs text-[#74777d] mt-1.5 italic" style={{fontFamily:"'Manrope',sans-serif"}}>{r.reason}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <CategoryTag cat={r.category} />
                      <SeverityBadge level={r.severity} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── PROBLEMS TAB ─────────────────────────────── */}
            {activeTab === "problems" && (
              <div className="space-y-4">
                {report.problems.length === 0 && (
                  <div className="text-center py-12 text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>No significant problems detected.</div>
                )}
                {report.problems.map((p, i) => (
                  <div key={i} className={`rounded-xl border p-5 ${
                    p.severity === "high" ? "border-red-200 bg-red-50" : p.severity === "medium" ? "border-yellow-200 bg-yellow-50" : "border-[#c4c6cc]/15 bg-[#f3f4f0]"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <SeverityBadge level={p.severity} />
                      <span className="font-semibold text-sm" style={{fontFamily:"'Manrope',sans-serif"}}>{p.title}</span>
                      <CategoryTag cat={p.category} />
                    </div>
                    <p className="text-sm text-[#44474c] mb-2" style={{fontFamily:"'Manrope',sans-serif"}}>{p.description}</p>
                    {p.source && (
                      <a href={p.source} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#1B263B] hover:underline break-all" style={{fontFamily:"'Manrope',sans-serif"}}>{p.source}</a>
                    )}
                  </div>
                ))}

                {report.recommendations.length > 0 && (
                  <Card title="All Recommendations" className="mt-6">
                    <div className="space-y-4">
                      {report.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3 pb-3 border-b border-[#c4c6cc]/10 last:border-0 last:pb-0">
                          <SeverityBadge level={rec.priority} />
                          <div>
                            <p className="text-sm font-medium text-[#1a1c1a]" style={{fontFamily:"'Manrope',sans-serif"}}>{rec.action}</p>
                            <p className="text-xs text-[#74777d] mt-0.5" style={{fontFamily:"'Manrope',sans-serif"}}>{rec.reason}</p>
                            <p className="text-xs text-green-600 mt-0.5" style={{fontFamily:"'Manrope',sans-serif"}}>Expected impact: {rec.estimatedImpact}</p>
                            {rec.revenueImpact && (
                              <p className="text-xs text-emerald-700 font-bold mt-0.5" style={{fontFamily:"'Manrope',sans-serif"}}>Revenue: {rec.revenueImpact}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* ── STRENGTHS TAB ────────────────────────────── */}
            {activeTab === "strengths" && (
              <div className="space-y-4">
                {(!report.strengths || report.strengths.length === 0) && (
                  <div className="text-center py-12 text-[#74777d]" style={{fontFamily:"'Manrope',sans-serif"}}>No notable strengths identified.</div>
                )}
                {report.strengths?.map((s, i) => (
                  <div key={i} className="rounded-xl border border-green-200 bg-green-50 p-5">
                    <h4 className="font-semibold text-sm text-green-800 mb-1" style={{fontFamily:"'Newsreader',serif"}}>{s.title}</h4>
                    <p className="text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>{s.description}</p>
                    {s.source && (
                      <a href={s.source} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#1B263B] hover:underline mt-1 inline-block" style={{fontFamily:"'Manrope',sans-serif"}}>{s.source}</a>
                    )}
                  </div>
                ))}

                {report.serpBreakdown && (
                  <Card title="SERP Control Analysis" className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>First page dominance:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        report.serpBreakdown.firstPageDominance === "high" ? "bg-green-100 text-green-700"
                        : report.serpBreakdown.firstPageDominance === "medium" ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                      }`} style={{fontFamily:"'Manrope',sans-serif"}}>{report.serpBreakdown.firstPageDominance}</span>
                    </div>
                    {report.serpBreakdown?.ownedProperties?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-[#74777d] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>Owned/Controlled Properties:</p>
                        <ul className="space-y-1">
                          {report.serpBreakdown.ownedProperties.map((url, i) => (
                            <li key={i} className="text-xs text-green-600 truncate" style={{fontFamily:"'Manrope',sans-serif"}}>{url}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {report.serpBreakdown?.riskyResults?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-[#74777d] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>Risky Results:</p>
                        <ul className="space-y-1">
                          {report.serpBreakdown.riskyResults.map((url, i) => (
                            <li key={i} className="text-xs text-red-500 truncate" style={{fontFamily:"'Manrope',sans-serif"}}>{url}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )}

            {/* ── PACKAGES SECTION (below tabs, for scores < 80) ── */}
            {report.packageRecommendations?.show && (
              <div id="reputation500-packages" className="mt-10 scroll-mt-24">
                <div className="bg-gradient-to-r from-[#101b30] to-[#3c475d] rounded-2xl p-6 mb-6 text-white">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined" style={{fontVariationSettings:'"FILL" 1'}}>shield_person</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{fontFamily:"'Newsreader',serif"}}>How Reputation500 Can Help</h3>
                      <p className="text-white/80 leading-relaxed" style={{ fontSize: "1.35rem", lineHeight: "1.8", fontFamily:"'Manrope',sans-serif" }}>
                        {report.packageRecommendations.urgencyMessage}
                      </p>
                      <p className="text-white font-medium mt-3" style={{ fontSize: "1.15rem", lineHeight: "1.6", fontFamily:"'Manrope',sans-serif" }}>
                        Trusted by 300+ companies and individuals with a 100% satisfaction rate. Led by ex-Google reputation experts.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {report.packageRecommendations.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative bg-white rounded-xl border p-6 flex flex-col ${
                        pkg.match === "perfect"
                          ? "border-[#1B263B] shadow-lg shadow-[#1B263B]/10"
                          : pkg.match === "strong"
                          ? "border-[#47607e]"
                          : "border-[#c4c6cc]/15"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            pkg.match === "perfect"
                              ? "bg-[#1B263B] text-white"
                              : pkg.match === "strong"
                              ? "bg-[#f3f4f0] text-[#1B263B]"
                              : "bg-[#edeeea] text-[#44474c]"
                          }`}
                          style={{fontFamily:"'Manrope',sans-serif"}}
                        >
                          {pkg.tag}
                        </span>
                        <span className="text-xs text-[#74777d] uppercase font-medium" style={{fontFamily:"'Manrope',sans-serif"}}>
                          {pkg.type === "pr"
                            ? "PR Distribution"
                            : pkg.type === "media"
                            ? "Media Package"
                            : "Full ORM"}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-[#1a1c1a] mb-0.5" style={{fontFamily:"'Newsreader',serif"}}>{pkg.headline}</h4>
                      <p className="text-sm text-[#74777d] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>{pkg.name}</p>
                      <p className="text-2xl font-bold text-[#1B263B] mb-3" style={{fontFamily:"'Newsreader',serif"}}>
                        {pkg.price}
                        {pkg.type === "orm" && (
                          <span className="text-xs text-[#74777d] font-normal ml-1" style={{fontFamily:"'Manrope',sans-serif"}}>/ 12-month plan</span>
                        )}
                      </p>

                      <p className="text-sm text-[#44474c] mb-4 leading-relaxed" style={{fontFamily:"'Manrope',sans-serif"}}>{pkg.reason.replace(/^[\s\-–—]+/, "").replace(/ — /g, " ").replace(/ – /g, " ").replace(/ - /g, " ")}</p>

                      <ul className="space-y-2 mb-5 flex-1">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex gap-2 text-sm text-[#44474c]" style={{fontFamily:"'Manrope',sans-serif"}}>
                            <span className="material-symbols-outlined text-[#1B263B] text-lg shrink-0" style={{fontVariationSettings:'"FILL" 1'}}>check_circle</span>
                            {f}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => {
                          setContactModal({ open: true, packageName: `${pkg.name} (${pkg.price})` });
                          setContactSent(false);
                          setContactForm({ name: "", email: "" });
                        }}
                        className={`block w-full text-center py-3 rounded-lg font-semibold text-sm transition cursor-pointer ${
                          pkg.match === "perfect"
                            ? "bg-gradient-to-r from-[#101b30] to-[#3c475d] hover:shadow-lg text-white"
                            : "bg-[#f3f4f0] hover:bg-[#e8e8e4] text-[#1B263B]"
                        }`}
                        style={{fontFamily:"'Manrope',sans-serif"}}
                      >
                        {pkg.cta}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center py-8 border-t border-[#c4c6cc]/15">
                  <p className="text-[#1a1c1a] font-extrabold" style={{ fontSize: "1.6rem", lineHeight: "1.5", fontFamily:"'Newsreader',serif" }}>
                    Featured in Forbes, GQ, Entrepreneur, USA Today, Rolling Stone, and 3,481+ more publications.
                  </p>
                  <p className="text-[#1a1c1a] font-bold mt-3" style={{ fontSize: "1.2rem", fontFamily:"'Manrope',sans-serif" }}>
                    All features are guaranteed. Money back if we don&apos;t deliver.
                  </p>
                </div>
              </div>
            )}

            </div>{/* end report content */}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-[#f9faf5] border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-8 py-12 max-w-7xl mx-auto gap-4">
          <div className="text-xs tracking-widest uppercase text-slate-400" style={{fontFamily:"'Public Sans',sans-serif"}}>
            &copy; 2025 Rep500. All rights reserved. Confidentiality Guaranteed.
          </div>
          <div className="flex flex-wrap gap-4 md:gap-8">
            <a className="text-xs tracking-widest uppercase text-slate-400 hover:text-[#0d1b2a] transition-colors" href="/privacy" style={{fontFamily:"'Public Sans',sans-serif"}}>Privacy Policy</a>
            <a className="text-xs tracking-widest uppercase text-slate-400 hover:text-[#0d1b2a] transition-colors" href="/terms" style={{fontFamily:"'Public Sans',sans-serif"}}>Terms of Service</a>
            <button className="text-xs tracking-widest uppercase text-slate-400 hover:text-[#0d1b2a] transition-colors" onClick={() => { setContactModal({ open: true, packageName: "" }); setContactSent(false); setContactForm({ name: "", email: "" }); }} style={{fontFamily:"'Public Sans',sans-serif"}}>Contact</button>
          </div>
        </div>
      </footer>

      {/* ── Contact Modal ──────────────────────────────────────── */}
      {contactModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setContactModal({ open: false, packageName: "" })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            {!contactSent ? (
              <>
                <button
                  onClick={() => setContactModal({ open: false, packageName: "" })}
                  className="absolute top-4 right-4 text-[#74777d] hover:text-[#1a1c1a] text-xl leading-none"
                >&times;</button>
                <h3 className="text-lg font-bold text-[#1a1c1a] mb-1" style={{fontFamily:"'Newsreader',serif"}}>{contactModal.packageName ? "Get Started with Reputation500" : "Contact Rep500"}</h3>
                {contactModal.packageName && (
                  <p className="text-sm text-[#74777d] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>
                    Package: <span className="font-medium text-[#1B263B]">{contactModal.packageName}</span>
                  </p>
                )}
                <p className="text-xs text-[#74777d] mb-5" style={{fontFamily:"'Manrope',sans-serif"}}>
                  {contactModal.packageName ? "Fill in your details and our reputation expert will contact you within 24 hours." : "Have a question or need help? Fill in your details and we\u2019ll get back to you within 24 hours."}
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!contactForm.name.trim() || !contactForm.email.trim()) return;
                    try {
                      await fetch("/api/contact", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: contactForm.name.trim(),
                          email: contactForm.email.trim(),
                          packageName: contactModal.packageName,
                          reportName: report?.name || "",
                          reportScore: report?.score || 0,
                        }),
                      });
                      setContactSent(true);
                    } catch {
                      setContactSent(true);
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-sm font-medium text-[#44474c] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full h-11 px-4 rounded-lg border border-[#c4c6cc]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B263B]/20 focus:border-transparent"
                      placeholder="John Smith"
                      style={{fontFamily:"'Manrope',sans-serif"}}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#44474c] mb-1" style={{fontFamily:"'Manrope',sans-serif"}}>Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full h-11 px-4 rounded-lg border border-[#c4c6cc]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B263B]/20 focus:border-transparent"
                      placeholder="john@example.com"
                      style={{fontFamily:"'Manrope',sans-serif"}}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-[#101b30] to-[#3c475d] hover:shadow-lg text-white font-semibold rounded-lg text-sm transition"
                    style={{fontFamily:"'Manrope',sans-serif"}}
                  >
                    Send My Details
                  </button>
                </form>
                <p className="text-xs text-[#74777d] mt-3 text-center" style={{fontFamily:"'Manrope',sans-serif"}}>
                  Your information is only shared with Reputation500. No spam.
                </p>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-green-500 text-2xl" style={{fontVariationSettings:'"FILL" 1'}}>check_circle</span>
                </div>
                <h3 className="text-lg font-bold text-[#1a1c1a] mb-2" style={{fontFamily:"'Newsreader',serif"}}>Request Sent!</h3>
                <p className="text-sm text-[#74777d] mb-4" style={{fontFamily:"'Manrope',sans-serif"}}>
                  A Reputation500 expert will reach out to you shortly at <span className="font-medium">{contactForm.email}</span> to discuss the <span className="font-medium text-[#1B263B]">{contactModal.packageName}</span> package.
                </p>
                <button
                  onClick={() => setContactModal({ open: false, packageName: "" })}
                  className="text-sm text-[#1B263B] hover:underline"
                  style={{fontFamily:"'Manrope',sans-serif"}}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

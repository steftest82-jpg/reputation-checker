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
    markets: { country: string; strength: string; evidence: string }[];
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
}

// ── Loading steps ───────────────────────────────────────────────────
const LOADING_STEPS = [
  { label: "Preparing your reputation analysis...", sublabel: "Setting up AI engines", duration: 2000 },
  { label: "Scanning Google Search results...", sublabel: "Analyzing top 20 results", duration: 3000 },
  { label: "Scanning news & magazine features...", sublabel: "Checking 500+ news sources", duration: 3000 },
  { label: "Analyzing autocomplete & suggestions...", sublabel: "Evaluating public perception signals", duration: 2000 },
  { label: "Verifying domain & digital assets...", sublabel: "Checking ownership and control", duration: 2000 },
  { label: "Checking forums & social mentions...", sublabel: "Reddit, Quora, and social platforms", duration: 3000 },
  { label: "Running AI-powered deep analysis...", sublabel: "Processing 10,000,000+ data points", duration: 8000 },
  { label: "Calculating reputation score...", sublabel: "Finalizing your comprehensive report", duration: 3000 },
];

const LOADING_TIPS = [
  "Did you know? 85% of consumers research online before making a decision.",
  "A single negative result on page 1 can cost up to 22% of business.",
  "It takes 40 positive reviews to undo the damage of one negative review.",
  "75% of people never scroll past the first page of Google.",
  "Your online reputation is your most valuable digital asset.",
  "Companies with strong online reputations see 31% more revenue growth.",
];

function LoadingProgress() {
  const [step, setStep] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (step >= LOADING_STEPS.length - 1) return;
    const timer = setTimeout(() => setStep((s) => s + 1), LOADING_STEPS[step].duration);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    const tipTimer = setInterval(() => setTipIndex((i) => (i + 1) % LOADING_TIPS.length), 5000);
    return () => clearInterval(tipTimer);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  const progress = Math.min(Math.round((step / LOADING_STEPS.length) * 100), 95);
  const currentStep = LOADING_STEPS[Math.min(step, LOADING_STEPS.length - 1)];

  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: "calc(100vh - 80px)" }}>
      <div className="max-w-lg w-full mx-auto text-center px-4">
        {/* Compact spinner + title */}
        <div className="relative inline-block mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500 loading-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-1 text-gray-900">Preparing Your Reputation Report</h3>
        <p className="text-gray-500 text-xs mb-1 leading-snug">This usually takes 60–140 seconds, as we analyse 10+ Million touchpoints across the web. Please don&apos;t close this page.</p>
        <p className="text-gray-400 text-xs mb-4">Elapsed: {elapsed}s &middot; {progress}% complete</p>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>

        {/* Current step - animated swap instead of full list */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 min-h-[70px] flex items-center justify-center">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 loading-pulse">{currentStep.label}</p>
              <p className="text-xs text-blue-500">{currentStep.sublabel}</p>
            </div>
          </div>
        </div>

        {/* Step dots - compact progress indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {LOADING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < step ? "w-2 h-2 bg-green-500" : i === step ? "w-3 h-3 bg-blue-500" : "w-2 h-2 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Completed count */}
        <p className="text-xs text-gray-400 mb-4">
          Step {Math.min(step + 1, LOADING_STEPS.length)} of {LOADING_STEPS.length} &mdash; {step > 0 ? `${step} completed` : "Starting..."}
        </p>

        {/* Rotating tips */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-blue-400 font-medium uppercase tracking-wide mb-0.5">Did you know?</p>
          <p className="text-sm text-blue-700 leading-snug transition-all duration-500">{LOADING_TIPS[tipIndex]}</p>
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
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="14" />
        <circle
          cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="14"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          transform="rotate(-90 100 100)" style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
        <text x="100" y="90" textAnchor="middle" fontSize="44" fontWeight="700" fill={color}>{score}</text>
        <text x="100" y="116" textAnchor="middle" fontSize="14" fill="#64748b">/ 100</text>
      </svg>
      <span className="mt-1 text-lg font-semibold" style={{ color }}>{label}</span>
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
        {nPct > 0 && <div className="bg-gray-300" style={{ width: `${nPct}%` }} />}
        {negPct > 0 && <div className="bg-red-500" style={{ width: `${negPct}%` }} />}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Positive ({breakdown.positive})</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" /> Neutral ({breakdown.neutral})</span>
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
        <span className="text-gray-700">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
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
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${styles[level] || styles.low}`}>{level}</span>;
}

function SentimentDot({ sentiment }: { sentiment: string }) {
  const color = sentiment === "positive" ? "bg-green-500" : sentiment === "negative" ? "bg-red-500" : "bg-gray-400";
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
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${styles[level] || styles.moderate}`}>
      {level} risk
    </span>
  );
}

function CategoryTag({ cat }: { cat: string }) {
  const labels: Record<string, string> = {
    organic: "Organic", news: "News", review: "Review", social: "Social", complaint: "Complaint", legal: "Legal",
  };
  const colors: Record<string, string> = {
    organic: "bg-gray-100 text-gray-600", news: "bg-purple-100 text-purple-600", review: "bg-indigo-100 text-indigo-600",
    social: "bg-sky-100 text-sky-600", complaint: "bg-red-100 text-red-600", legal: "bg-orange-100 text-orange-600",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[cat] || colors.organic}`}>{labels[cat] || cat}</span>;
}

// ── Bullet point text helper ────────────────────────────────────────
function BulletText({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;
  // Split by sentence-ending punctuation followed by space, or by newlines
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
  if (sentences.length <= 1) {
    return <p className={className}>{text}</p>;
  }
  return (
    <ul className={`space-y-1.5 ${className}`}>
      {sentences.map((s, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-blue-400 shrink-0 mt-0.5">&#8226;</span>
          <span>{s}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Card wrapper ────────────────────────────────────────────────────
function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border-2 border-gray-300 p-6 ${className}`}>
      {title && <h3 className="font-semibold mb-4 text-gray-900" style={{ fontSize: "1.15rem" }}>{title}</h3>}
      {children}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────
export default function Home() {
  const [name, setName] = useState("");
  const [type, setType] = useState<"person" | "company">("person");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "ai-llm" | "influencers" | "reviews" | "backlinks" | "crisis" | "suspicious" | "results" | "problems" | "strengths">("overview");
  const [contactModal, setContactModal] = useState<{ open: boolean; packageName: string }>({ open: false, packageName: "" });
  const [contactForm, setContactForm] = useState({ name: "", email: "" });
  const [contactSent, setContactSent] = useState(false);
  const [emailGated, setEmailGated] = useState(true);
  const [gateEmail, setGateEmail] = useState("");
  const [gateSending, setGateSending] = useState(false);
  const [gateError, setGateError] = useState("");
  const [pdfDownloading, setPdfDownloading] = useState(false);

  async function handleDownloadPdf() {
    if (!report) return;
    setPdfDownloading(true);
    try {
      // Send only essential report data to avoid payload size issues
      const slimReport = {
        name: report.name,
        entityType: report.entityType,
        score: report.score,
        summary: report.summary,
        executiveBrief: report.executiveBrief,
        riskLevel: report.riskLevel,
        sentimentBreakdown: report.sentimentBreakdown,
        results: report.results?.slice(0, 20) || [],
        problems: report.problems || [],
        strengths: report.strengths || [],
        recommendations: report.recommendations || [],
        categoryScores: report.categoryScores,
        serpBreakdown: report.serpBreakdown,
        socialPresenceDetail: report.socialPresenceDetail,
        reviewSummary: report.reviewSummary,
        autocompleteSentiment: report.autocompleteSentiment,
        domainInfo: report.domainInfo,
        packageRecommendations: report.packageRecommendations,
        dataStats: report.dataStats,
        personalInfluence: report.personalInfluence,
        crisisDetection: report.crisisDetection,
        backlinkProfile: report.backlinkProfile,
        conversationSentiment: report.conversationSentiment,
        reviewDashboard: report.reviewDashboard,
      };
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "__download__", report: slimReport }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("PDF API error:", res.status, errText);
        return;
      }
      const blob = await res.blob();
      if (blob.size === 0) {
        console.error("PDF blob is empty");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reputation500-Report-${report.name.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setPdfDownloading(false);
    }
  }

  function handleShareLinkedIn() {
    if (!report) return;
    const text = `I just scored ${report.score}/100 on my Online Reputation Check by @Reputation500! ${report.score >= 90 ? "Excellent" : "Good"} reputation confirmed. Check yours at`;
    const url = "https://reputation500.com";
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`, "_blank");
  }

  function handleShareX() {
    if (!report) return;
    const text = `I scored ${report.score}/100 on my Online Reputation Check by @Reputation500! ${report.score >= 90 ? "Excellent" : "Good"} reputation. Check yours:`;
    const url = "https://reputation500.com";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    setReport(null);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setReport(data);
      setActiveTab("overview");
      setEmailGated(true);
      setGateEmail("");
      setGateError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "ai-llm" as const, label: "AI / LLM Appearance" },
    { key: "influencers" as const, label: "Influencers" },
    ...(report?.entityType === "company" ? [{ key: "reviews" as const, label: "Reviews Dashboard" }] : []),
    { key: "backlinks" as const, label: "Backlink Profile" },
    { key: "crisis" as const, label: "Risk & Crisis" },
    { key: "suspicious" as const, label: "Suspicious Activity" },
    { key: "results" as const, label: "Search Results" },
    { key: "problems" as const, label: "Problems", count: report?.problems.length },
    { key: "strengths" as const, label: "Strengths", count: report?.strengths.length },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-300 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Online Reputation Checker</h1>
            <p className="text-xs text-gray-400">by <a href="https://reputation500.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">Reputation500</a></p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 flex-1 w-full" style={{ paddingTop: "2px" }}>
        {/* Search form */}
        {!report && !loading && (
          <div className="max-w-2xl mx-auto text-center pt-10">
            <h2 className="text-4xl font-bold mb-4" style={{ fontSize: "2.4rem" }}>Check your Online Reputation in seconds</h2>
            <p className="text-gray-500 mb-8" style={{ fontSize: "1.2rem", lineHeight: "1.7" }}>
              Enter a person or company name to get a comprehensive AI-powered reputation analysis based on Google Search, AI answers, News, Magazines, Reviews, Forums and all Social Media.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="inline-flex rounded-lg border-2 border-gray-300 p-1 bg-white">
                <button type="button" onClick={() => setType("person")}
                  className={`px-5 py-2.5 rounded-md font-medium transition ${type === "person" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`} style={{ fontSize: "1rem" }}>
                  Person
                </button>
                <button type="button" onClick={() => setType("company")}
                  className={`px-5 py-2.5 rounded-md font-medium transition ${type === "company" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`} style={{ fontSize: "1rem" }}>
                  Company
                </button>
              </div>
              <div className="relative">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={type === "person" ? "e.g. John Smith" : "e.g. Acme Corporation"}
                  className="w-full h-16 pl-5 pr-36 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" style={{ fontSize: "1.15rem" }} />
                <button type="submit"
                  className="absolute right-2.5 top-2.5 h-11 px-7 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition" style={{ fontSize: "1.05rem" }}>
                  Check
                </button>
              </div>
              {error && <p className="text-red-500" style={{ fontSize: "0.95rem" }}>{error}</p>}
            </form>

            {/* Touchpoints statement */}
            <p className="text-gray-400 mt-4" style={{ fontSize: "0.85rem" }}>
              Reputation Checker analyzes 10,000,000+ touchpoints across search engines, AI engines, forums, reviews, and social media.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 text-left">
              {[
                { icon: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z", title: "SERP Analysis", desc: "Top 20 Google results" },
                { icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2", title: "News & Magazines", desc: "500+ publications scanned" },
                { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: "AI & Sentiment", desc: "AI-powered deep analysis" },
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "Risk Score", desc: "0-100 reputation score" },
              ].map((f, i) => (
                <div key={i} className="bg-white rounded-xl border-2 border-gray-300 p-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                  <p className="font-semibold" style={{ fontSize: "1rem" }}>{f.title}</p>
                  <p className="text-gray-400" style={{ fontSize: "0.85rem" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingProgress />}

        {/* Report */}
        {report && !loading && (
          <div>
            <button onClick={() => { setReport(null); setName(""); }}
              className="mb-6 text-sm text-blue-500 hover:underline flex items-center gap-1">&larr; New check</button>

            {/* Reputation500 report branding */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-300">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">Reputation500</p>
                <p className="text-xs text-gray-400">Online Reputation Report</p>
              </div>
            </div>

            {/* Score header */}
            <div className="report-section bg-white rounded-2xl shadow-sm border-2 border-gray-300 p-8 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ScoreGauge score={report.score} />
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
                    <h2 className="text-2xl font-bold">{report.name}</h2>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium uppercase">{report.entityType}</span>
                    <RiskBadge level={report.riskLevel} />
                  </div>
                  <BulletText text={report.summary} className="text-gray-600 leading-relaxed mb-4" />
                  {report.sentimentBreakdown && <SentimentChart breakdown={report.sentimentBreakdown} />}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {/* Download PDF */}
                    <button onClick={handleDownloadPdf} disabled={pdfDownloading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition">
                      {pdfDownloading ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating PDF...</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Download PDF Report</>
                      )}
                    </button>

                    {/* Share buttons (only if score >= 80) */}
                    {report.score >= 80 && (
                      <>
                        <button onClick={handleShareLinkedIn}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0077b5] hover:bg-[#006097] text-white rounded-lg text-sm font-medium transition">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          Share on LinkedIn
                        </button>
                        <button onClick={handleShareX}
                          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          Share on X
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Data stats row */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6 pt-6 border-t-2 border-gray-200">
                {[
                  { label: "Results Analyzed", value: report.dataStats.totalResults },
                  { label: "News Mentions", value: report.dataStats.newsCount },
                  { label: "Social Profiles", value: report.dataStats.socialCount },
                  { label: "Review Sites", value: report.dataStats.reviewCount },
                  { label: "Complaint Sites", value: report.dataStats.complaintCount },
                  { label: "Domains in Top 10", value: report.dataStats.uniqueDomainsInTop10 },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── EMAIL GATE: everything below score is blurred until email provided ── */}
            <div className="relative">
              {emailGated && (
                <div className="absolute inset-0 z-30 flex items-start justify-center pt-12">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-8 mx-4">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">Your Report is Ready!</h3>
                      <p className="text-sm text-gray-500">Enter your email to receive the full report as a PDF and unlock the detailed analysis below.</p>
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!gateEmail.trim()) return;
                        setGateSending(true);
                        setGateError("");
                        try {
                          // Send lead notification to Reputation500
                          const res = await fetch("/api/contact", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              name: gateEmail.trim(),
                              email: gateEmail.trim(),
                              packageName: "Report Unlock",
                              reportName: report?.name || "",
                              reportScore: report?.score || 0,
                              reportData: report || null,
                            }),
                          });
                          if (!res.ok) {
                            const err = await res.json().catch(() => ({}));
                            console.error("Lead email failed:", res.status, err);
                          }
                        } catch (err) {
                          console.error("Lead email fetch error:", err);
                        } finally {
                          setGateSending(false);
                          setEmailGated(false);
                        }
                      }}
                      className="space-y-3"
                    >
                      <input
                        type="email"
                        required
                        value={gateEmail}
                        onChange={(e) => setGateEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full h-12 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {gateError && <p className="text-red-500 text-xs">{gateError}</p>}
                      <button
                        type="submit"
                        disabled={gateSending}
                        className="w-full h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
                      >
                        {gateSending ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Unlocking Report...
                          </>
                        ) : (
                          "Unlock Full Report"
                        )}
                      </button>
                    </form>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      We&apos;ll email you the full PDF report. No spam, ever.
                    </p>
                  </div>
                </div>
              )}
              <div className={emailGated ? "blur-sm pointer-events-none select-none" : ""}>

            {/* Executive brief */}
            {report.executiveBrief && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2 uppercase tracking-wide" style={{ fontSize: "1rem" }}>Executive Brief</h3>
                <BulletText text={report.executiveBrief} className="text-gray-700 leading-relaxed" />
              </div>
            )}

            {/* Media presence warning */}
            {report.mediaPresenceWarning && !report.mediaPresenceWarning.hasAdequateMedia && report.mediaPresenceWarning.warning && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  </span>
                  <div>
                    <h3 className="font-bold text-orange-800 mb-1" style={{ fontSize: "1rem" }}>Low Media Coverage Detected</h3>
                    <p className="text-orange-700 leading-relaxed" style={{ fontSize: "0.95rem" }}>{report.mediaPresenceWarning.warning}</p>
                    <p className="text-orange-600 text-sm mt-2 font-medium">
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
                className="block mb-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 text-white hover:from-blue-700 hover:to-blue-600 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Want to improve your score?</p>
                      <p className="text-blue-100 text-xs">See tailored solutions from Reputation500 experts</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-4 py-2 rounded-lg group-hover:bg-white/30 transition shrink-0">
                    View Solutions &darr;
                  </span>
                </div>
              </a>
            )}

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b-2 border-gray-300 overflow-x-auto">
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
                    activeTab === tab.key ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                      tab.key === "problems" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                    }`}>{tab.count}</span>
                  )}
                </button>
              ))}
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
                      {/* Trend badge */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          report.sentimentTimeline.trend === "improving" ? "bg-green-100 text-green-700"
                          : report.sentimentTimeline.trend === "declining" ? "bg-red-100 text-red-700"
                          : report.sentimentTimeline.trend === "stable" ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                        }`}>
                          {report.sentimentTimeline.trend === "improving" ? "&#8593; Improving"
                           : report.sentimentTimeline.trend === "declining" ? "&#8595; Declining"
                           : report.sentimentTimeline.trend === "stable" ? "&#8596; Stable"
                           : "? Insufficient Data"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{report.sentimentTimeline.trendAnalysis}</p>

                      {/* Monthly trend bars */}
                      {report.sentimentTimeline?.monthlyTrend?.length > 0 && (
                        <div className="flex items-end gap-1.5 mb-4 h-20">
                          {report.sentimentTimeline?.monthlyTrend?.map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div className={`w-full rounded-t ${
                                m.sentiment === "positive" ? "bg-green-400" : m.sentiment === "negative" ? "bg-red-400" : m.sentiment === "mixed" ? "bg-yellow-400" : "bg-gray-300"
                              }`} style={{ height: m.sentiment === "positive" ? "100%" : m.sentiment === "mixed" ? "60%" : m.sentiment === "negative" ? "30%" : "50%" }} />
                              <span className="text-xs text-gray-400 truncate w-full text-center" style={{ fontSize: "10px" }}>{m.month.split(" ")[0]?.slice(0, 3)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recent negatives / crisis alerts */}
                      {report.sentimentTimeline?.recentNegatives?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Recent Negative Events</p>
                          <div className="space-y-2">
                            {report.sentimentTimeline?.recentNegatives?.map((neg, i) => (
                              <div key={i} className={`rounded-lg p-3 border ${neg.isPotentialCrisis ? "border-red-300 bg-red-50" : "border-yellow-200 bg-yellow-50"}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  {neg.isPotentialCrisis && (
                                    <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-bold">POTENTIAL CRISIS</span>
                                  )}
                                  <span className="text-xs text-gray-500">{neg.dateFound} ({neg.daysAgo}d ago)</span>
                                </div>
                                <p className="text-sm font-medium text-gray-800">{neg.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{neg.summary}</p>
                                {neg.source && (
                                  <a href={neg.source} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">{neg.source}</a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                        }`}>{report.futureRiskAssessment.overallRisk} risk</span>
                        <span className="text-sm text-gray-500">Score: {report.futureRiskAssessment.riskScore}/10</span>
                      </div>
                      <BulletText text={report.futureRiskAssessment.analysis} className="text-sm text-gray-600 mb-4 leading-relaxed" />
                      {report.futureRiskAssessment?.risks?.length > 0 && (
                        <div className="space-y-2.5">
                          {report.futureRiskAssessment?.risks?.map((risk, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${risk.impact === "high" ? "bg-red-500" : risk.impact === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                                <span className="text-sm font-medium text-gray-800">{risk.risk}</span>
                              </div>
                              <div className="flex gap-3 text-xs text-gray-400 mb-1.5">
                                <span>Likelihood: <span className="font-medium text-gray-600">{risk.likelihood}</span></span>
                                <span>Impact: <span className="font-medium text-gray-600">{risk.impact}</span></span>
                              </div>
                              <p className="text-xs text-blue-600">{risk.mitigation}</p>
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
                        }`}>{report.personalInfluence.verdict}</span>
                        <span className="text-sm text-gray-500">Score: {report.personalInfluence.score}/10</span>
                      </div>
                      <BulletText text={report.personalInfluence.analysis} className="text-sm text-gray-600 mb-3 leading-relaxed" />
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
                            <div key={item.k} className={`rounded-lg p-2 border text-center ${val?.found ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                              <span className={`block text-xs font-medium ${val?.found ? "text-green-700" : "text-gray-400"}`}>{val?.found ? "Found" : "Missing"}</span>
                              <span className="text-xs text-gray-600">{item.label}</span>
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
                        }`}>{report.serpVolatility.level}</span>
                        <span className={`text-xs font-medium ${
                          report.serpVolatility.trend === "improving" ? "text-green-600" : report.serpVolatility.trend === "declining" ? "text-red-600" : "text-gray-500"
                        }`}>{report.serpVolatility.trend === "improving" ? "Trend: Improving" : report.serpVolatility.trend === "declining" ? "Trend: Declining" : "Trend: Stable"}</span>
                      </div>
                      <BulletText text={report.serpVolatility.analysis} className="text-sm text-gray-600 mb-3 leading-relaxed" />
                      {report.serpVolatility?.monthlyChanges?.length > 0 && (
                        <div className="flex items-end gap-1.5 mb-3 h-20">
                          {report.serpVolatility?.monthlyChanges?.map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1" title={m.changeNote}>
                              <div className={`w-full rounded-t ${
                                m.sentiment === "positive" ? "bg-green-400" : m.sentiment === "negative" ? "bg-red-400" : m.sentiment === "mixed" ? "bg-yellow-400" : "bg-gray-300"
                              }`} style={{ height: m.sentiment === "positive" ? "100%" : m.sentiment === "mixed" ? "60%" : m.sentiment === "negative" ? "30%" : "50%" }} />
                              <span className="text-xs text-gray-400 truncate w-full text-center" style={{ fontSize: "10px" }}>{m.month.split(" ")[0]?.slice(0, 3)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {report.serpVolatility?.corrections?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-blue-600 mb-2">Corrections to Improve:</p>
                          {report.serpVolatility?.corrections?.map((c, i) => (
                            <p key={i} className="text-xs text-gray-600 flex gap-1.5 mb-1"><span className="text-blue-500 shrink-0">{i + 1}.</span> {c}</p>
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
                        }`}>{report.conversationSentiment.score}/10</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          report.conversationSentiment.verdict === "positive" || report.conversationSentiment.verdict === "mostly_positive" ? "bg-green-100 text-green-700"
                          : report.conversationSentiment.verdict === "negative" ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                        }`}>{report.conversationSentiment.verdict.replace(/_/g, " ")}</span>
                      </div>
                      <BulletText text={report.conversationSentiment.analysis} className="text-sm text-gray-600 mb-3 leading-relaxed" />
                      {report.conversationSentiment?.topNegativeTopics?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Top Negative Topics</p>
                          {report.conversationSentiment?.topNegativeTopics?.map((t, i) => (
                            <div key={i} className="mb-2 bg-red-50 rounded-lg p-2 border border-red-200">
                              <p className="text-sm font-medium text-gray-800">{t.topic}</p>
                              <p className="text-xs text-gray-500">Source: {t.source} | Frequency: {t.frequency} | Impact: {t.impact}</p>
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
                          <div key={i} className="flex items-start gap-3 pb-2.5 border-b border-gray-100 last:border-0 last:pb-0">
                            <span className="text-xs font-mono text-gray-400 bg-gray-50 rounded px-1.5 py-0.5 shrink-0">#{link.position}</span>
                            <div className="flex-1 min-w-0">
                              <a href={link.link} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium text-sm line-clamp-1">{link.title}</a>
                              <p className="text-xs text-gray-400 truncate">{link.link}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <SentimentDot sentiment={link.sentiment} />
                              {link.isOwned && (
                                <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-xs font-medium">Owned</span>
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
                        <p className="font-medium text-sm">{report.domainInfo.domain}</p>
                        <p className="text-xs text-gray-500">
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
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </span>
                        <div>
                          <p className="font-medium">{report.knowledgeGraph.title}</p>
                          {report.knowledgeGraph.type && <p className="text-xs text-gray-400 mb-1">{report.knowledgeGraph.type}</p>}
                          {report.knowledgeGraph.description && <p className="text-sm text-gray-600">{report.knowledgeGraph.description}</p>}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card title="Google Knowledge Panel">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                          </span>
                          <div>
                            <p className="font-semibold text-yellow-800 text-sm mb-1">No Knowledge Panel Detected</p>
                            <p className="text-sm text-yellow-700 leading-relaxed">
                              A Google Knowledge Panel significantly boosts credibility and trust. Without one, you&apos;re missing a key trust signal that competitors may have.
                            </p>
                            <div className="mt-3 bg-white rounded-lg p-3 border border-yellow-200">
                              <p className="text-xs font-semibold text-gray-700 mb-1.5">How to get a Knowledge Panel:</p>
                              <ul className="text-xs text-gray-600 space-y-1">
                                <li className="flex gap-1.5"><span className="text-blue-500">1.</span> Get featured in authoritative media & magazines</li>
                                <li className="flex gap-1.5"><span className="text-blue-500">2.</span> Create a Wikipedia presence (if notable)</li>
                                <li className="flex gap-1.5"><span className="text-blue-500">3.</span> Claim & optimize your Google Business Profile</li>
                                <li className="flex gap-1.5"><span className="text-blue-500">4.</span> Build consistent structured data across the web</li>
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
                        }`}>{report.googleImagesAnalysis.ranking}</span>
                        <span className="text-sm text-gray-500">
                          ~{report.googleImagesAnalysis.ownedImagesPct}% owned/controlled images
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{report.googleImagesAnalysis.analysis}</p>
                      {report.googleImagesAnalysis?.concerns?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-red-500 mb-1">Concerns:</p>
                          <ul className="space-y-1">
                            {report.googleImagesAnalysis?.concerns?.map((c, i) => (
                              <li key={i} className="text-xs text-red-600 flex gap-1.5">
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
                    <p className="text-sm text-gray-600 mb-3">{report.socialPresenceDetail.assessment}</p>
                    {report.socialPresenceDetail?.found?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1.5">Found:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {report.socialPresenceDetail.found.map((p, i) => (
                            <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {report.socialPresenceDetail?.missing?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1.5">Missing:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {report.socialPresenceDetail.missing.map((p, i) => (
                            <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Review Summary */}
                  <Card title="Review Sites">
                    <p className="text-sm text-gray-600 mb-2">{report.reviewSummary.assessment}</p>
                    {report.reviewSummary?.platforms_found?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {report.reviewSummary.platforms_found.map((p, i) => (
                          <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">{p}</span>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Video / YouTube Sentiment */}
                  {report.videoSentimentAnalysis && (
                    <Card title="YouTube / Video Sentiment">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-600">Video sentiment:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          report.videoSentimentAnalysis.overallSentiment === "positive" ? "bg-green-100 text-green-700"
                          : report.videoSentimentAnalysis.overallSentiment === "negative" ? "bg-red-100 text-red-700"
                          : report.videoSentimentAnalysis.overallSentiment === "mixed" ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                        }`}>{report.videoSentimentAnalysis.overallSentiment}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{report.videoSentimentAnalysis.analysis}</p>
                      {report.videoSentimentAnalysis?.videos?.length > 0 ? (
                        <div className="space-y-2">
                          {report.videoSentimentAnalysis.videos.slice(0, 5).map((v, i) => (
                            <div key={i} className={`rounded-lg p-3 border ${
                              v.sentiment === "negative" ? "border-red-200 bg-red-50" : v.sentiment === "positive" ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <SentimentDot sentiment={v.sentiment} />
                                {v.isOwned && <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-xs font-medium">Owned</span>}
                                <span className="text-xs text-gray-400">{v.views?.toLocaleString()} views</span>
                              </div>
                              <a href={v.link} target="_blank" rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline font-medium line-clamp-1">{v.title}</a>
                              <p className="text-xs text-gray-500 mt-0.5">by {v.channel}</p>
                              <p className="text-xs text-gray-500 mt-0.5 italic">{v.summary}</p>
                              {(v.saves || v.shares || v.commentSentiment) && (
                                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                                  {v.saves && <span>Saves: {v.saves}</span>}
                                  {v.shares && <span>Shares: {v.shares}</span>}
                                  {v.commentSentiment && <span>Comments: <span className={v.commentSentiment === "positive" ? "text-green-600" : v.commentSentiment === "negative" ? "text-red-600" : "text-gray-500"}>{v.commentSentiment}</span></span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-3">No YouTube videos found for this entity.</p>
                      )}
                      {report.videoSentimentAnalysis?.concerns?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-red-500 mb-1">Concerns:</p>
                          {report.videoSentimentAnalysis?.concerns?.map((c, i) => (
                            <p key={i} className="text-xs text-red-600">&#9888; {c}</p>
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
                          <span className="text-sm text-gray-600">Forum sentiment:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            report.forumSentiment.overallSentiment === "positive" ? "bg-green-100 text-green-700"
                            : report.forumSentiment.overallSentiment === "negative" ? "bg-red-100 text-red-700"
                            : report.forumSentiment.overallSentiment === "mixed" ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                          }`}>{report.forumSentiment.overallSentiment}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{report.forumSentiment.analysis}</p>
                        <div className="space-y-2.5">
                          {report.forumSentiment.conversations.map((conv, i) => (
                            <div key={i} className={`rounded-lg p-3 border ${
                              conv.sentiment === "negative" ? "border-red-200 bg-red-50" : conv.sentiment === "positive" ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase ${
                                  conv.platform === "reddit" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                                }`}>{conv.platform}</span>
                                <SentimentDot sentiment={conv.sentiment} />
                                {conv.isRisk && <span className="text-xs text-red-500 font-medium">&#9888; Risk</span>}
                              </div>
                              <a href={conv.link} target="_blank" rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline font-medium line-clamp-1">{conv.title}</a>
                              <p className="text-xs text-gray-500 mt-0.5">{conv.summary}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-400">No Reddit or Quora discussions found.</p>
                        <p className="text-xs text-gray-400 mt-1">This is generally positive - no public forum complaints detected.</p>
                      </div>
                    )}
                  </Card>

                  {/* Autocomplete */}
                  <Card title="Google Autocomplete">
                    <p className="text-sm text-gray-600 mb-3">{report.autocompleteSentiment.analysis}</p>
                    {report.autocompleteSentiment?.negative_terms?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-red-500 mb-1">Concerning:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {report.autocompleteSentiment.negative_terms.map((t, i) => (
                            <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {(report.autocomplete || []).filter(s => !report.autocompleteSentiment?.negative_terms?.includes(s)).map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">{s}</span>
                      ))}
                    </div>
                  </Card>

                  {/* Recommendations (top 4) */}
                  <Card title="Top Recommendations">
                    <div className="space-y-3">
                      {report.recommendations.slice(0, 4).map((rec, i) => {
                        const borderColor = rec.priority === "high" ? "border-l-red-500" : rec.priority === "medium" ? "border-l-yellow-400" : "border-l-blue-400";
                        const bgColor = rec.priority === "high" ? "bg-red-50/50" : rec.priority === "medium" ? "bg-yellow-50/50" : "bg-blue-50/50";
                        return (
                          <div key={i} className={`border-l-4 ${borderColor} ${bgColor} rounded-r-lg p-3`}>
                            <div className="flex items-center gap-2 mb-1">
                              <SeverityBadge level={rec.priority} />
                            </div>
                            <p className="text-sm font-medium text-gray-800">{rec.action}</p>
                            <p className="text-xs text-gray-500 mt-1">{rec.reason}</p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Industry Benchmark (companies only) */}
                  {report.industryBenchmark?.applicable && (
                    <Card title={`Industry Benchmark: ${report.industryBenchmark.industry}`}>
                      <div className="space-y-3 mb-4">
                        {/* Market Leader bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Market Leaders</span>
                            <span className="font-bold text-green-600">{report.industryBenchmark.marketLeaderScore}/100</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${report.industryBenchmark.marketLeaderScore}%` }} />
                          </div>
                        </div>
                        {/* Industry Average bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Industry Average</span>
                            <span className="font-bold text-yellow-600">{report.industryBenchmark.industryAverage}/100</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${report.industryBenchmark.industryAverage}%` }} />
                          </div>
                        </div>
                        {/* Your score bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium">{report.name}</span>
                            <span className="font-bold text-blue-600">{report.score}/100</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${report.score}%` }} />
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">{report.industryBenchmark.analysis}</p>
                      {report.industryBenchmark.gap > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <p className="text-xs font-semibold text-blue-700 mb-1.5">Gap to Market Leader: {report.industryBenchmark.gap} points</p>
                          <ul className="space-y-1">
                            {report.industryBenchmark?.recommendations?.map((r, i) => (
                              <li key={i} className="text-xs text-blue-600 flex gap-1.5">
                                <span className="text-blue-500 shrink-0">{i + 1}.</span> {r}
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
                          : report.geographicPresence.scope === "regional" ? "bg-blue-100 text-blue-700"
                          : report.geographicPresence.scope === "national" ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                        }`}>{report.geographicPresence.scope}</span>
                        <span className="text-sm text-gray-500">Primary: {report.geographicPresence.primaryMarket}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{report.geographicPresence.analysis}</p>
                      {report.geographicPresence?.markets?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Top Markets</p>
                          <div className="space-y-1.5">
                            {report.geographicPresence.markets.slice(0, 10).map((m, i) => (
                              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-gray-100 last:border-0">
                                <span className="text-sm font-mono text-gray-400 w-5">{i + 1}</span>
                                <span className="text-sm font-medium text-gray-800 flex-1">{m.country}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  m.strength === "strong" ? "bg-green-100 text-green-700" : m.strength === "moderate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                }`}>{m.strength}</span>
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
                      <p className="text-xs text-gray-400 mb-3">How professional and trustworthy readers perceive each media outlet covering {report.name}.</p>
                      <div className="space-y-2">
                        {report.mediaBrandSentiment.outlets.map((o, i) => (
                          <div key={i} className="flex items-center gap-3 pb-2 border-b border-gray-100 last:border-0">
                            <span className="text-sm font-medium text-gray-800 flex-1">{o.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${o.tier === "premium" ? "bg-green-100 text-green-700" : o.tier === "mid-tier" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{o.tier}</span>
                            <span className={`text-sm font-bold ${o.sentimentScore >= 7 ? "text-green-600" : o.sentimentScore >= 5 ? "text-yellow-600" : "text-red-600"}`}>{o.sentimentScore}/10</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Average media sentiment: <span className="font-bold">{report.mediaBrandSentiment.averageScore}/10</span></p>
                      </div>
                      <BulletText text={report.mediaBrandSentiment.analysis} className="text-sm text-gray-600 mt-2 leading-relaxed" />
                    </Card>
                  )}

                  {/* Backlink Profile (overview) */}
                  {report.backlinkProfile && (
                    <Card title="Backlink Profile">
                      <div className="flex items-center gap-4 mb-3">
                        <span className={`text-2xl font-bold ${
                          report.backlinkProfile.healthScore >= 7 ? "text-green-600" : report.backlinkProfile.healthScore >= 4 ? "text-yellow-600" : "text-red-600"
                        }`}>{report.backlinkProfile.healthScore}/10</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Est. backlinks: <span className="font-semibold">{report.backlinkProfile.totalBacklinks}</span></p>
                          {report.backlinkProfile.toxicLinksDetected && (
                            <p className="text-xs text-red-500 font-medium">Toxic links detected ({report.backlinkProfile.toxicLinksCount})</p>
                          )}
                          {report.backlinkProfile.isVulnerable && !report.backlinkProfile.toxicLinksDetected && (
                            <p className="text-xs text-yellow-600 font-medium">Vulnerable to toxic link attacks</p>
                          )}
                        </div>
                      </div>
                      <BulletText text={report.backlinkProfile.analysis} className="text-sm text-gray-600 leading-relaxed" />
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
                        }`}>{report.crisisDetection.alertLevel === "none" ? "All Clear" : `${report.crisisDetection.alertLevel}`}</span>
                      </div>
                      <BulletText text={report.crisisDetection.summary} className="text-sm text-gray-600 mb-3 leading-relaxed" />
                      {report.crisisDetection.alerts.slice(0, 5).map((a, i) => (
                        <div key={i} className="mb-2 flex items-start gap-2">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.impact === "high" ? "bg-red-500" : a.impact === "medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                          <div>
                            <p className="text-sm text-gray-700">{a.title}</p>
                            <p className="text-xs text-gray-400">{a.source}</p>
                          </div>
                        </div>
                      ))}
                    </Card>
                  )}

                  {/* Reviews Dashboard (companies only — overview) */}
                  {report.reviewDashboard && report.entityType === "company" && (
                    <Card title="Reviews Dashboard">
                      <div className="flex items-center gap-4 mb-3">
                        <span className={`text-3xl font-bold ${
                          report.reviewDashboard.aggregatedRating >= 4 ? "text-green-600" : report.reviewDashboard.aggregatedRating >= 3 ? "text-yellow-600" : "text-red-600"
                        }`}>{report.reviewDashboard.aggregatedRating > 0 ? (report.reviewDashboard.aggregatedRating || 0).toFixed(1) : "N/A"}</span>
                        <div>
                          <p className="text-sm text-gray-600">{report.reviewDashboard.totalReviews} reviews across {report.reviewDashboard?.platforms?.length} platforms</p>
                          {report.reviewDashboard?.risks?.length > 0 && (
                            <p className="text-xs text-red-500 font-medium">{report.reviewDashboard?.risks?.length} potential risks detected</p>
                          )}
                        </div>
                      </div>
                      <BulletText text={report.reviewDashboard.trendAnalysis} className="text-sm text-gray-600 leading-relaxed" />
                    </Card>
                  )}

                  {/* People Also Ask */}
                  {report.peopleAlsoAsk?.length > 0 && (
                    <Card title="People Also Ask">
                      <ul className="space-y-1.5">
                        {report.peopleAlsoAsk.map((q, i) => (
                          <li key={i} className="text-sm text-gray-600 flex gap-2">
                            <span className="text-blue-400 shrink-0">Q:</span> {q}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* ── AI / LLM APPEARANCE TAB ─────────────────── */}
            {activeTab === "ai-llm" && report.aiLlmAppearance && (
              <div className="report-section space-y-6">
                {/* Score card */}
                <div className="bg-white rounded-2xl border-2 border-gray-300 p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Score circle */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-36 h-36">
                        <svg width="144" height="144" viewBox="0 0 144 144">
                          <circle cx="72" cy="72" r="60" fill="none" stroke="#e5e7eb" strokeWidth="10" />
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
                          <text x="72" y="88" textAnchor="middle" fontSize="12" fill="#94a3b8">/ 10</text>
                        </svg>
                      </div>
                      <span className={`mt-2 px-3 py-1 rounded-full text-sm font-bold uppercase ${
                        report.aiLlmAppearance.verdict === "strong" ? "bg-green-100 text-green-700"
                        : report.aiLlmAppearance.verdict === "moderate" ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                      }`}>{report.aiLlmAppearance.verdict}</span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">AI / LLM Prominence Score</h3>
                      <p className="text-gray-500 text-sm mb-4">
                        How well AI engines like ChatGPT, Claude, Gemini, and Perplexity reference and quote {report.name}.
                      </p>
                      <BulletText text={report.aiLlmAppearance.analysis} className="text-gray-700 leading-relaxed" />
                    </div>
                  </div>
                </div>

                {/* Alert if score < 6 */}
                {report.aiLlmAppearance.score < 6 && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                      </span>
                      <div>
                        <p className="font-bold text-red-800 mb-1">Low AI Visibility - Action Required</p>
                        <p className="text-sm text-red-700 leading-relaxed">
                          With a score of {report.aiLlmAppearance.score}/10, AI engines are unlikely to reference or accurately represent {report.name}.
                          As AI-powered search becomes the primary way people discover information, this gap will widen.
                          You can fix this with an active content and media strategy including magazine features, leadership articles, and expertise pieces that AI engines can reference.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <Card title="What&apos;s Helping AI Find You">
                    {report.aiLlmAppearance?.strengths?.length > 0 ? (
                      <ul className="space-y-2">
                        {report.aiLlmAppearance.strengths.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {s}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">No AI visibility strengths detected.</p>
                    )}
                  </Card>

                  {/* Weaknesses */}
                  <Card title="What&apos;s Missing for AI Visibility">
                    {report.aiLlmAppearance?.weaknesses?.length > 0 ? (
                      <ul className="space-y-2">
                        {report.aiLlmAppearance.weaknesses.map((w, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {w}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">No significant weaknesses found.</p>
                    )}
                  </Card>
                </div>

                {/* Recommendations */}
                {report.aiLlmAppearance?.recommendations?.length > 0 && (
                  <Card title="How to Improve AI Visibility">
                    <div className="space-y-3">
                      {report.aiLlmAppearance.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                          <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">{i + 1}</span>
                          <p className="text-sm text-gray-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* AI engines explanation */}
                <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-5">
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Which AI Engines Are Analyzed?</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "ChatGPT", desc: "OpenAI" },
                      { name: "Claude", desc: "Anthropic" },
                      { name: "Gemini", desc: "Google" },
                      { name: "Perplexity", desc: "AI Search" },
                    ].map((engine, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <p className="font-semibold text-sm text-gray-800">{engine.name}</p>
                        <p className="text-xs text-gray-400">{engine.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    AI engines pull information from authoritative sources like news articles, Wikipedia, official websites, and structured data.
                    The more high-quality, factual content available about you online, the more accurately AI will represent you.
                  </p>
                </div>
              </div>
            )}

            {/* ── SUSPICIOUS ACTIVITY TAB ──────────────────── */}
            {activeTab === "suspicious" && report.suspiciousActivityAnalysis && (
              <div className="report-section space-y-6">
                {/* Score header */}
                <div className="bg-white rounded-2xl border-2 border-gray-300 p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className="relative w-36 h-36">
                        <svg width="144" height="144" viewBox="0 0 144 144">
                          <circle cx="72" cy="72" r="60" fill="none" stroke="#e5e7eb" strokeWidth="10" />
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
                          <text x="72" y="88" textAnchor="middle" fontSize="12" fill="#94a3b8">/ 10</text>
                        </svg>
                      </div>
                      <span className={`mt-2 px-3 py-1 rounded-full text-sm font-bold uppercase ${
                        report.suspiciousActivityAnalysis.riskLevel === "low" ? "bg-green-100 text-green-700"
                        : report.suspiciousActivityAnalysis.riskLevel === "moderate" ? "bg-yellow-100 text-yellow-700"
                        : report.suspiciousActivityAnalysis.riskLevel === "high" ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                      }`}>{report.suspiciousActivityAnalysis.riskLevel} risk</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Suspicious Activity Score</h3>
                      <p className="text-gray-500 text-sm mb-3">
                        Scale: 1 (clean) to 10 (highly suspicious). Higher scores indicate potential SERP manipulation flags based on Google policies.
                      </p>
                      <BulletText text={report.suspiciousActivityAnalysis.analysis} className="text-gray-700 leading-relaxed" />
                    </div>
                  </div>
                </div>

                {/* Alert for high scores */}
                {report.suspiciousActivityAnalysis.score >= 6 && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                      </span>
                      <div>
                        <p className="font-bold text-red-800 mb-1">Warning: Suspicious Patterns Detected</p>
                        <p className="text-sm text-red-700 leading-relaxed">
                          Google policies consider rushed or unnatural patterns as SERP manipulation. This can result in penalties, deindexing, or reduced rankings.
                          The recommendation is to proceed with caution &mdash; take a surgical approach to achieve results while staying under the radar from Google flagging this as spam or fraud.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detected patterns */}
                {report.suspiciousActivityAnalysis?.patterns?.length > 0 ? (
                  <Card title="Detected Patterns">
                    <div className="space-y-3">
                      {report.suspiciousActivityAnalysis?.patterns?.map((p, i) => (
                        <div key={i} className={`rounded-lg p-4 border ${
                          p.severity === "high" ? "border-red-200 bg-red-50" : p.severity === "medium" ? "border-yellow-200 bg-yellow-50" : "border-gray-200 bg-gray-50"
                        }`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <SeverityBadge level={p.severity} />
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium uppercase">{p.type.replace(/_/g, " ")}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 mb-1">{p.description}</p>
                          <p className="text-xs text-gray-500 italic">{p.evidence}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card title="Detected Patterns">
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">No suspicious patterns detected</p>
                      <p className="text-xs text-gray-400 mt-1">The online presence appears to be organically built.</p>
                    </div>
                  </Card>
                )}

                {/* Recommendation */}
                {report.suspiciousActivityAnalysis.recommendation && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                    <h4 className="font-semibold text-blue-800 text-sm mb-2">Recommendation</h4>
                    <p className="text-sm text-blue-700 leading-relaxed">{report.suspiciousActivityAnalysis.recommendation}</p>
                  </div>
                )}

                {/* Google policy explanation */}
                <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-5">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">About Google&apos;s SERP Manipulation Policies</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Google actively detects and penalizes unnatural patterns including: review flooding (many reviews posted in short timeframes), mass Web 2.0 profile creation, unnatural link building spikes, and content stuffing. Violations can lead to manual actions, ranking penalties, or complete deindexing from search results.
                  </p>
                </div>
              </div>
            )}

            {/* ── INFLUENCERS TAB ────────────────────────────── */}
            {activeTab === "influencers" && (
              <div className="report-section space-y-6">
                <Card title="Influencer & Third-Party Mentions">
                  <p className="text-xs text-gray-400 mb-4 border-b border-gray-100 pb-3">
                    Analysis covers the past 3 months across: YouTube, Instagram, TikTok, Twitter/X, LinkedIn, Reddit, and Blogs. For YouTube video details, see the Video section in the Overview tab.
                  </p>
                  {report.influencerMentions?.mentions && report.influencerMentions.mentions.length > 0 ? (
                    <>
                      <BulletText text={report.influencerMentions.analysis} className="text-sm text-gray-600 mb-4 leading-relaxed" />
                      <div className="space-y-3">
                        {report.influencerMentions.mentions.map((m, i) => (
                          <div key={i} className={`rounded-lg p-4 border ${
                            m.sentiment === "negative" ? "border-red-200 bg-red-50" : m.sentiment === "positive" ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                          }`}>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="font-semibold text-sm text-gray-800">{m.influencerName}</span>
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-600 uppercase">{m.platform}</span>
                              <SentimentDot sentiment={m.sentiment} />
                              {m.isSponsored && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">SPONSORED</span>
                              )}
                              <span className="text-xs text-gray-400 ml-auto">{m.dateFound} ({m.daysAgo}d ago)</span>
                            </div>
                            <p className="text-sm text-gray-600">{m.summary}</p>
                            {m.link && (
                              <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">{m.link}</a>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400 font-medium">No influencer mentions detected in the past 3 months.</p>
                      <p className="text-xs text-gray-400 mt-1">This could mean the brand lacks third-party advocacy — consider an influencer outreach strategy.</p>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* ── REVIEWS DASHBOARD TAB (companies only) ───── */}
            {activeTab === "reviews" && report.reviewDashboard && (
              <div className="report-section space-y-6">
                {/* Aggregated score header */}
                <div className="bg-white rounded-2xl border-2 border-gray-300 p-8">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-5xl font-bold" style={{ color: report.reviewDashboard.aggregatedRating >= 4 ? "#22c55e" : report.reviewDashboard.aggregatedRating >= 3 ? "#eab308" : "#ef4444" }}>
                        {(report.reviewDashboard.aggregatedRating || 0).toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-400">/ 5.0</p>
                      <p className="text-xs text-gray-500 mt-1">{report.reviewDashboard.totalReviews} total reviews</p>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Aggregated Review Score</h3>
                      <BulletText text={report.reviewDashboard.trendAnalysis} className="text-sm text-gray-600 leading-relaxed" />
                    </div>
                  </div>
                </div>

                {/* Platform breakdown */}
                <Card title="Platform Breakdown">
                  <div className="space-y-3">
                    {report.reviewDashboard.platforms.map((p, i) => (
                      <div key={i} className="flex items-center gap-4 pb-3 border-b border-gray-100 last:border-0">
                        <span className="font-semibold text-sm text-gray-800 w-28 shrink-0">{p.name}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden flex-1">
                              <div className={`h-full rounded-full ${p.rating >= 4 ? "bg-green-500" : p.rating >= 3 ? "bg-yellow-400" : "bg-red-500"}`}
                                style={{ width: `${(p.rating / 5) * 100}%` }} />
                            </div>
                            <span className="text-sm font-bold w-10 text-right">{p.rating > 0 ? p.rating.toFixed(1) : "N/A"}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 w-20 text-right">{p.reviewCount} reviews</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          p.sentiment === "positive" ? "bg-green-100 text-green-700" : p.sentiment === "negative" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                        }`}>{p.sentiment}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Review risks */}
                {report.reviewDashboard?.risks?.length > 0 && (
                  <Card title="Potential Review Risks">
                    <div className="space-y-3">
                      {report.reviewDashboard.risks.map((r, i) => (
                        <div key={i} className="border border-red-200 bg-red-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium">{r.platform}</span>
                            <span className="text-xs text-red-500 font-medium">Potential Risk</span>
                          </div>
                          <p className="text-sm text-gray-700">{r.review}</p>
                          <p className="text-xs text-red-600 mt-1">{r.risk}</p>
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
                <div className="bg-white rounded-2xl border-2 border-gray-300 p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className="relative w-36 h-36">
                        <svg width="144" height="144" viewBox="0 0 144 144">
                          <circle cx="72" cy="72" r="60" fill="none" stroke="#e5e7eb" strokeWidth="10" />
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
                          <text x="72" y="88" textAnchor="middle" fontSize="12" fill="#94a3b8">/ 10</text>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Est. backlinks: {report.backlinkProfile.totalBacklinks}</p>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Backlink Health Score</h3>
                      <BulletText text={report.backlinkProfile.analysis} className="text-gray-700 leading-relaxed" />
                    </div>
                  </div>
                </div>

                {/* Toxic links alert */}
                {report.backlinkProfile.toxicLinksDetected && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                      </span>
                      <div>
                        <p className="font-bold text-red-800 mb-1">Toxic Links Detected ({report.backlinkProfile.toxicLinksCount})</p>
                        <p className="text-sm text-red-700 mb-1">Status: <span className="font-semibold uppercase">{report.backlinkProfile.toxicLinksStatus}</span></p>
                        <p className="text-sm text-red-700 leading-relaxed">{report.backlinkProfile.toxicLinksSolution}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vulnerability warning */}
                {report.backlinkProfile.isVulnerable && !report.backlinkProfile.toxicLinksDetected && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                      </span>
                      <div>
                        <p className="font-bold text-yellow-800 mb-1">Backlink Vulnerability</p>
                        <p className="text-sm text-yellow-700 leading-relaxed">{report.backlinkProfile.vulnerabilityNote}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {report.backlinkProfile?.recommendations?.length > 0 && (
                  <Card title="Backlink Recommendations">
                    <div className="space-y-3">
                      {report.backlinkProfile.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                          <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">{i + 1}</span>
                          <p className="text-sm text-gray-700">{rec}</p>
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
                {/* Alert level header */}
                <div className={`rounded-2xl border-2 p-8 ${
                  report.crisisDetection.alertLevel === "critical" ? "border-red-400 bg-red-50"
                  : report.crisisDetection.alertLevel === "high" ? "border-orange-300 bg-orange-50"
                  : report.crisisDetection.alertLevel === "moderate" ? "border-yellow-300 bg-yellow-50"
                  : "border-gray-300 bg-white"
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${
                      report.crisisDetection.alertLevel === "critical" ? "bg-red-500 text-white"
                      : report.crisisDetection.alertLevel === "high" ? "bg-orange-500 text-white"
                      : report.crisisDetection.alertLevel === "moderate" ? "bg-yellow-400 text-yellow-900"
                      : report.crisisDetection.alertLevel === "low" ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                    }`}>
                      {report.crisisDetection.alertLevel === "none" ? "All Clear" : `${report.crisisDetection.alertLevel} Alert`}
                    </span>
                  </div>
                  <BulletText text={report.crisisDetection.summary} className="text-gray-700 leading-relaxed" />
                </div>

                {/* Active alerts */}
                {report.crisisDetection?.alerts?.length > 0 && (
                  <Card title="Active Alerts">
                    <div className="space-y-3">
                      {report.crisisDetection.alerts.map((a, i) => (
                        <div key={i} className={`rounded-lg p-4 border ${
                          a.priority === "immediate" ? "border-red-300 bg-red-50" : a.priority === "urgent" ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-gray-50"
                        }`}>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                              a.priority === "immediate" ? "bg-red-500 text-white" : a.priority === "urgent" ? "bg-orange-500 text-white" : "bg-blue-100 text-blue-600"
                            }`}>{a.priority}</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{a.type.replace(/_/g, " ")}</span>
                            {a.date && <span className="text-xs text-gray-400">{a.date}</span>}
                          </div>
                          <p className="text-sm font-medium text-gray-800">{a.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Source: {a.source} | Impact: {a.impact}</p>
                          {a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">{a.link}</a>}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Threats */}
                {report.crisisDetection?.threats?.length > 0 && (
                  <Card title="Reputation Threats">
                    <div className="space-y-3">
                      {report.crisisDetection.threats.map((t, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-sm font-medium text-gray-800 mb-1">{t.threat}</p>
                          <div className="flex gap-3 text-xs text-gray-400">
                            <span>Likelihood: <span className="font-medium text-gray-600">{t.likelihood}</span></span>
                            <span>Impact: <span className="font-medium text-gray-600">{t.impact}</span></span>
                          </div>
                          <p className="text-xs text-blue-600 mt-1">{t.mitigation}</p>
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
                  <div key={i} className="bg-white rounded-xl border-2 border-gray-300 p-5 flex gap-4">
                    <div className="pt-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400 font-mono">#{r.position}</span>
                      <SentimentDot sentiment={r.sentiment} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <a href={r.link} target="_blank" rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium text-sm line-clamp-1">{r.title}</a>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{r.snippet}</p>
                      <p className="text-xs text-gray-400 mt-1.5 italic">{r.reason}</p>
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
                  <div className="text-center py-12 text-gray-400">No significant problems detected.</div>
                )}
                {report.problems.map((p, i) => (
                  <div key={i} className={`rounded-xl border p-5 ${
                    p.severity === "high" ? "border-red-200 bg-red-50" : p.severity === "medium" ? "border-yellow-200 bg-yellow-50" : "border-blue-200 bg-blue-50"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <SeverityBadge level={p.severity} />
                      <span className="font-semibold text-sm">{p.title}</span>
                      <CategoryTag cat={p.category} />
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{p.description}</p>
                    {p.source && (
                      <a href={p.source} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline break-all">{p.source}</a>
                    )}
                  </div>
                ))}

                {/* Full recommendations at bottom of problems */}
                {report.recommendations.length > 0 && (
                  <Card title="All Recommendations" className="mt-6">
                    <div className="space-y-4">
                      {report.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                          <SeverityBadge level={rec.priority} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{rec.action}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{rec.reason}</p>
                            <p className="text-xs text-green-600 mt-0.5">Expected impact: {rec.estimatedImpact}</p>
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
                  <div className="text-center py-12 text-gray-400">No notable strengths identified.</div>
                )}
                {report.strengths?.map((s, i) => (
                  <div key={i} className="rounded-xl border border-green-200 bg-green-50 p-5">
                    <h4 className="font-semibold text-sm text-green-800 mb-1">{s.title}</h4>
                    <p className="text-sm text-gray-700">{s.description}</p>
                    {s.source && (
                      <a href={s.source} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline mt-1 inline-block">{s.source}</a>
                    )}
                  </div>
                ))}

                {/* SERP breakdown */}
                {report.serpBreakdown && (
                  <Card title="SERP Control Analysis" className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-600">First page dominance:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        report.serpBreakdown.firstPageDominance === "high" ? "bg-green-100 text-green-700"
                        : report.serpBreakdown.firstPageDominance === "medium" ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                      }`}>{report.serpBreakdown.firstPageDominance}</span>
                    </div>
                    {report.serpBreakdown?.ownedProperties?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Owned/Controlled Properties:</p>
                        <ul className="space-y-1">
                          {report.serpBreakdown.ownedProperties.map((url, i) => (
                            <li key={i} className="text-xs text-green-600 truncate">{url}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {report.serpBreakdown?.riskyResults?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Risky Results:</p>
                        <ul className="space-y-1">
                          {report.serpBreakdown.riskyResults.map((url, i) => (
                            <li key={i} className="text-xs text-red-500 truncate">{url}</li>
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
                {/* Urgency banner */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">How Reputation500 Can Help</h3>
                      <p className="text-blue-100 leading-relaxed" style={{ fontSize: "1.35rem", lineHeight: "1.8" }}>
                        {report.packageRecommendations.urgencyMessage}
                      </p>
                      <p className="text-white font-medium mt-3" style={{ fontSize: "1.15rem", lineHeight: "1.6" }}>
                        Trusted by 300+ companies and individuals with a 100% satisfaction rate. Led by ex-Google reputation experts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Package cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {report.packageRecommendations.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative bg-white rounded-xl border-2 p-6 flex flex-col ${
                        pkg.match === "perfect"
                          ? "border-blue-500 shadow-lg shadow-blue-100"
                          : pkg.match === "strong"
                          ? "border-blue-300"
                          : "border-gray-200"
                      }`}
                    >
                      {/* Tag */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            pkg.match === "perfect"
                              ? "bg-blue-500 text-white"
                              : pkg.match === "strong"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {pkg.tag}
                        </span>
                        <span className="text-xs text-gray-400 uppercase font-medium">
                          {pkg.type === "pr"
                            ? "PR Distribution"
                            : pkg.type === "media"
                            ? "Media Package"
                            : "Full ORM"}
                        </span>
                      </div>

                      {/* Name & price */}
                      <h4 className="text-lg font-bold text-gray-900 mb-0.5">{pkg.headline}</h4>
                      <p className="text-sm text-gray-500 mb-1">{pkg.name}</p>
                      <p className="text-2xl font-bold text-blue-600 mb-3">
                        {pkg.price}
                        {pkg.type === "orm" && (
                          <span className="text-xs text-gray-400 font-normal ml-1">/ 12-month plan</span>
                        )}
                      </p>

                      {/* Why this package */}
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">{pkg.reason}</p>

                      {/* Features */}
                      <ul className="space-y-2 mb-5 flex-1">
                        {pkg.features.map((f, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <svg
                              className="w-4 h-4 text-blue-500 shrink-0 mt-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <button
                        onClick={() => {
                          setContactModal({ open: true, packageName: `${pkg.name} (${pkg.price})` });
                          setContactSent(false);
                          setContactForm({ name: "", email: "" });
                        }}
                        className={`block w-full text-center py-3 rounded-lg font-semibold text-sm transition cursor-pointer ${
                          pkg.match === "perfect"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-blue-50 hover:bg-blue-100 text-blue-600"
                        }`}
                      >
                        {pkg.cta}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Trust footer */}
                <div className="mt-8 text-center py-8 border-t-2 border-gray-300">
                  <p className="text-gray-900 font-extrabold" style={{ fontSize: "1.6rem", lineHeight: "1.5" }}>
                    Featured in Forbes, GQ, Entrepreneur, USA Today, Rolling Stone, and 3,481+ more publications.
                  </p>
                  <p className="text-gray-900 font-bold mt-3" style={{ fontSize: "1.2rem" }}>
                    All features are guaranteed. Money back if we don&apos;t deliver.
                  </p>
                </div>
              </div>
            )}

              </div>{/* end blur wrapper */}
            </div>{/* end email gate relative container */}
          </div>
        )}
      </main>

      <footer className="border-t-2 border-gray-300 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-gray-400" style={{ fontSize: "0.95rem" }}>
          Online Reputation Checker &mdash; Powered by <a href="https://reputation500.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">Reputation500</a>
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
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
                >&times;</button>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Get Started with Reputation500</h3>
                <p className="text-sm text-gray-500 mb-1">
                  Package: <span className="font-medium text-blue-600">{contactModal.packageName}</span>
                </p>
                <p className="text-xs text-gray-400 mb-5">
                  Fill in your details and our reputation expert will contact you within 24 hours.
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full h-11 px-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full h-11 px-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-sm transition"
                  >
                    Send My Details
                  </button>
                </form>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Your information is only shared with Reputation500. No spam.
                </p>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Request Sent!</h3>
                <p className="text-sm text-gray-500 mb-4">
                  A Reputation500 expert will reach out to you shortly at <span className="font-medium">{contactForm.email}</span> to discuss the <span className="font-medium text-blue-600">{contactModal.packageName}</span> package.
                </p>
                <button
                  onClick={() => setContactModal({ open: false, packageName: "" })}
                  className="text-sm text-blue-500 hover:underline"
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

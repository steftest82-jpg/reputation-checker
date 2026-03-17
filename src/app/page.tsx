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
    if (step >= LOADING_STEPS.length) return;
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

  const progress = Math.min(Math.round((step / LOADING_STEPS.length) * 100), 99);

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      {/* Animated shield icon */}
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-500 loading-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-2 text-gray-900">Preparing Your Reputation Report</h3>
      <p className="text-gray-500 text-sm mb-1">This usually takes 20-30 seconds. Please don&apos;t close this page.</p>
      <p className="text-gray-400 text-xs mb-6">Elapsed: {elapsed}s &middot; {progress}% complete</p>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-8 mx-4">
        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* Steps */}
      <div className="space-y-2.5 text-left px-4">
        {LOADING_STEPS.map((s, i) => (
          <div key={i} className={`flex items-start gap-3 transition-all duration-300 ${i > step + 1 ? "opacity-30" : ""}`}>
            {i < step ? (
              <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs shrink-0 mt-0.5">&#10003;</span>
            ) : i === step ? (
              <span className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0 mt-0.5" />
            ) : (
              <span className="w-6 h-6 rounded-full bg-gray-200 shrink-0 mt-0.5" />
            )}
            <div>
              <span className={`text-sm font-medium ${i < step ? "text-green-700" : i === step ? "text-gray-900" : "text-gray-400"}`}>
                {s.label}
              </span>
              {i === step && (
                <p className="text-xs text-blue-500 loading-pulse mt-0.5">{s.sublabel}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rotating tips */}
      <div className="mt-8 mx-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-xs text-blue-400 font-medium uppercase tracking-wide mb-1">Did you know?</p>
        <p className="text-sm text-blue-700 leading-relaxed transition-all duration-500">{LOADING_TIPS[tipIndex]}</p>
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
  const [activeTab, setActiveTab] = useState<"overview" | "results" | "problems" | "strengths">("overview");
  const [contactModal, setContactModal] = useState<{ open: boolean; packageName: string }>({ open: false, packageName: "" });
  const [contactForm, setContactForm] = useState({ name: "", email: "" });
  const [contactSent, setContactSent] = useState(false);
  const [emailGated, setEmailGated] = useState(true);
  const [gateEmail, setGateEmail] = useState("");
  const [gateSending, setGateSending] = useState(false);
  const [gateError, setGateError] = useState("");

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

      <main className="max-w-5xl mx-auto px-4 py-10 flex-1 w-full">
        {/* Search form */}
        {!report && !loading && (
          <div className="max-w-2xl mx-auto text-center">
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
                  <p className="text-gray-600 leading-relaxed mb-4">{report.summary}</p>
                  {report.sentimentBreakdown && <SentimentChart breakdown={report.sentimentBreakdown} />}
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
                <p className="text-gray-700 leading-relaxed" style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>{report.executiveBrief}</p>
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
                    <CategoryBar label="Search Results Sentiment" value={report.categoryScores.serpSentiment} max={30} />
                    <CategoryBar label="Review Ratings" value={report.categoryScores.reviewRatings} max={15} />
                    <CategoryBar label="News Sentiment" value={report.categoryScores.newsSentiment} max={15} />
                    <CategoryBar label="Autocomplete Safety" value={report.categoryScores.autocompleteSafety} max={10} />
                    <CategoryBar label="Social Media Presence" value={report.categoryScores.socialPresence} max={10} />
                    <CategoryBar label="Complaint Sites" value={report.categoryScores.complaintSites} max={10} />
                    <CategoryBar label="Content Control" value={report.categoryScores.contentControl} max={5} />
                    <CategoryBar label="Domain Ownership" value={report.categoryScores.domainOwnership} max={5} />
                  </Card>

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
                  {report.knowledgeGraph && (
                    <Card title="Google Knowledge Panel">
                      <p className="font-medium">{report.knowledgeGraph.title}</p>
                      {report.knowledgeGraph.type && <p className="text-xs text-gray-400 mb-1">{report.knowledgeGraph.type}</p>}
                      {report.knowledgeGraph.description && <p className="text-sm text-gray-600">{report.knowledgeGraph.description}</p>}
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Social Presence */}
                  <Card title="Social Media Presence">
                    <p className="text-sm text-gray-600 mb-3">{report.socialPresenceDetail.assessment}</p>
                    {report.socialPresenceDetail.found.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1.5">Found:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {report.socialPresenceDetail.found.map((p, i) => (
                            <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {report.socialPresenceDetail.missing.length > 0 && (
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
                    {report.reviewSummary.platforms_found.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {report.reviewSummary.platforms_found.map((p, i) => (
                          <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">{p}</span>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Autocomplete */}
                  <Card title="Google Autocomplete">
                    <p className="text-sm text-gray-600 mb-3">{report.autocompleteSentiment.analysis}</p>
                    {report.autocompleteSentiment.negative_terms.length > 0 && (
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
                      {report.autocomplete.filter(s => !report.autocompleteSentiment.negative_terms.includes(s)).map((s, i) => (
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

                  {/* People Also Ask */}
                  {report.peopleAlsoAsk.length > 0 && (
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
                    {report.serpBreakdown.ownedProperties.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Owned/Controlled Properties:</p>
                        <ul className="space-y-1">
                          {report.serpBreakdown.ownedProperties.map((url, i) => (
                            <li key={i} className="text-xs text-green-600 truncate">{url}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {report.serpBreakdown.riskyResults.length > 0 && (
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
                      <p className="text-blue-100 leading-relaxed" style={{ fontSize: "1.05rem", lineHeight: "1.7" }}>
                        {report.packageRecommendations.urgencyMessage}
                      </p>
                      <p className="text-white font-medium mt-3" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
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
                <div className="mt-8 text-center py-6 border-t-2 border-gray-300">
                  <p className="text-gray-900 font-bold" style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
                    Featured in Forbes, GQ, Entrepreneur, USA Today, Rolling Stone, and 3,481+ more publications.
                  </p>
                  <p className="text-gray-700 font-medium mt-2" style={{ fontSize: "1rem" }}>
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

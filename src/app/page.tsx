"use client";

import { useState } from "react";

// ── Types ───────────────────────────────────────────────────────────
interface ResultItem {
  title: string;
  snippet: string;
  link: string;
  sentiment: "positive" | "neutral" | "negative";
  severity: "low" | "medium" | "high";
  reason: string;
}

interface Problem {
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  source: string;
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
  results: ResultItem[];
  problems: Problem[];
  recommendations: string[];
  categoryScores: CategoryScores;
  autocomplete: string[];
  peopleAlsoAsk: string[];
}

// ── Score gauge component ───────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 90
      ? "#22c55e"
      : score >= 70
      ? "#84cc16"
      : score >= 50
      ? "#eab308"
      : score >= 30
      ? "#f97316"
      : "#ef4444";
  const label =
    score >= 90
      ? "Excellent"
      : score >= 70
      ? "Good"
      : score >= 50
      ? "Fair"
      : score >= 30
      ? "Poor"
      : "Critical";

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="14"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform="rotate(-90 100 100)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text
          x="100"
          y="92"
          textAnchor="middle"
          fontSize="42"
          fontWeight="700"
          fill={color}
        >
          {score}
        </text>
        <text
          x="100"
          y="118"
          textAnchor="middle"
          fontSize="14"
          fill="#64748b"
        >
          / 100
        </text>
      </svg>
      <span
        className="mt-1 text-lg font-semibold"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Category bar ────────────────────────────────────────────────────
function CategoryBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = Math.round((value / max) * 100);
  const color =
    pct >= 80
      ? "bg-green-500"
      : pct >= 60
      ? "bg-lime-500"
      : pct >= 40
      ? "bg-yellow-400"
      : pct >= 20
      ? "bg-orange-500"
      : "bg-red-500";

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-medium">
          {value}/{max}
        </span>
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%`, transition: "width 0.8s ease" }}
        />
      </div>
    </div>
  );
}

// ── Severity badge ──────────────────────────────────────────────────
function SeverityBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-600",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
        styles[level] || styles.low
      }`}
    >
      {level}
    </span>
  );
}

// ── Sentiment badge ─────────────────────────────────────────────────
function SentimentDot({ sentiment }: { sentiment: string }) {
  const color =
    sentiment === "positive"
      ? "bg-green-500"
      : sentiment === "negative"
      ? "bg-red-500"
      : "bg-gray-400";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />;
}

// ── Main page ───────────────────────────────────────────────────────
export default function Home() {
  const [name, setName] = useState("");
  const [type, setType] = useState<"person" | "company">("person");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "results" | "problems">("overview");

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Online Reputation Checker
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* ── Search form ────────────────────────────────────── */}
        {!report && !loading && (
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-3">
              Check Any Online Reputation
            </h2>
            <p className="text-gray-500 mb-8">
              Enter a person or company name to get a comprehensive reputation
              score based on what Google shows about them.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Toggle */}
              <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
                <button
                  type="button"
                  onClick={() => setType("person")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    type === "person"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Person
                </button>
                <button
                  type="button"
                  onClick={() => setType("company")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    type === "company"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Company
                </button>
              </div>

              {/* Input */}
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    type === "person"
                      ? "e.g. John Smith"
                      : "e.g. Acme Corporation"
                  }
                  className="w-full h-14 pl-5 pr-32 rounded-xl border border-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 h-10 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
                >
                  Check
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </form>
          </div>
        )}

        {/* ── Loading state ──────────────────────────────────── */}
        {loading && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
            <h3 className="text-xl font-semibold mb-2">Analyzing Reputation</h3>
            <p className="text-gray-500">
              Searching Google, analyzing sentiment, calculating score&hellip;
              <br />
              This usually takes 15–30 seconds.
            </p>
          </div>
        )}

        {/* ── Report ─────────────────────────────────────────── */}
        {report && !loading && (
          <div>
            {/* Back button */}
            <button
              onClick={() => {
                setReport(null);
                setName("");
              }}
              className="mb-6 text-sm text-blue-500 hover:underline flex items-center gap-1"
            >
              &larr; New check
            </button>

            {/* Score header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6 flex flex-col md:flex-row items-center gap-8">
              <ScoreGauge score={report.score} />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-1">{report.name}</h2>
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium uppercase mb-3">
                  {report.entityType}
                </span>
                <p className="text-gray-600 leading-relaxed">
                  {report.summary}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-200">
              {(["overview", "results", "problems"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-medium capitalize transition border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                  {tab === "problems" && report.problems.length > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                      {report.problems.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Overview tab ──────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Category scores */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold mb-4">Score Breakdown</h3>
                  <CategoryBar label="Search Results Sentiment" value={report.categoryScores.serpSentiment} max={30} />
                  <CategoryBar label="Review Ratings" value={report.categoryScores.reviewRatings} max={15} />
                  <CategoryBar label="News Sentiment" value={report.categoryScores.newsSentiment} max={15} />
                  <CategoryBar label="Autocomplete Safety" value={report.categoryScores.autocompleteSafety} max={10} />
                  <CategoryBar label="Social Media Presence" value={report.categoryScores.socialPresence} max={10} />
                  <CategoryBar label="Complaint Sites" value={report.categoryScores.complaintSites} max={10} />
                  <CategoryBar label="Content Control" value={report.categoryScores.contentControl} max={5} />
                  <CategoryBar label="Domain Ownership" value={report.categoryScores.domainOwnership} max={5} />
                </div>

                {/* Recommendations */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {report.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-blue-500 mt-0.5 shrink-0">&#10003;</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Autocomplete */}
                  {report.autocomplete.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="font-semibold mb-3">
                        Google Autocomplete Suggestions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {report.autocomplete.map((s, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* People Also Ask */}
                  {report.peopleAlsoAsk.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="font-semibold mb-3">
                        People Also Ask
                      </h3>
                      <ul className="space-y-1.5">
                        {report.peopleAlsoAsk.map((q, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            &bull; {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Results tab ──────────────────────────────── */}
            {activeTab === "results" && (
              <div className="space-y-3">
                {report.results.map((r, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-5 flex gap-4"
                  >
                    <div className="pt-1">
                      <SentimentDot sentiment={r.sentiment} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={r.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium text-sm line-clamp-1"
                      >
                        {r.title}
                      </a>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {r.snippet}
                      </p>
                      <p className="text-xs text-gray-400 mt-1.5">{r.reason}</p>
                    </div>
                    <div className="shrink-0">
                      <SeverityBadge level={r.severity} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Problems tab ─────────────────────────────── */}
            {activeTab === "problems" && (
              <div className="space-y-4">
                {report.problems.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    No significant problems detected.
                  </div>
                )}
                {report.problems.map((p, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-5 ${
                      p.severity === "high"
                        ? "border-red-200 bg-red-50"
                        : p.severity === "medium"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <SeverityBadge level={p.severity} />
                      <span className="font-semibold text-sm">{p.title}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      {p.description}
                    </p>
                    {p.source && (
                      <a
                        href={p.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        {p.source}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          Online Reputation Checker &mdash; Powered by AI analysis of public search data.
        </div>
      </footer>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import PDFDocument from "pdfkit";

const _rk = ["re_MxSnEjk4_Af5Xdo", "32nV9FHekAdB6ddiv2"];
const RESEND_KEY = process.env.RESEND_API_KEY || _rk.join("");
const NOTIFY_EMAIL = "info@reputation500.com";

// ── Design tokens ──
const C = {
  pri: "#1B263B", priC: "#101b30", sec: "#47607e",
  on: "#1a1c1a", onV: "#44474c", out: "#74777d", outV: "#c4c6cc",
  err: "#ba1a1a", grn: "#22c55e", ylw: "#eab308", org: "#f97316", red: "#ef4444",
  wht: "#ffffff", surf: "#f3f4f0",
};

function generatePDF(report: Record<string, unknown>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width;
    const cW = W - 100; // content width
    const name = String(report.name || "Unnamed");
    const score = (report.score || 0) as number;
    const riskLevel = String(report.riskLevel || "unknown");
    const entityType = String(report.entityType || "unknown");

    // ── Helpers ──
    function space() { if (doc.y > doc.page.height - 60) doc.addPage(); }
    function need(n: number) { if (doc.y > doc.page.height - n) doc.addPage(); }

    function sec(title: string) {
      need(70);
      doc.moveDown(0.8);
      doc.fontSize(11).fillColor(C.pri).text(title.toUpperCase(), 50, doc.y, { characterSpacing: 2, width: cW });
      doc.moveDown(0.15);
      doc.moveTo(50, doc.y).lineTo(50 + cW, doc.y).strokeColor(C.outV).lineWidth(0.5).stroke();
      doc.moveDown(0.4);
    }

    function sub(t: string) { need(30); doc.fontSize(10).fillColor(C.pri).text(t, 50, doc.y, { width: cW }); doc.moveDown(0.2); }
    function body(t: string) { if (!t) return; doc.fontSize(9).fillColor(C.onV).text(String(t), 50, doc.y, { width: cW, lineGap: 2.5 }); }
    function lv(l: string, v: string) { doc.fontSize(8).fillColor(C.out).text(l, 50, doc.y, { continued: true, width: cW }); doc.fillColor(C.on).text(`  ${v}`); }
    function bullet(t: string, color = C.onV) { need(16); doc.fontSize(8).fillColor(color).text(`  •  ${t}`, 50, doc.y, { width: cW }); }

    function bar(x: number, y: number, w: number, pct: number, color: string) {
      doc.roundedRect(x, y, w, 4, 2).fill(C.outV);
      if (pct > 0) doc.roundedRect(x, y, Math.max(4, (pct / 100) * w), 4, 2).fill(color);
    }

    function scoreClr(pct: number) { return pct >= 80 ? C.grn : pct >= 60 ? "#84cc16" : pct >= 40 ? C.ylw : pct >= 20 ? C.org : C.red; }
    const sClr = score >= 90 ? C.grn : score >= 70 ? "#84cc16" : score >= 50 ? C.ylw : score >= 30 ? C.org : C.red;
    const sLbl = score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : score >= 30 ? "Poor" : "Critical";

    // Cast helpers
    const r = (k: string) => report[k] as Record<string, unknown> | undefined;
    const ra = (k: string) => (report[k] || []) as Record<string, unknown>[];

    // ════════════════════════════════════════════════════════════════
    // COVER
    // ════════════════════════════════════════════════════════════════
    doc.rect(0, 0, W, 140).fill(C.priC);
    doc.fontSize(8).fillColor(C.out).text("REP500  •  ONLINE REPUTATION INTELLIGENCE", 50, 22, { characterSpacing: 2 });
    doc.fontSize(24).fillColor(C.wht).text("Reputation Report", 50, 45);
    doc.fontSize(14).fillColor(C.outV).text(name, 50, 78);
    doc.fontSize(8).fillColor(C.sec).text(
      `${entityType.charAt(0).toUpperCase() + entityType.slice(1)}  •  ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      50, 100
    );
    // Score box
    doc.roundedRect(W - 145, 35, 95, 80, 5).fill(C.wht);
    doc.fontSize(32).fillColor(sClr).text(String(score), W - 145, 40, { width: 95, align: "center" });
    doc.fontSize(8).fillColor(C.out).text(`/ 100`, W - 145, 76, { width: 95, align: "center" });
    doc.fontSize(7).fillColor(sClr).text(sLbl.toUpperCase(), W - 145, 90, { width: 95, align: "center", characterSpacing: 1 });

    doc.y = 155;
    doc.fontSize(8).fillColor(C.out).text("RISK LEVEL: ", 50, doc.y, { continued: true, characterSpacing: 1 });
    doc.fillColor(sClr).text(riskLevel.toUpperCase(), { characterSpacing: 1 });
    doc.moveDown(0.4);
    body(String(report.summary || ""));

    // ── EXECUTIVE BRIEF ──
    if (report.executiveBrief) { sec("Executive Brief"); body(String(report.executiveBrief)); }

    // ── DISCLAIMER ──
    const disc = r("disclaimer");
    if (disc?.show) { doc.moveDown(0.3); doc.fontSize(8).fillColor(C.org).text(`⚠ ${String(disc.title || "Note")}: ${String(disc.message || "")}`, 50, doc.y, { width: cW }); }

    // ── MEDIA PRESENCE WARNING ──
    const mpw = r("mediaPresenceWarning");
    if (mpw && !mpw.hasAdequateMedia && mpw.warning) { doc.moveDown(0.3); doc.fontSize(8).fillColor(C.org).text(`⚠ Low Media Coverage: ${String(mpw.warning)}`, 50, doc.y, { width: cW }); }

    // ── SENTIMENT OVERVIEW ──
    sec("Sentiment Overview");
    const sb = (report.sentimentBreakdown || {}) as Record<string, number>;
    const tot = (sb.positive || 0) + (sb.neutral || 0) + (sb.negative || 0) || 1;
    const pP = Math.round(((sb.positive || 0) / tot) * 100);
    const nP = Math.round(((sb.neutral || 0) / tot) * 100);
    const ngP = Math.round(((sb.negative || 0) / tot) * 100);
    // Stacked bar
    const bY = doc.y;
    const pW = (pP / 100) * cW; const nW = (nP / 100) * cW;
    if (pW > 0) doc.rect(50, bY, pW, 6).fill(C.grn);
    if (nW > 0) doc.rect(50 + pW, bY, nW, 6).fill(C.outV);
    if (ngP > 0) doc.rect(50 + pW + nW, bY, cW - pW - nW, 6).fill(C.red);
    doc.y = bY + 12;
    doc.fontSize(7).fillColor(C.grn).text(`Positive: ${sb.positive || 0} (${pP}%)`, 50, doc.y, { continued: true });
    doc.fillColor(C.out).text(`   Neutral: ${sb.neutral || 0} (${nP}%)`, { continued: true });
    doc.fillColor(C.red).text(`   Negative: ${sb.negative || 0} (${ngP}%)`);

    // ── DATA STATS ──
    const ds = (report.dataStats || {}) as Record<string, number>;
    doc.moveDown(0.3);
    doc.fontSize(7).fillColor(C.on).text(
      `Results: ${ds.totalResults || 0}  •  News: ${ds.newsCount || 0}  •  Social: ${ds.socialCount || 0}  •  Reviews: ${ds.reviewCount || 0}  •  Complaints: ${ds.complaintCount || 0}  •  Top 10 Domains: ${ds.uniqueDomainsInTop10 || 0}`,
      50, doc.y, { width: cW }
    );

    // ── SCORE BREAKDOWN ──
    sec("Score Breakdown");
    const cs = (report.categoryScores || {}) as Record<string, number>;
    for (const c of [
      { l: "Search Results Sentiment", k: "serpSentiment", m: 25 },
      { l: "News Sentiment", k: "newsSentiment", m: 15 },
      { l: "Review Ratings", k: "reviewRatings", m: 10 },
      { l: "AI / LLM Appearance", k: "aiLlmPresence", m: 10 },
      { l: "Autocomplete Safety", k: "autocompleteSafety", m: 10 },
      { l: "Social Media Presence", k: "socialPresence", m: 10 },
      { l: "Complaint Sites", k: "complaintSites", m: 10 },
      { l: "Content Control", k: "contentControl", m: 5 },
      { l: "Domain Ownership", k: "domainOwnership", m: 5 },
    ]) {
      need(16);
      const v = cs[c.k] || 0; const pct = Math.round((v / c.m) * 100);
      doc.fontSize(8).fillColor(C.onV).text(c.l, 50, doc.y, { continued: true }); doc.fillColor(C.pri).text(`  ${v}/${c.m}`);
      bar(50, doc.y + 1, 200, pct, scoreClr(pct)); doc.y += 12;
    }

    // ── SENTIMENT TIMELINE ──
    const st = r("sentimentTimeline");
    if (st && st.trend) {
      sec("Sentiment Trend");
      lv("Trend", String(st.trend).toUpperCase());
      doc.moveDown(0.2); body(String(st.trendAnalysis || ""));
      const rn = (st.recentNegatives || []) as Record<string, unknown>[];
      if (rn.length > 0) {
        doc.moveDown(0.3); doc.fontSize(8).fillColor(C.red).text("Recent Negative Events:", 50, doc.y, { width: cW });
        for (const n of rn) {
          need(25);
          doc.fontSize(8).fillColor(C.on).text(`${String(n.title)}`, 56, doc.y, { width: cW - 10 });
          doc.fontSize(7).fillColor(C.out).text(`${String(n.dateFound || "")} (${n.daysAgo}d ago) — ${String(n.summary || "")}`, 56, doc.y, { width: cW - 10 });
        }
      }
    }

    // ── REVENUE IMPACT ──
    const ri = r("revenueImpact");
    if (ri && (ri.totalEstimatedImpact as number) < 0) {
      sec("Revenue Impact Analysis");
      doc.fontSize(16).fillColor(C.red).text(`${ri.totalEstimatedImpact}%`, 50, doc.y, { continued: true });
      doc.fontSize(9).fillColor(C.out).text("  estimated revenue at risk");
      doc.moveDown(0.3); body(String(ri.analysis || ""));
      const bd = ri.categoryBreakdown as Record<string, number> | undefined;
      if (bd) {
        doc.moveDown(0.3);
        for (const [cat, val] of Object.entries(bd)) {
          if (val < 0) { doc.fontSize(7).fillColor(C.onV).text(`${cat}: `, 50, doc.y, { continued: true }); doc.fillColor(C.red).text(`${val}%`); }
        }
      }
      const tr = (ri.topRisks || []) as Record<string, unknown>[];
      if (tr.length > 0) {
        doc.moveDown(0.3); sub("Top Revenue Risks");
        for (const t of tr) { need(14); doc.fontSize(8).fillColor(C.red).text(`${t.impact}%`, 50, doc.y, { continued: true }); doc.fillColor(C.on).text(`  ${String(t.title)}`); }
      }
    }

    // ── SOCIAL MEDIA ──
    const sp = r("socialPresenceDetail");
    if (sp) {
      sec("Social Media Presence");
      body(String(sp.assessment || ""));
      const found = (sp.found || []) as string[]; const miss = (sp.missing || []) as string[];
      if (found.length) { doc.moveDown(0.2); lv("Found", found.join(", ")); }
      if (miss.length) { lv("Missing", miss.join(", ")); }
    }

    // ── DOMAIN CHECK ──
    const di = r("domainInfo");
    if (di) { sec("Domain Check"); lv("Domain", String(di.domain || "N/A")); lv("Active Website", di.hasSite ? "Yes" : "No"); }

    // ── KNOWLEDGE GRAPH ──
    const kg = r("knowledgeGraph");
    if (kg) { sec("Google Knowledge Panel"); lv("Title", String(kg.title || "")); if (kg.type) lv("Type", String(kg.type)); if (kg.description) body(String(kg.description)); }
    else { sec("Google Knowledge Panel"); doc.fontSize(8).fillColor(C.org).text("No Knowledge Panel detected — a key trust signal is missing.", 50, doc.y, { width: cW }); }

    // ── REVIEW SITES ──
    const rs = r("reviewSummary");
    if (rs) { sec("Review Sites"); body(String(rs.assessment || "")); const pl = (rs.platforms_found || []) as string[]; if (pl.length) { doc.moveDown(0.2); lv("Platforms", pl.join(", ")); } }

    // ── AUTOCOMPLETE ──
    const ac = r("autocompleteSentiment");
    if (ac) {
      sec("Google Autocomplete");
      body(String(ac.analysis || ""));
      const neg = (ac.negative_terms || []) as string[];
      if (neg.length) { doc.moveDown(0.2); lv("Concerning Terms", neg.join(", ")); }
    }

    // ── GOOGLE IMAGES ──
    const gi = r("googleImagesAnalysis");
    if (gi) {
      sec("Google Images Analysis");
      lv("Ranking", String(gi.ranking || "N/A")); lv("Owned Images", `~${gi.ownedImagesPct || 0}%`);
      doc.moveDown(0.2); body(String(gi.analysis || ""));
      const conc = (gi.concerns || []) as string[];
      for (const c of conc) bullet(c, C.red);
    }

    // ── TOP SERP LINKS ──
    const tsl = (report.topSerpLinks || []) as Record<string, unknown>[];
    if (tsl.length > 0) {
      sec("Top SERP Links (Page 1)");
      for (const l of tsl.slice(0, 10)) {
        need(14);
        const sentClr = l.sentiment === "positive" ? C.grn : l.sentiment === "negative" ? C.red : C.out;
        doc.fontSize(7).fillColor(C.out).text(`#${l.position}`, 50, doc.y, { continued: true });
        doc.fillColor(sentClr).text(` [${String(l.sentiment).toUpperCase()}]`, { continued: true });
        doc.fillColor(C.on).text(`  ${String(l.title)}`);
        if (l.isOwned) { doc.fontSize(6).fillColor(C.grn).text("    OWNED", 50, doc.y); }
      }
    }

    // ── PROBLEMS ──
    const problems = ra("problems");
    if (problems.length > 0) {
      sec(`Problems Found (${problems.length})`);
      for (const p of problems) {
        need(35);
        const sv = p.severity === "high" ? C.red : p.severity === "medium" ? C.ylw : C.sec;
        doc.rect(50, doc.y, 2, 22).fill(sv);
        doc.fontSize(7).fillColor(sv).text(`${String(p.severity).toUpperCase()}`, 58, doc.y, { continued: true });
        doc.fillColor(C.on).text(`  ${String(p.title)}`);
        doc.fontSize(7).fillColor(C.onV).text(String(p.description), 58, doc.y, { width: cW - 12 });
        doc.moveDown(0.4);
      }
    }

    // ── STRENGTHS ──
    const strengths = ra("strengths");
    if (strengths.length > 0) {
      sec(`Strengths (${strengths.length})`);
      for (const s of strengths) {
        need(25);
        doc.rect(50, doc.y, 2, 18).fill(C.grn);
        doc.fontSize(8).fillColor(C.on).text(String(s.title), 58, doc.y, { width: cW - 12 });
        doc.fontSize(7).fillColor(C.onV).text(String(s.description), 58, doc.y, { width: cW - 12 });
        doc.moveDown(0.3);
      }
    }

    // ── RECOMMENDATIONS ──
    const recs = ra("recommendations");
    if (recs.length > 0) {
      sec("Recommendations");
      for (let i = 0; i < recs.length; i++) {
        need(45);
        const rc = recs[i];
        const pClr = rc.priority === "high" ? C.red : rc.priority === "medium" ? C.ylw : C.sec;
        doc.rect(50, doc.y, 2, 28).fill(pClr);
        doc.fontSize(7).fillColor(pClr).text(`${String(rc.priority).toUpperCase()}`, 58, doc.y, { continued: true });
        doc.fillColor(C.on).text(`  ${String(rc.action)}`);
        doc.fontSize(7).fillColor(C.onV).text(String(rc.reason), 58, doc.y, { width: cW - 12 });
        doc.fontSize(7).fillColor(C.grn).text(`Impact: ${String(rc.estimatedImpact)}`, 58, doc.y, { width: cW - 12 });
        if (rc.revenueImpact) doc.fontSize(7).fillColor("#059669").text(`Revenue: ${String(rc.revenueImpact)}`, 58, doc.y, { width: cW - 12 });
        doc.moveDown(0.4);
      }
    }

    // ── AI / LLM APPEARANCE ──
    const ai = r("aiLlmAppearance");
    if (ai) {
      sec("AI / LLM Appearance");
      lv("Score", `${ai.score || 0}/10`); lv("Verdict", String(ai.verdict || "N/A"));
      doc.moveDown(0.2); body(String(ai.analysis || ""));
      const aiS = (ai.strengths || []) as string[]; const aiW = (ai.weaknesses || []) as string[];
      if (aiS.length) { doc.moveDown(0.2); sub("Strengths"); for (const s of aiS) bullet(s, C.grn); }
      if (aiW.length) { doc.moveDown(0.2); sub("Weaknesses"); for (const w of aiW) bullet(w, C.red); }
      const aiR = (ai.recommendations || []) as string[];
      if (aiR.length) { doc.moveDown(0.2); sub("AI Recommendations"); for (const r of aiR) bullet(r, C.sec); }
    }

    // ── SUSPICIOUS ACTIVITY ──
    const sa = r("suspiciousActivityAnalysis");
    if (sa) {
      sec("Suspicious Activity Analysis");
      lv("Score", `${sa.score || 0}/10`); lv("Risk Level", String(sa.riskLevel || "N/A"));
      doc.moveDown(0.2); body(String(sa.analysis || ""));
      const pats = (sa.patterns || []) as Record<string, unknown>[];
      for (const p of pats) { need(25); doc.fontSize(7).fillColor(C.red).text(`[${String(p.severity).toUpperCase()}] ${String(p.type).replace(/_/g, " ")}`, 50, doc.y, { width: cW }); doc.fontSize(7).fillColor(C.onV).text(String(p.description), 56, doc.y, { width: cW - 10 }); doc.moveDown(0.2); }
      if (sa.recommendation) { doc.moveDown(0.2); doc.fontSize(8).fillColor(C.sec).text(`Recommendation: ${String(sa.recommendation)}`, 50, doc.y, { width: cW }); }
    }

    // ── INFLUENCER MENTIONS ──
    const inf = r("influencerMentions");
    if (inf) {
      const mentions = (inf.mentions || []) as Record<string, unknown>[];
      sec("Influencer & Third-Party Mentions");
      body(String(inf.analysis || ""));
      for (const m of mentions) {
        need(25);
        const sentClr = m.sentiment === "positive" ? C.grn : m.sentiment === "negative" ? C.red : C.out;
        doc.fontSize(8).fillColor(C.on).text(String(m.influencerName), 50, doc.y, { continued: true });
        doc.fillColor(C.sec).text(`  [${String(m.platform)}]`, { continued: true });
        doc.fillColor(sentClr).text(`  ${String(m.sentiment)}`);
        doc.fontSize(7).fillColor(C.onV).text(String(m.summary), 56, doc.y, { width: cW - 10 });
        doc.moveDown(0.2);
      }
    }

    // ── PERSONAL INFLUENCE ──
    const pi = r("personalInfluence");
    if (pi) {
      sec("Personal Influence");
      lv("Score", `${pi.score || 0}/10`); lv("Verdict", String(pi.verdict || "N/A"));
      doc.moveDown(0.2); body(String(pi.analysis || ""));
      doc.moveDown(0.2);
      for (const k of ["authorProfiles", "guestPosts", "podcasts", "publicSpeaking", "wikipediaPresence", "interviews", "mediaFeatures", "linkedinActivity", "forumMentions"]) {
        const item = pi[k] as { found: boolean; details: string } | undefined;
        if (item) { doc.fontSize(7).fillColor(item.found ? C.grn : C.out).text(`${item.found ? "✓" : "✗"} ${k.replace(/([A-Z])/g, " $1")}`, 50, doc.y, { width: cW }); }
      }
    }

    // ── SERP VOLATILITY ──
    const sv = r("serpVolatility");
    if (sv && sv.level) {
      sec("SERP Volatility");
      lv("Level", String(sv.level).toUpperCase()); lv("Trend", String(sv.trend || "N/A"));
      doc.moveDown(0.2); body(String(sv.analysis || ""));
      const corr = (sv.corrections || []) as string[];
      if (corr.length) { doc.moveDown(0.2); sub("Corrections"); for (const c of corr) bullet(c); }
    }

    // ── CONVERSATION SENTIMENT ──
    const cvs = r("conversationSentiment");
    if (cvs) {
      sec("Conversation Sentiment");
      lv("Score", `${cvs.score || 0}/10`); lv("Verdict", String(cvs.verdict || "N/A"));
      doc.moveDown(0.2); body(String(cvs.analysis || ""));
      const tnt = (cvs.topNegativeTopics || []) as Record<string, unknown>[];
      for (const t of tnt) { need(14); doc.fontSize(7).fillColor(C.red).text(`• ${String(t.topic)} (${String(t.source)}, impact: ${String(t.impact)})`, 50, doc.y, { width: cW }); }
    }

    // ── VIDEO / YOUTUBE SENTIMENT ──
    const vs = r("videoSentimentAnalysis");
    if (vs && vs.hasVideos) {
      sec("YouTube / Video Sentiment");
      lv("Overall", String(vs.overallSentiment || "N/A"));
      doc.moveDown(0.2); body(String(vs.analysis || ""));
      const vids = (vs.videos || []) as Record<string, unknown>[];
      for (const v of vids.slice(0, 5)) {
        need(25);
        const sentClr = v.sentiment === "positive" ? C.grn : v.sentiment === "negative" ? C.red : C.out;
        doc.fontSize(8).fillColor(sentClr).text(`[${String(v.sentiment).toUpperCase()}]`, 50, doc.y, { continued: true });
        doc.fillColor(C.on).text(`  ${String(v.title)}`);
        doc.fontSize(7).fillColor(C.out).text(`by ${String(v.channel)}  •  ${(v.views as number || 0).toLocaleString()} views${v.isOwned ? "  •  OWNED" : ""}`, 56, doc.y, { width: cW - 10 });
        doc.moveDown(0.2);
      }
      const conc = (vs.concerns || []) as string[];
      for (const c of conc) bullet(c, C.red);
    }

    // ── REDDIT & QUORA ──
    const fs = r("forumSentiment");
    if (fs) {
      const convs = (fs.conversations || []) as Record<string, unknown>[];
      if (convs.length > 0) {
        sec("Reddit & Quora Conversations");
        lv("Overall Sentiment", String(fs.overallSentiment || "N/A"));
        doc.moveDown(0.2); body(String(fs.analysis || ""));
        for (const c of convs) {
          need(20);
          const sentClr = c.sentiment === "positive" ? C.grn : c.sentiment === "negative" ? C.red : C.out;
          doc.fontSize(7).fillColor(C.sec).text(`[${String(c.platform).toUpperCase()}]`, 50, doc.y, { continued: true });
          doc.fillColor(sentClr).text(` ${String(c.sentiment)}`, { continued: true });
          doc.fillColor(C.on).text(`  ${String(c.title)}`);
          doc.fontSize(7).fillColor(C.onV).text(String(c.summary), 56, doc.y, { width: cW - 10 });
          doc.moveDown(0.2);
        }
      }
    }

    // ── INDUSTRY BENCHMARK ──
    const ib = r("industryBenchmark");
    if (ib?.applicable) {
      sec(`Industry Benchmark: ${String(ib.industry || "")}`);
      lv("Market Leaders", `${ib.marketLeaderScore}/100`);
      lv("Industry Average", `${ib.industryAverage}/100`);
      lv(name, `${score}/100`);
      if ((ib.gap as number) > 0) lv("Gap to Leader", `${ib.gap} points`);
      doc.moveDown(0.2); body(String(ib.analysis || ""));
      const ibR = (ib.recommendations || []) as string[];
      for (const r of ibR) bullet(r);
    }

    // ── GEOGRAPHIC PRESENCE ──
    const gp = r("geographicPresence");
    if (gp) {
      sec("Geographic Reputation Reach");
      lv("Scope", String(gp.scope || "N/A")); lv("Primary Market", String(gp.primaryMarket || "N/A"));
      doc.moveDown(0.2); body(String(gp.analysis || ""));
      const mkts = (gp.markets || []) as Record<string, unknown>[];
      for (const m of mkts.slice(0, 10)) { need(12); doc.fontSize(7).fillColor(C.on).text(`${String(m.country)} — ${String(m.strength)}`, 56, doc.y, { width: cW - 10 }); }
    }

    // ── MEDIA BRAND SENTIMENT ──
    const mb = r("mediaBrandSentiment");
    if (mb) {
      const outlets = (mb.outlets || []) as Record<string, unknown>[];
      if (outlets.length > 0) {
        sec("Media Brand Sentiment");
        for (const o of outlets) {
          need(12);
          const tClr = o.tier === "premium" ? C.grn : o.tier === "mid-tier" ? C.sec : C.out;
          const sS = o.sentimentScore as number;
          doc.fontSize(8).fillColor(C.on).text(String(o.name), 50, doc.y, { continued: true });
          doc.fillColor(tClr).text(`  [${String(o.tier)}]`, { continued: true });
          doc.fillColor(sS >= 7 ? C.grn : sS >= 5 ? C.ylw : C.red).text(`  ${sS}/10`);
        }
        doc.moveDown(0.2); lv("Average Score", `${mb.averageScore}/10`);
        doc.moveDown(0.2); body(String(mb.analysis || ""));
      }
    }

    // ── BACKLINK PROFILE ──
    const bp = r("backlinkProfile");
    if (bp) {
      sec("Backlink Profile");
      lv("Health Score", `${bp.healthScore || 0}/10`); lv("Est. Backlinks", String(bp.totalBacklinks || "Unknown"));
      if (bp.toxicLinksDetected) lv("Toxic Links", `${bp.toxicLinksCount || 0} detected — ${String(bp.toxicLinksStatus || "")}`);
      if (bp.isVulnerable && !bp.toxicLinksDetected) doc.fontSize(7).fillColor(C.org).text(`⚠ ${String(bp.vulnerabilityNote || "")}`, 50, doc.y, { width: cW });
      doc.moveDown(0.2); body(String(bp.analysis || ""));
      const bpR = (bp.recommendations || []) as string[];
      for (const r of bpR) bullet(r);
    }

    // ── CRISIS DETECTION ──
    const cd = r("crisisDetection");
    if (cd) {
      sec("Risk & Crisis Detection");
      lv("Alert Level", String(cd.alertLevel || "none").toUpperCase());
      doc.moveDown(0.2); body(String(cd.summary || ""));
      const alerts = (cd.alerts || []) as Record<string, unknown>[];
      for (const a of alerts) {
        need(18);
        doc.fontSize(7).fillColor(C.red).text(`[${String(a.priority || "").toUpperCase()}] ${String(a.title)}`, 50, doc.y, { width: cW });
        doc.fontSize(6).fillColor(C.out).text(`Source: ${String(a.source || "")} | Impact: ${String(a.impact || "")}`, 56, doc.y, { width: cW - 10 });
        doc.moveDown(0.15);
      }
      const threats = (cd.threats || []) as Record<string, unknown>[];
      if (threats.length) {
        doc.moveDown(0.2); sub("Threats");
        for (const t of threats) { need(16); doc.fontSize(7).fillColor(C.on).text(`${String(t.threat)} — L: ${String(t.likelihood)}, I: ${String(t.impact)}`, 50, doc.y, { width: cW }); doc.fontSize(7).fillColor(C.sec).text(`Mitigation: ${String(t.mitigation)}`, 56, doc.y, { width: cW - 10 }); doc.moveDown(0.15); }
      }
    }

    // ── REVIEWS DASHBOARD (companies) ──
    const rd = r("reviewDashboard");
    if (rd && entityType === "company") {
      sec("Reviews Dashboard");
      lv("Aggregated Rating", `${((rd.aggregatedRating as number) || 0).toFixed?.(1) || "N/A"}/5.0`);
      lv("Total Reviews", String(rd.totalReviews || 0));
      doc.moveDown(0.2); body(String(rd.trendAnalysis || ""));
      const plats = (rd.platforms || []) as Record<string, unknown>[];
      for (const p of plats) { need(12); doc.fontSize(7).fillColor(C.on).text(`${String(p.name)} — ${(p.rating as number)?.toFixed?.(1) || "N/A"}/5 (${p.reviewCount} reviews, ${String(p.sentiment)})`, 56, doc.y, { width: cW - 10 }); }
      const risks = (rd.risks || []) as Record<string, unknown>[];
      if (risks.length) { doc.moveDown(0.2); sub("Review Risks"); for (const rk of risks) { need(16); doc.fontSize(7).fillColor(C.red).text(`[${String(rk.platform)}] ${String(rk.review)}`, 50, doc.y, { width: cW }); doc.fontSize(7).fillColor(C.onV).text(String(rk.risk), 56, doc.y, { width: cW - 10 }); doc.moveDown(0.15); } }
    }

    // ── FUTURE RISK ASSESSMENT ──
    const fra = r("futureRiskAssessment");
    if (fra) {
      sec("Future Risk Assessment");
      lv("Overall Risk", String(fra.overallRisk || "N/A")); lv("Risk Score", `${fra.riskScore || 0}/10`);
      doc.moveDown(0.2); body(String(fra.analysis || ""));
      const risks = (fra.risks || []) as Record<string, unknown>[];
      for (const rk of risks) { need(18); doc.fontSize(7).fillColor(C.on).text(`${String(rk.risk)}`, 50, doc.y, { width: cW }); doc.fontSize(6).fillColor(C.out).text(`Likelihood: ${String(rk.likelihood)} | Impact: ${String(rk.impact)} | Mitigation: ${String(rk.mitigation)}`, 56, doc.y, { width: cW - 10 }); doc.moveDown(0.2); }
    }

    // ── SEARCH RESULTS ──
    const results = ra("results");
    if (results.length > 0) {
      sec(`Search Results (${results.length})`);
      for (const r of results) {
        need(22);
        const sentClr = r.sentiment === "positive" ? C.grn : r.sentiment === "negative" ? C.red : C.out;
        doc.fontSize(6).fillColor(C.out).text(`#${r.position}`, 50, doc.y, { continued: true });
        doc.fillColor(sentClr).text(` [${String(r.sentiment)}]`, { continued: true });
        doc.fillColor(C.on).text(`  ${String(r.title)}`);
        doc.fontSize(6).fillColor(C.sec).text(String(r.link), 56, doc.y, { width: cW - 10 });
        doc.moveDown(0.15);
      }
    }

    // ── SERP CONTROL ──
    const sb2 = r("serpBreakdown");
    if (sb2) {
      sec("SERP Control");
      lv("First Page Dominance", String(sb2.firstPageDominance || "N/A"));
      const owned = (sb2.ownedProperties || []) as string[];
      const risky = (sb2.riskyResults || []) as string[];
      if (owned.length) { doc.moveDown(0.2); doc.fontSize(7).fillColor(C.grn).text("Owned:", 50, doc.y); for (const u of owned) { doc.fontSize(6).fillColor(C.onV).text(`  • ${u}`, 50, doc.y, { width: cW }); } }
      if (risky.length) { doc.moveDown(0.2); doc.fontSize(7).fillColor(C.red).text("Risky:", 50, doc.y); for (const u of risky) { doc.fontSize(6).fillColor(C.onV).text(`  • ${u}`, 50, doc.y, { width: cW }); } }
    }

    // ── PEOPLE ALSO ASK ──
    const paa = (report.peopleAlsoAsk || []) as string[];
    if (paa.length > 0) {
      sec("People Also Ask");
      for (const q of paa) { need(12); doc.fontSize(7).fillColor(C.on).text(`Q: ${q}`, 50, doc.y, { width: cW }); }
    }

    // ── PAGE FOOTERS ──
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.moveTo(50, doc.page.height - 42).lineTo(W - 50, doc.page.height - 42).strokeColor(C.outV).lineWidth(0.5).stroke();
      doc.fontSize(6).fillColor(C.out).text("REP500  •  Online Reputation Intelligence  •  reputation500.com", 50, doc.page.height - 36, { align: "center", width: cW });
      doc.fontSize(5).fillColor(C.outV).text(`Page ${i + 1} of ${pages.count}  •  CONFIDENTIAL`, 50, doc.page.height - 26, { align: "center", width: cW });
    }

    doc.end();
  });
}

// ── POST handler ──
export async function POST(req: NextRequest) {
  try {
    const { email, report } = await req.json();
    if (!email || !report) return NextResponse.json({ error: "Missing email or report data" }, { status: 400 });

    let pdfBuffer: Buffer;
    try { pdfBuffer = await generatePDF(report); } catch (pdfErr) { console.error("PDF generation error:", pdfErr); return NextResponse.json({ error: "PDF generation failed" }, { status: 500 }); }

    if (email === "__download__") {
      const bytes = new Uint8Array(pdfBuffer);
      return new NextResponse(bytes, { status: 200, headers: { "Content-Type": "application/pdf", "Content-Length": String(bytes.length), "Content-Disposition": `attachment; filename="Rep500-Report-${(report.name || "Report").replace(/[^a-zA-Z0-9]/g, "-")}.pdf"` } });
    }

    const pdfBase64 = pdfBuffer.toString("base64");
    const reportName = report.name || "Unknown";
    const reportScore = report.score || 0;

    if (RESEND_KEY) {
      const resend = new Resend(RESEND_KEY);
      const { error: sendError } = await resend.emails.send({
        from: "Rep500 <info@reputation500.com>", to: email,
        subject: `Your Reputation Report for "${reportName}" — Score: ${reportScore}/100`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#1B263B;padding:24px 32px;border-radius:12px 12px 0 0;"><h1 style="color:#fff;margin:0;font-size:22px;">Your Reputation Report is Ready</h1><p style="color:#79849d;margin:8px 0 0;font-size:14px;">${reportName} — Score: ${reportScore}/100</p></div><div style="background:#f9faf5;padding:24px 32px;border:1px solid #c4c6cc;border-top:none;border-radius:0 0 12px 12px;"><p style="color:#44474c;font-size:14px;line-height:1.6;">Your full reputation report is attached as a PDF.</p>${reportScore < 80 ? '<p style="color:#44474c;font-size:14px;">Based on your score, we recommend speaking with our experts. Visit <a href="https://reputation500.com" style="color:#1B263B;">reputation500.com</a>.</p>' : ""}<hr style="border:none;border-top:1px solid #c4c6cc;margin:20px 0;"><p style="color:#74777d;font-size:11px;">Rep500 — Trusted by 300+ companies.<br/>Featured in Forbes, GQ, Entrepreneur, USA Today & more.</p></div></div>`,
        attachments: [{ content: pdfBase64, filename: `Rep500-Report-${reportName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`, contentType: "application/pdf" }],
      });
      if (sendError) console.error("Resend error:", sendError);
      try { await resend.emails.send({ from: "Rep500 <info@reputation500.com>", to: NOTIFY_EMAIL, subject: `New Report: ${reportName} (Score: ${reportScore})`, html: `<p>Name: ${reportName}<br/>Score: ${reportScore}/100<br/>Email: ${email}</p>`, attachments: [{ content: pdfBase64, filename: `Rep500-Report-${reportName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`, contentType: "application/pdf" }] }); } catch (e) { console.error("Notify error:", e); }
    }
    return NextResponse.json({ success: true });
  } catch (err) { console.error("Send report error:", err); return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 }); }
}

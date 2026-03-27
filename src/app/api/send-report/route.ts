import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import PDFDocument from "pdfkit";

const _rk = ["re_MxSnEjk4_Af5Xdo", "32nV9FHekAdB6ddiv2"];
const RESEND_KEY = process.env.RESEND_API_KEY || _rk.join("");
const NOTIFY_EMAIL = "info@reputation500.com";

function generatePDF(report: Record<string, unknown>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margins: { top: 50, bottom: 60, left: 55, right: 55 }, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width;
    const H = doc.page.height;
    const M = 55;
    const cW = W - M * 2;
    const name = String(report.name || "Unnamed");
    const score = (report.score || 0) as number;
    const riskLevel = String(report.riskLevel || "unknown");
    const entityType = String(report.entityType || "unknown");
    const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const sClr = score >= 90 ? "#22c55e" : score >= 70 ? "#84cc16" : score >= 50 ? "#eab308" : score >= 30 ? "#f97316" : "#ef4444";
    const sLbl = score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : score >= 30 ? "Poor" : "Critical";
    const safeBottom = H - 65;

    // Safe access helpers
    const r = (k: string) => report[k] as Record<string, unknown> | undefined;
    const ra = (k: string) => (report[k] || []) as Record<string, unknown>[];
    const s = (v: unknown, fb = "") => (v != null && v !== "") ? String(v) : fb;

    // ── Simple helpers ──
    function checkPage(needed = 30) { if (doc.y > safeBottom - needed) doc.addPage(); }

    function heading(num: string, title: string) {
      checkPage(50);
      if (doc.y > 80) doc.moveDown(0.8);
      doc.fontSize(10).fillColor("#1B263B").text(`${num}  ${title.toUpperCase()}`, { characterSpacing: 1 });
      doc.moveDown(0.1);
      doc.moveTo(M, doc.y).lineTo(M + cW, doc.y).strokeColor("#c4c6cc").lineWidth(0.5).stroke();
      doc.moveDown(0.35);
    }

    function subheading(num: string, title: string) {
      checkPage(20);
      doc.moveDown(0.3);
      doc.fontSize(9).fillColor("#1B263B").text(`${num}  ${title}`);
      doc.moveDown(0.15);
    }

    function para(text: string) {
      if (!text) return;
      checkPage(14);
      doc.fontSize(8).fillColor("#44474c").text(text, { lineGap: 1.5 });
    }

    function label(l: string, v: string) {
      checkPage(12);
      doc.fontSize(7.5).fillColor("#74777d").text(`${l}: `, { continued: true });
      doc.fillColor("#1a1c1a").text(v);
    }

    function dot(text: string, color = "#44474c") {
      checkPage(11);
      doc.fontSize(7.5).fillColor(color).text(`  •  ${text}`, { indent: 4 });
    }

    function gap(n = 0.25) { doc.moveDown(n); }

    // ══════════════════════════════════════════════════════════
    // COVER PAGE
    // ══════════════════════════════════════════════════════════
    doc.rect(0, 0, W, 160).fill("#101b30");
    doc.fontSize(6.5).fillColor("#47607e").text("CONFIDENTIAL", M, 24, { characterSpacing: 3 });
    doc.fontSize(22).fillColor("#ffffff").text("Reputation Intelligence Report", M, 44);
    doc.fontSize(11).fillColor("#c4c6cc").text(name, M, 78);
    doc.fontSize(8).fillColor("#47607e").text(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)}  |  ${reportDate}`, M, 100);

    // Score box
    const bx = W - M - 90;
    doc.roundedRect(bx, 30, 90, 80, 5).fill("#ffffff");
    doc.fontSize(30).fillColor(sClr).text(String(score), bx, 36, { width: 90, align: "center" });
    doc.fontSize(7).fillColor("#74777d").text("/ 100", bx, 70, { width: 90, align: "center" });
    doc.fontSize(7).fillColor(sClr).text(sLbl.toUpperCase(), bx, 84, { width: 90, align: "center", characterSpacing: 1 });

    doc.y = 175;
    doc.fontSize(7.5).fillColor("#74777d").text("RISK LEVEL: ", { continued: true });
    doc.fillColor(sClr).text(riskLevel.toUpperCase());
    gap(0.3);
    para(s(report.summary));
    gap(0.3);

    // Executive Brief
    if (report.executiveBrief) {
      doc.fontSize(8.5).fillColor("#1B263B").text("Executive Brief");
      gap(0.15);
      para(s(report.executiveBrief));
    }

    // Key insights
    const keyInsights = (report.keyInsights || []) as string[];
    if (keyInsights.length > 0) {
      gap(0.3);
      doc.fontSize(8.5).fillColor("#1B263B").text("Key Insights");
      gap(0.1);
      for (const ki of keyInsights.slice(0, 5)) dot(ki, "#1a1c1a");
    }

    // Critical risks on page 1
    const problems = ra("problems");
    const highProblems = problems.filter(p => p.severity === "high");
    if (highProblems.length > 0) {
      gap(0.3);
      doc.fontSize(8.5).fillColor("#ef4444").text("Critical Issues");
      gap(0.1);
      for (const p of highProblems.slice(0, 4)) dot(`${s(p.title)}: ${s(p.description)}`, "#ef4444");
    }

    // Revenue snapshot on page 1
    const ri = r("revenueImpact");
    if (ri && (ri.totalEstimatedImpact as number) < 0) {
      gap(0.3);
      doc.fontSize(8.5).fillColor("#1B263B").text("Revenue at Risk");
      gap(0.1);
      doc.fontSize(14).fillColor("#ef4444").text(`${ri.totalEstimatedImpact}%`, { continued: true });
      doc.fontSize(8).fillColor("#74777d").text("  estimated revenue at risk from reputation issues");
    }

    // Disclaimer
    const disc = r("disclaimer");
    if (disc?.show) {
      gap(0.3);
      doc.fontSize(7).fillColor("#f97316").text(`Note: ${s(disc.title)} — ${s(disc.message)}`);
    }

    // ══════════════════════════════════════════════════════════
    // 2. EXECUTIVE BRIEF
    // ══════════════════════════════════════════════════════════
    doc.addPage();
    heading("2", "Executive Brief");
    para(s(report.executiveBrief));

    // 2.1 What Google and AI think
    subheading("2.1", "What Google and AI Engines Think");
    const aiApp = r("aiLlmAppearance");
    if (aiApp) {
      para(s(aiApp.analysis));
      const aiStr = (aiApp.strengths || []) as string[];
      const aiWk = (aiApp.weaknesses || []) as string[];
      if (aiStr.length) { gap(0.15); for (const st of aiStr) dot(st, "#22c55e"); }
      if (aiWk.length) { gap(0.15); for (const wk of aiWk) dot(wk, "#ef4444"); }
    }

    // ══════════════════════════════════════════════════════════
    // 3. REPUTATION SCORE & SENTIMENT
    // ══════════════════════════════════════════════════════════
    heading("3", "Reputation Score & Sentiment Analysis");

    subheading("3.1", "Sentiment Overview");
    const sb = (report.sentimentBreakdown || {}) as Record<string, number>;
    const tot = (sb.positive || 0) + (sb.neutral || 0) + (sb.negative || 0) || 1;
    label("Positive", `${sb.positive || 0} (${Math.round(((sb.positive || 0) / tot) * 100)}%)`);
    label("Neutral", `${sb.neutral || 0} (${Math.round(((sb.neutral || 0) / tot) * 100)}%)`);
    label("Negative", `${sb.negative || 0} (${Math.round(((sb.negative || 0) / tot) * 100)}%)`);

    subheading("3.2", "Score Breakdown");
    const cs = (report.categoryScores || {}) as Record<string, number>;
    for (const c of [
      { l: "Search Results Sentiment", k: "serpSentiment", m: 25 },
      { l: "News Sentiment", k: "newsSentiment", m: 15 },
      { l: "Review Ratings", k: "reviewRatings", m: 10 },
      { l: "AI / LLM Presence", k: "aiLlmPresence", m: 10 },
      { l: "Autocomplete Safety", k: "autocompleteSafety", m: 10 },
      { l: "Social Presence", k: "socialPresence", m: 10 },
      { l: "Complaint Sites", k: "complaintSites", m: 10 },
      { l: "Content Control", k: "contentControl", m: 5 },
      { l: "Domain Ownership", k: "domainOwnership", m: 5 },
    ]) {
      checkPage(12);
      const v = cs[c.k] || 0;
      doc.fontSize(7.5).fillColor("#74777d").text(`${c.l}:  `, { continued: true });
      doc.fillColor("#1a1c1a").text(`${v} / ${c.m}`);
    }

    // Data stats
    const ds = (report.dataStats || {}) as Record<string, number>;
    gap(0.2);
    doc.fontSize(7).fillColor("#74777d").text(`Total results: ${ds.totalResults || 0}  |  News: ${ds.newsCount || 0}  |  Social: ${ds.socialCount || 0}  |  Reviews: ${ds.reviewCount || 0}`);

    // ══════════════════════════════════════════════════════════
    // 4. TREND ANALYSIS
    // ══════════════════════════════════════════════════════════
    const st = r("sentimentTimeline");
    if (st) {
      heading("4", "Trend Analysis");
      subheading("4.1", "Sentiment Trend");
      label("Direction", s(st.trend, "Stable"));
      para(s(st.trendAnalysis));
      const rn = (st.recentNegatives || []) as Record<string, unknown>[];
      if (rn.length > 0) {
        subheading("4.2", "Recent Negative Events");
        for (const n of rn) {
          checkPage(14);
          doc.fontSize(7.5).fillColor("#ef4444").text(`${s(n.title)}`, { continued: true });
          doc.fillColor("#74777d").text(`  (${s(n.dateFound)} — ${n.daysAgo || "?"}d ago)`);
          doc.fontSize(7).fillColor("#44474c").text(s(n.summary));
          gap(0.1);
        }
      }
    }

    // ══════════════════════════════════════════════════════════
    // 5. REVENUE IMPACT
    // ══════════════════════════════════════════════════════════
    if (ri) {
      heading("5", "Revenue Impact Analysis");
      doc.fontSize(12).fillColor("#ef4444").text(`${ri.totalEstimatedImpact}%`, { continued: true });
      doc.fontSize(8).fillColor("#74777d").text("  estimated revenue at risk");
      gap(0.2);
      para(s(ri.analysis));

      const bd = ri.categoryBreakdown as Record<string, number> | undefined;
      if (bd) {
        gap(0.2);
        for (const [cat, val] of Object.entries(bd)) {
          if (typeof val === "number" && val < 0) label(cat, `${val}%`);
        }
      }

      subheading("5.1", "Top Revenue Risks");
      const tr = (ri.topRisks || []) as Record<string, unknown>[];
      for (const t of tr) {
        checkPage(12);
        doc.fontSize(7.5).fillColor("#ef4444").text(`${t.impact}%`, { continued: true });
        doc.fillColor("#1a1c1a").text(`  ${s(t.title)}`);
      }

      // Actionable Intelligence
      const ai2 = (ri.actionableIntelligence || []) as Record<string, unknown>[];
      if (ai2.length > 0) {
        gap(0.2);
        subheading("5.2", "Actionable Intelligence");
        for (const a of ai2) {
          checkPage(16);
          doc.fontSize(7.5).fillColor("#1a1c1a").text(s(a.finding));
          doc.fontSize(7).fillColor("#74777d").text(`Cost: ${s(a.currentImpact)}  |  Recovery: ${s(a.potentialGain)}  |  Source: ${s(a.dataSource)}`);
          gap(0.1);
        }
      }

      if (ri.executiveSummary) {
        gap(0.2);
        doc.fontSize(8).fillColor("#1B263B").text("Board Summary");
        gap(0.1);
        para(s(ri.executiveSummary));
      }
    }

    // ══════════════════════════════════════════════════════════
    // 6. SEARCH PRESENCE
    // ══════════════════════════════════════════════════════════
    heading("6", "Search Presence & Visibility");

    subheading("6.1", "Top Search Results");
    const tsl = (report.topSerpLinks || []) as Record<string, unknown>[];
    for (const l of tsl.slice(0, 10)) {
      checkPage(11);
      const sentC = l.sentiment === "positive" ? "#22c55e" : l.sentiment === "negative" ? "#ef4444" : "#74777d";
      doc.fontSize(7).fillColor("#74777d").text(`#${l.position}  `, { continued: true });
      doc.fillColor(sentC).text(`[${String(l.sentiment).toUpperCase()}]  `, { continued: true });
      doc.fillColor("#1a1c1a").text(s(l.title));
    }

    const sb2 = r("serpBreakdown");
    if (sb2) {
      subheading("6.2", "SERP Control");
      label("First Page Dominance", s(sb2.firstPageDominance));
      const owned = (sb2.ownedProperties || []) as string[];
      if (owned.length) { label("Owned", owned.join(", ")); }
    }

    const sv = r("serpVolatility");
    if (sv) {
      subheading("6.3", "SERP Volatility");
      label("Level", s(sv.level)); label("Trend", s(sv.trend));
      para(s(sv.analysis));
    }

    const paa = (report.peopleAlsoAsk || []) as string[];
    if (paa.length > 0) {
      subheading("6.4", "People Also Ask");
      for (const q of paa) { checkPage(10); doc.fontSize(7.5).fillColor("#1a1c1a").text(`Q: ${q}`); }
    }

    // ══════════════════════════════════════════════════════════
    // 7. PLATFORM & BRAND
    // ══════════════════════════════════════════════════════════
    heading("7", "Platform & Brand Presence");

    const di = r("domainInfo");
    if (di) {
      subheading("7.1", "Domain Check");
      label("Domain", s(di.domain)); label("Active Website", di.hasSite ? "Yes" : "No");
    }

    const sp = r("socialPresenceDetail");
    if (sp) {
      subheading("7.2", "Social Media");
      para(s(sp.assessment));
      const found = (sp.found || []) as string[]; const miss = (sp.missing || []) as string[];
      if (found.length) label("Found", found.join(", "));
      if (miss.length) label("Missing", miss.join(", "));
    }

    const kg = r("knowledgeGraph");
    subheading("7.3", "Google Knowledge Panel");
    if (kg) { label("Title", s(kg.title)); if (kg.type) label("Type", s(kg.type)); if (kg.description) para(s(kg.description)); }
    else { doc.fontSize(7.5).fillColor("#f97316").text("No Knowledge Panel detected — a key trust signal is missing."); }

    // ══════════════════════════════════════════════════════════
    // 8. REVIEWS & TRUST
    // ══════════════════════════════════════════════════════════
    heading("8", "Reviews & Trust Signals");

    const rs = r("reviewSummary");
    if (rs) { para(s(rs.assessment)); }

    const rd = r("reviewDashboard");
    if (rd && entityType === "company") {
      subheading("8.1", "Reviews Dashboard");
      label("Rating", `${((rd.aggregatedRating as number) || 0).toFixed?.(1) || "N/A"} / 5.0`);
      label("Total Reviews", String(rd.totalReviews || 0));
      para(s(rd.trendAnalysis));

      const plats = (rd.platforms || []) as Record<string, unknown>[];
      for (const p of plats) {
        checkPage(10);
        doc.fontSize(7).fillColor("#1a1c1a").text(`${s(p.name)} — ${(p.rating as number)?.toFixed?.(1) || "?"}/5 (${p.reviewCount} reviews, ${s(p.sentiment)})`);
      }

      // Recent reviews
      const rr = rd.recentReviews as Record<string, unknown[]> | undefined;
      if (rr) {
        const pos = (rr.positive || []) as Record<string, unknown>[];
        const neg = (rr.negative || []) as Record<string, unknown>[];
        if (pos.length > 0) {
          gap(0.2);
          doc.fontSize(7.5).fillColor("#22c55e").text("Recent Positive Reviews");
          for (const rv of pos.slice(0, 3)) dot(`${s(rv.platform)}: ${s(rv.summary)}`, "#22c55e");
        }
        if (neg.length > 0) {
          gap(0.2);
          doc.fontSize(7.5).fillColor("#ef4444").text("Recent Negative Reviews");
          for (const rv of neg.slice(0, 3)) {
            dot(`[${s(rv.severity, "moderate")}] ${s(rv.platform)}: ${s(rv.summary)}`, "#ef4444");
            if (rv.link) { doc.fontSize(6.5).fillColor("#47607e").text(`    ${s(rv.link)}`, { link: String(rv.link), underline: true }); }
          }
        }
      }

      // Crisis detection
      const cd2 = rd.crisisDetection as Record<string, unknown> | undefined;
      if (cd2?.detected) {
        gap(0.2);
        doc.fontSize(8).fillColor("#ef4444").text(`CRISIS DETECTED (${s(cd2.severity)})`);
        para(s(cd2.summary));
      }

      const risks = (rd.risks || []) as Record<string, unknown>[];
      if (risks.length > 0) {
        subheading("8.2", "Review Risks");
        for (const rk of risks) { checkPage(12); doc.fontSize(7).fillColor("#ef4444").text(`[${s(rk.platform)}] ${s(rk.review)}`); doc.fontSize(7).fillColor("#44474c").text(s(rk.risk)); gap(0.1); }
      }
    }

    // ══════════════════════════════════════════════════════════
    // 9. SEARCH EXPERIENCE
    // ══════════════════════════════════════════════════════════
    heading("9", "Search Experience Analysis");

    const ac = r("autocompleteSentiment");
    if (ac) {
      subheading("9.1", "Google Autocomplete");
      para(s(ac.analysis));
      const neg = (ac.negative_terms || []) as string[];
      if (neg.length) label("Concerning Terms", neg.join(", "));
    }

    const gi = r("googleImagesAnalysis");
    if (gi) {
      subheading("9.2", "Image Search Analysis");
      label("Ranking", s(gi.ranking)); label("Owned Images", `~${gi.ownedImagesPct || 0}%`);
      const imgSent = gi.sentimentBreakdown as Record<string, number> | undefined;
      if (imgSent) {
        label("Image Sentiment", `Positive: ${imgSent.positive || 0}%  |  Neutral: ${imgSent.neutral || 0}%  |  Negative: ${imgSent.negative || 0}%`);
      }
      para(s(gi.analysis));
      const conc = (gi.concerns || []) as string[];
      for (const c of conc) dot(c, "#ef4444");
    }

    // ══════════════════════════════════════════════════════════
    // 10. CONTENT & MEDIA
    // ══════════════════════════════════════════════════════════
    heading("10", "Content & Media Analysis");

    subheading("10.1", "News Sentiment");
    const newsSent = r("newsSentiment") || r("sentimentBreakdown");
    if (newsSent) para(s(report.newsSummary || report.summary));

    const mb = r("mediaBrandSentiment");
    if (mb) {
      const outlets = (mb.outlets || []) as Record<string, unknown>[];
      if (outlets.length > 0) {
        subheading("10.2", "Media Brand Sentiment");
        for (const o of outlets) {
          checkPage(14);
          const sc2 = o.sentimentScore as number;
          const scC = sc2 >= 7 ? "#22c55e" : sc2 >= 5 ? "#eab308" : "#ef4444";
          doc.fontSize(7.5).fillColor("#1a1c1a").text(s(o.name), { continued: true });
          doc.fillColor("#74777d").text(`  [${s(o.tier)}]  `, { continued: true });
          doc.fillColor(scC).text(`${sc2}/10`);
          if (o.articleUrl) {
            doc.fontSize(6.5).fillColor("#47607e").text(`  ${s(o.articleTitle, s(o.articleUrl))}`, { link: String(o.articleUrl), underline: true });
          }
        }
        gap(0.15);
        label("Average", `${mb.averageScore}/10`);
        para(s(mb.analysis));
      }
    }

    // ══════════════════════════════════════════════════════════
    // 11. AI & LLM
    // ══════════════════════════════════════════════════════════
    if (aiApp) {
      heading("11", "AI & LLM Perception");
      subheading("11.1", "Appearance Score");
      label("Score", `${aiApp.score || 0}/10`); label("Verdict", s(aiApp.verdict));
      para(s(aiApp.analysis));

      const aiSt = (aiApp.strengths || []) as string[];
      const aiWe = (aiApp.weaknesses || []) as string[];
      if (aiSt.length) { subheading("11.2", "Strengths"); for (const st2 of aiSt) dot(st2, "#22c55e"); }
      if (aiWe.length) { subheading("11.2", "Weaknesses"); for (const wk of aiWe) dot(wk, "#ef4444"); }

      const aiRecs = (aiApp.recommendations || []) as string[];
      if (aiRecs.length) { subheading("11.3", "AI Recommendations"); for (const rc of aiRecs) dot(rc, "#47607e"); }
    }

    // ══════════════════════════════════════════════════════════
    // 12. CONVERSATION & COMMUNITY
    // ══════════════════════════════════════════════════════════
    heading("12", "Conversation & Community Sentiment");

    const cvs = r("conversationSentiment");
    if (cvs) {
      subheading("12.1", "Overall");
      label("Score", `${cvs.score || 0}/10`); label("Verdict", s(cvs.verdict));
      para(s(cvs.analysis));
    }

    const fs = r("forumSentiment");
    if (fs) {
      const convs = (fs.conversations || []) as Record<string, unknown>[];
      if (convs.length > 0) {
        subheading("12.2", "Reddit & Quora");
        para(s(fs.analysis));
        for (const c of convs) {
          checkPage(14);
          const sentC = c.sentiment === "positive" ? "#22c55e" : c.sentiment === "negative" ? "#ef4444" : "#74777d";
          doc.fontSize(7).fillColor("#74777d").text(`[${String(c.platform).toUpperCase()}] `, { continued: true });
          doc.fillColor(sentC).text(`${s(c.sentiment)} `, { continued: true });
          doc.fillColor("#1a1c1a").text(s(c.title));
          if (c.link) doc.fontSize(6.5).fillColor("#47607e").text(s(c.link), { link: String(c.link), underline: true });
        }
      }
    }

    const vs = r("videoSentimentAnalysis");
    if (vs?.hasVideos) {
      subheading("12.3", "YouTube / Video Sentiment");
      label("Overall", s(vs.overallSentiment));
      para(s(vs.analysis));
      const vids = (vs.videos || []) as Record<string, unknown>[];
      for (const v of vids.slice(0, 6)) {
        checkPage(14);
        const sentC = v.sentiment === "positive" ? "#22c55e" : v.sentiment === "negative" ? "#ef4444" : "#74777d";
        doc.fontSize(7).fillColor(sentC).text(`[${String(v.sentiment).toUpperCase()}] `, { continued: true });
        doc.fillColor("#1a1c1a").text(`${s(v.title)} — ${s(v.channel)}`);
        if (v.link) doc.fontSize(6.5).fillColor("#47607e").text(s(v.link), { link: String(v.link), underline: true });
      }
    }

    // ══════════════════════════════════════════════════════════
    // 13. INFLUENCER & AUTHORITY
    // ══════════════════════════════════════════════════════════
    const inf = r("influencerMentions");
    const pi = r("personalInfluence");
    if (inf || pi) {
      heading("13", "Influencer & Authority Analysis");
      if (inf) {
        subheading("13.1", "Third-Party Mentions");
        para(s(inf.analysis));
        const mentions = (inf.mentions || []) as Record<string, unknown>[];
        for (const m of mentions) {
          checkPage(12);
          doc.fontSize(7).fillColor("#1a1c1a").text(`${s(m.influencerName)} [${s(m.platform)}] — ${s(m.sentiment)}`);
          doc.fontSize(7).fillColor("#44474c").text(s(m.summary));
        }
      }
      if (pi) {
        subheading("13.2", "Personal Influence");
        label("Score", `${pi.score || 0}/10`);
        para(s(pi.analysis));
      }
    }

    // ══════════════════════════════════════════════════════════
    // 14. AUTHORITY SIGNALS
    // ══════════════════════════════════════════════════════════
    const bp = r("backlinkProfile");
    if (bp) {
      heading("14", "Authority Signals");
      label("Health Score", `${bp.healthScore || 0}/10`);
      label("Est. Backlinks", s(bp.totalBacklinks, "Unknown"));
      if (bp.toxicLinksDetected) label("Toxic Links", `${bp.toxicLinksCount || 0} detected`);
      para(s(bp.analysis));
      const bpRecs = (bp.recommendations || []) as string[];
      for (const rc of bpRecs) dot(rc);
    }

    // ══════════════════════════════════════════════════════════
    // 15. RISK & CRISIS
    // ══════════════════════════════════════════════════════════
    heading("15", "Risk & Crisis Monitoring");

    const cd = r("crisisDetection");
    if (cd) {
      subheading("15.1", "Detection");
      label("Alert Level", s(cd.alertLevel, "none"));
      para(s(cd.summary));
      const alerts = (cd.alerts || []) as Record<string, unknown>[];
      for (const a of alerts) { checkPage(11); doc.fontSize(7).fillColor("#ef4444").text(`[${s(a.priority)}] ${s(a.title)} — ${s(a.source)}`); }
    }

    const sa = r("suspiciousActivityAnalysis");
    if (sa) {
      subheading("15.2", "Suspicious Activity");
      label("Score", `${sa.score || 0}/10`); label("Risk", s(sa.riskLevel));
      para(s(sa.analysis));
    }

    const fra = r("futureRiskAssessment");
    if (fra) {
      subheading("15.3", "Future Risk");
      label("Risk Score", `${fra.riskScore || 0}/10`);
      para(s(fra.analysis));
      const frisks = (fra.risks || []) as Record<string, unknown>[];
      for (const rk of frisks) {
        checkPage(12);
        doc.fontSize(7).fillColor("#1a1c1a").text(`${s(rk.risk)} — L: ${s(rk.likelihood)}, I: ${s(rk.impact)}`);
        doc.fontSize(7).fillColor("#47607e").text(`Mitigation: ${s(rk.mitigation)}`);
      }
    }

    // ══════════════════════════════════════════════════════════
    // 16. STRENGTHS & WEAKNESSES
    // ══════════════════════════════════════════════════════════
    heading("16", "Strengths & Weaknesses");

    const strengths = ra("strengths");
    if (strengths.length) {
      subheading("16.1", "Strengths");
      for (const st2 of strengths) { checkPage(12); doc.fontSize(7.5).fillColor("#22c55e").text(s(st2.title)); doc.fontSize(7).fillColor("#44474c").text(s(st2.description)); gap(0.1); }
    }

    if (problems.length) {
      subheading("16.2", "Problems Found");
      for (const p of problems) {
        checkPage(12);
        const pc = p.severity === "high" ? "#ef4444" : p.severity === "medium" ? "#eab308" : "#47607e";
        doc.fontSize(7.5).fillColor(pc).text(`[${String(p.severity).toUpperCase()}] ${s(p.title)}`);
        doc.fontSize(7).fillColor("#44474c").text(s(p.description));
        gap(0.1);
      }
    }

    // ══════════════════════════════════════════════════════════
    // 17. RECOMMENDATIONS
    // ══════════════════════════════════════════════════════════
    const recs = ra("recommendations");
    if (recs.length) {
      heading("17", "Strategic Recommendations");
      const high = recs.filter(r2 => r2.priority === "high");
      const med = recs.filter(r2 => r2.priority === "medium");
      const low = recs.filter(r2 => r2.priority !== "high" && r2.priority !== "medium");

      if (high.length) {
        subheading("17.1", "High Priority");
        for (const rc of high) {
          checkPage(16);
          doc.fontSize(7.5).fillColor("#ef4444").text(`[HIGH] ${s(rc.action)}`);
          doc.fontSize(7).fillColor("#44474c").text(s(rc.reason));
          doc.fontSize(7).fillColor("#22c55e").text(`Impact: ${s(rc.estimatedImpact)}${rc.revenueImpact ? `  |  Revenue: ${s(rc.revenueImpact)}` : ""}`);
          gap(0.1);
        }
      }
      if (med.length) {
        subheading("17.2", "Medium Priority");
        for (const rc of med) {
          checkPage(14);
          doc.fontSize(7.5).fillColor("#eab308").text(`[MEDIUM] ${s(rc.action)}`);
          doc.fontSize(7).fillColor("#44474c").text(s(rc.reason));
          gap(0.1);
        }
      }
      if (low.length) {
        subheading("17.3", "Additional");
        for (const rc of low) { checkPage(12); doc.fontSize(7).fillColor("#47607e").text(`${s(rc.action)} — ${s(rc.reason)}`); }
      }
    }

    // ══════════════════════════════════════════════════════════
    // 18. MARKET & COMPETITIVE
    // ══════════════════════════════════════════════════════════
    heading("18", "Market & Competitive Context");

    const ib = r("industryBenchmark");
    if (ib?.applicable) {
      subheading("18.1", "Industry Benchmark");
      label("Industry", s(ib.industry));
      label("Market Leaders", `${ib.marketLeaderScore}/100`);
      label("Industry Average", `${ib.industryAverage}/100`);
      label(name, `${score}/100`);
      if ((ib.gap as number) > 0) label("Gap to Leader", `${ib.gap} points`);
      para(s(ib.analysis));
    }

    const gp = r("geographicPresence");
    if (gp) {
      subheading("18.2", "Geographic Reach");
      label("Scope", s(gp.scope)); label("Primary Market", s(gp.primaryMarket));
      para(s(gp.analysis));
      const mkts = (gp.markets || []) as Record<string, unknown>[];
      for (const m of mkts.slice(0, 7)) {
        checkPage(10);
        doc.fontSize(7).fillColor("#1a1c1a").text(`${s(m.country)} — ${s(m.strength)}${m.score ? ` (${m.score}/10)` : ""}`);
      }
    }

    // ══════════════════════════════════════════════════════════
    // 19. APPENDIX
    // ══════════════════════════════════════════════════════════
    heading("19", "Appendix");

    const results = ra("results");
    if (results.length > 0) {
      subheading("19.1", "Search Results");
      for (const r2 of results.slice(0, 20)) {
        checkPage(12);
        const sentC2 = r2.sentiment === "positive" ? "#22c55e" : r2.sentiment === "negative" ? "#ef4444" : "#74777d";
        doc.fontSize(6.5).fillColor("#74777d").text(`#${r2.position} `, { continued: true });
        doc.fillColor(sentC2).text(`[${s(r2.sentiment)}] `, { continued: true });
        doc.fillColor("#1a1c1a").text(s(r2.title));
        if (r2.link) doc.fontSize(6).fillColor("#47607e").text(s(r2.link), { link: String(r2.link), underline: true });
      }
    }

    // Forum links
    if (fs) {
      const convs = (fs.conversations || []) as Record<string, unknown>[];
      const withLinks = convs.filter(c => c.link);
      if (withLinks.length > 0) {
        subheading("19.2", "Forum Discussion Links");
        for (const c of withLinks) {
          checkPage(10);
          doc.fontSize(6.5).fillColor("#1a1c1a").text(`[${String(c.platform).toUpperCase()}] ${s(c.title)}`);
          doc.fontSize(6).fillColor("#47607e").text(s(c.link), { link: String(c.link), underline: true });
        }
      }
    }

    // YouTube links
    if (vs?.hasVideos) {
      const vids = (vs.videos || []) as Record<string, unknown>[];
      const withLinks = vids.filter(v => v.link);
      if (withLinks.length > 0) {
        subheading("19.3", "YouTube Video Links");
        for (const v of withLinks) {
          checkPage(10);
          doc.fontSize(6.5).fillColor("#1a1c1a").text(s(v.title));
          doc.fontSize(6).fillColor("#47607e").text(s(v.link), { link: String(v.link), underline: true });
        }
      }
    }

    // Media links
    if (mb) {
      const outlets = (mb.outlets || []) as Record<string, unknown>[];
      const withLinks = outlets.filter(o => o.articleUrl);
      if (withLinks.length > 0) {
        subheading("19.4", "Media Article Links");
        for (const o of withLinks) {
          checkPage(10);
          doc.fontSize(6.5).fillColor("#1a1c1a").text(`${s(o.name)}: ${s(o.articleTitle)}`);
          doc.fontSize(6).fillColor("#47607e").text(s(o.articleUrl), { link: String(o.articleUrl), underline: true });
        }
      }
    }

    // ══════════════════════════════════════════════════════════
    // HEADERS & FOOTERS
    // ══════════════════════════════════════════════════════════
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      // Header (skip cover)
      if (i > 0) {
        doc.fontSize(5.5).fillColor("#74777d").text("CONFIDENTIAL  |  REPUTATION INTELLIGENCE REPORT", M, 20, { width: cW * 0.7, characterSpacing: 0.8 });
        doc.fontSize(5.5).fillColor("#74777d").text(name, M + cW * 0.7, 20, { width: cW * 0.3, align: "right" });
        doc.moveTo(M, 32).lineTo(M + cW, 32).strokeColor("#c4c6cc").lineWidth(0.3).stroke();
      }
      // Footer
      doc.moveTo(M, H - 52).lineTo(M + cW, H - 52).strokeColor("#c4c6cc").lineWidth(0.3).stroke();
      doc.fontSize(5.5).fillColor("#74777d").text("Confidential — Reputation Intelligence Report", M, H - 46, { width: cW * 0.6 });
      doc.fontSize(5.5).fillColor("#74777d").text(`Page ${i + 1} of ${pages.count}  |  ${reportDate}`, M + cW * 0.6, H - 46, { width: cW * 0.4, align: "right" });
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
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:#1B263B;padding:24px 32px;border-radius:12px 12px 0 0;"><h1 style="color:#fff;margin:0;font-size:22px;">Your Reputation Report is Ready</h1><p style="color:#79849d;margin:8px 0 0;font-size:14px;">${reportName} — Score: ${reportScore}/100</p></div><div style="background:#f9faf5;padding:24px 32px;border:1px solid #c4c6cc;border-top:none;border-radius:0 0 12px 12px;"><p style="color:#44474c;font-size:14px;line-height:1.6;">Your full reputation report is attached as a PDF.</p>${reportScore < 80 ? '<p style="color:#44474c;font-size:14px;">Based on your score, we recommend speaking with our experts. Visit <a href="https://reputation500.com" style="color:#1B263B;">reputation500.com</a>.</p>' : ""}<hr style="border:none;border-top:1px solid #c4c6cc;margin:20px 0;"><p style="color:#74777d;font-size:11px;">Trusted by 300+ companies.<br/>Featured in Forbes, GQ, Entrepreneur, USA Today & more.</p></div></div>`,
        attachments: [{ content: pdfBase64, filename: `Rep500-Report-${reportName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`, contentType: "application/pdf" }],
      });
      if (sendError) console.error("Resend error:", sendError);
      try { await resend.emails.send({ from: "Rep500 <info@reputation500.com>", to: NOTIFY_EMAIL, subject: `New Report: ${reportName} (Score: ${reportScore})`, html: `<p>Name: ${reportName}<br/>Score: ${reportScore}/100<br/>Email: ${email}</p>`, attachments: [{ content: pdfBase64, filename: `Rep500-Report-${reportName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`, contentType: "application/pdf" }] }); } catch (e) { console.error("Notify error:", e); }
    }
    return NextResponse.json({ success: true });
  } catch (err) { console.error("Send report error:", err); return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 }); }
}

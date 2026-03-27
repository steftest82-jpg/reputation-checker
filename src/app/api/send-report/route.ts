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
    const doc = new PDFDocument({ size: "A4", margin: 60, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width;
    const H = doc.page.height;
    const ML = 60; // left margin
    const MR = 60; // right margin
    const cW = W - ML - MR; // content width
    const name = String(report.name || "Unnamed");
    const score = (report.score || 0) as number;
    const riskLevel = String(report.riskLevel || "unknown");
    const entityType = String(report.entityType || "unknown");
    const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // ── Helpers ──
    const footerZone = 58;
    const headerZone = 38;
    const usableTop = headerZone + 12;
    const usableBottom = H - footerZone;

    function need(n: number) {
      if (doc.y > usableBottom - n) {
        doc.addPage();
        doc.y = usableTop; // always start below header zone on new pages
      }
    }

    function sec(num: string, title: string) {
      need(40);
      if (doc.y > usableTop + 10) doc.moveDown(0.6);
      doc.fontSize(11).fillColor(C.pri).text(`${num}    ${title.toUpperCase()}`, ML, doc.y, { characterSpacing: 1.2, width: cW });
      doc.moveDown(0.1);
      doc.moveTo(ML, doc.y).lineTo(ML + cW, doc.y).strokeColor(C.pri).lineWidth(0.5).stroke();
      doc.moveDown(0.3);
    }

    function sub(num: string, t: string) {
      need(18);
      doc.moveDown(0.3);
      doc.fontSize(9).fillColor(C.pri).text(`${num}  ${t}`, ML, doc.y, { width: cW });
      doc.moveDown(0.15);
    }

    function body(t: string) {
      if (!t) return;
      need(16);
      doc.fontSize(8).fillColor(C.onV).text(String(t), ML, doc.y, { width: cW, lineGap: 2 });
    }

    function lv(l: string, v: string) {
      need(12);
      doc.fontSize(7.5).fillColor(C.out).text(l, ML, doc.y, { continued: true, width: cW });
      doc.fillColor(C.on).text(`  ${v}`);
    }

    function bullet(t: string, color = C.onV) {
      need(12);
      doc.fontSize(7.5).fillColor(color).text(`    •  ${t}`, ML, doc.y, { width: cW - 8, lineGap: 1 });
    }

    function link(label: string, url: string | undefined, color = C.sec) {
      if (!url) return;
      need(10);
      doc.fontSize(7).fillColor(color).text(label, ML + 12, doc.y, { width: cW - 16, link: String(url), underline: true });
    }

    function bar(x: number, y: number, w: number, pct: number, color: string) {
      doc.roundedRect(x, y, w, 4, 2).fill(C.outV);
      if (pct > 0) doc.roundedRect(x, y, Math.max(4, (pct / 100) * w), 4, 2).fill(color);
    }

    function scoreClr(pct: number) { return pct >= 80 ? C.grn : pct >= 60 ? "#84cc16" : pct >= 40 ? C.ylw : pct >= 20 ? C.org : C.red; }
    const sClr = score >= 90 ? C.grn : score >= 70 ? "#84cc16" : score >= 50 ? C.ylw : score >= 30 ? C.org : C.red;
    const sLbl = score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : score >= 30 ? "Poor" : "Critical";

    function tableRow(cols: { text: string; width: number; color?: string; align?: "left" | "center" | "right" }[], y?: number) {
      need(12);
      const rowY = y ?? doc.y;
      let x = ML;
      for (const col of cols) {
        doc.fontSize(7).fillColor(col.color || C.on).text(col.text, x, rowY, { width: col.width, align: col.align || "left" });
        x += col.width;
      }
      doc.y = rowY + 11;
    }

    function tableHeader(cols: { text: string; width: number }[]) {
      need(16);
      const rowY = doc.y;
      doc.rect(ML, rowY - 2, cW, 12).fill("#f0f1ed");
      let x = ML;
      for (const col of cols) {
        doc.fontSize(6.5).fillColor(C.pri).text(col.text.toUpperCase(), x + 3, rowY, { width: col.width - 6, characterSpacing: 0.5 });
        x += col.width;
      }
      doc.y = rowY + 12;
    }

    function divider() {
      doc.moveTo(ML, doc.y).lineTo(ML + cW, doc.y).strokeColor(C.outV).lineWidth(0.3).stroke();
      doc.moveDown(0.3);
    }

    // Cast helpers
    const r = (k: string) => report[k] as Record<string, unknown> | undefined;
    const ra = (k: string) => (report[k] || []) as Record<string, unknown>[];
    const s = (v: unknown, fallback = "N/A") => v ? String(v) : fallback;

    // ════════════════════════════════════════════════════════════════
    // COVER PAGE
    // ════════════════════════════════════════════════════════════════
    // Dark header band
    doc.rect(0, 0, W, 180).fill(C.priC);

    doc.fontSize(7).fillColor(C.sec).text("CONFIDENTIAL", ML, 28, { characterSpacing: 3, width: cW });
    doc.fontSize(26).fillColor(C.wht).text("Online Reputation", ML, 50);
    doc.fontSize(26).fillColor(C.wht).text("Intelligence Report", ML, 80);
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor(C.outV).text(name, ML, 116);
    doc.fontSize(8.5).fillColor(C.sec).text(
      `${entityType.charAt(0).toUpperCase() + entityType.slice(1)}  |  ${reportDate}`,
      ML, 136
    );

    // Score box on cover
    const boxX = W - MR - 100;
    doc.roundedRect(boxX, 40, 100, 90, 6).fill(C.wht);
    doc.fontSize(36).fillColor(sClr).text(String(score), boxX, 48, { width: 100, align: "center" });
    doc.fontSize(8).fillColor(C.out).text("/ 100", boxX, 88, { width: 100, align: "center" });
    doc.fontSize(7.5).fillColor(sClr).text(sLbl.toUpperCase(), boxX, 102, { width: 100, align: "center", characterSpacing: 1.5 });

    // === PAGE 1 BODY: Executive Summary, Critical Issues, Revenue Snapshot ===
    doc.y = 198;

    // Risk level
    doc.fontSize(8).fillColor(C.out).text("RISK LEVEL: ", ML, doc.y, { continued: true, characterSpacing: 1 });
    doc.fillColor(sClr).text(riskLevel.toUpperCase(), { characterSpacing: 1 });
    doc.moveDown(0.5);

    // Summary
    body(String(report.summary || ""));
    doc.moveDown(0.6);

    // Key insights from executiveBrief if short enough
    const keyInsights = (report.keyInsights || []) as string[];
    if (keyInsights.length > 0) {
      doc.fontSize(9).fillColor(C.pri).text("Key Insights", ML, doc.y, { width: cW });
      doc.moveDown(0.2);
      for (const insight of keyInsights.slice(0, 5)) bullet(insight, C.on);
      doc.moveDown(0.4);
    }

    // Critical risks on page 1
    const criticalRisks = (report.criticalRisks || []) as string[];
    const problems = ra("problems").filter(p => p.severity === "high");
    const critItems = criticalRisks.length > 0 ? criticalRisks : problems.slice(0, 3).map(p => String(p.title));
    if (critItems.length > 0) {
      doc.fontSize(9).fillColor(C.red).text("Critical Risks", ML, doc.y, { width: cW });
      doc.moveDown(0.2);
      for (const cr of critItems.slice(0, 5)) bullet(cr, C.red);
      doc.moveDown(0.4);
    }

    // Priority actions on page 1
    const priorityActions = (report.priorityActions || []) as string[];
    const highRecs = ra("recommendations").filter(rc => rc.priority === "high");
    const actItems = priorityActions.length > 0 ? priorityActions : highRecs.slice(0, 3).map(rc => String(rc.action));
    if (actItems.length > 0) {
      doc.fontSize(9).fillColor(C.grn).text("Priority Actions", ML, doc.y, { width: cW });
      doc.moveDown(0.2);
      for (const pa of actItems.slice(0, 5)) bullet(pa, "#059669");
      doc.moveDown(0.4);
    }

    // Revenue snapshot on page 1
    const ri = r("revenueImpact");
    if (ri) {
      const totalImpact = ri.totalEstimatedImpact as number | undefined;
      if (totalImpact && totalImpact < 0) {
        doc.fontSize(9).fillColor(C.pri).text("Revenue Snapshot", ML, doc.y, { width: cW });
        doc.moveDown(0.2);
        doc.fontSize(14).fillColor(C.red).text(`${totalImpact}%`, ML, doc.y, { continued: true });
        doc.fontSize(8.5).fillColor(C.out).text("  estimated revenue at risk");
        doc.moveDown(0.2);
      }
    }

    // Disclaimer
    const disc = r("disclaimer");
    if (disc?.show) {
      doc.moveDown(0.3);
      doc.fontSize(7.5).fillColor(C.org).text(`Note: ${String(disc.title || "")} — ${String(disc.message || "")}`, ML, doc.y, { width: cW });
    }

    // Media presence warning
    const mpw = r("mediaPresenceWarning");
    if (mpw && !mpw.hasAdequateMedia && mpw.warning) {
      doc.moveDown(0.2);
      doc.fontSize(7.5).fillColor(C.org).text(`Low Media Coverage: ${String(mpw.warning)}`, ML, doc.y, { width: cW });
    }


    // ════════════════════════════════════════════════════════════════
    // 2. EXECUTIVE BRIEF
    // ════════════════════════════════════════════════════════════════
    sec("2", "Executive Brief");
    if (report.executiveBrief) {
      body(String(report.executiveBrief));
      doc.moveDown(0.4);
    }
    // What Google and AI think about this brand
    const aiAppearance = r("aiLlmAppearance");
    const executiveSummaryAI = aiAppearance?.verdict ? String(aiAppearance.verdict) : "";
    if (executiveSummaryAI) {
      sub("2.1", "What Google and AI Think About This Brand");
      body(executiveSummaryAI);
    }


    // ════════════════════════════════════════════════════════════════
    // 3. REPUTATION SCORE & SENTIMENT ANALYSIS
    // ════════════════════════════════════════════════════════════════
    sec("3", "Reputation Score & Sentiment Analysis");

    // 3.1 Overview
    sub("3.1", "Score Overview");
    doc.fontSize(8.5).fillColor(C.on).text(`Overall Score: ${score}/100 (${sLbl})`, ML, doc.y, { width: cW });
    doc.moveDown(0.2);
    doc.fontSize(8.5).fillColor(C.on).text(`Risk Level: ${riskLevel}`, ML, doc.y, { width: cW });
    doc.moveDown(0.4);

    // 3.2 Score Breakdown
    sub("3.2", "Score Breakdown");
    const cs = (report.categoryScores || {}) as Record<string, number>;
    const scoreItems = [
      { l: "Search Results Sentiment", k: "serpSentiment", m: 25 },
      { l: "News Sentiment", k: "newsSentiment", m: 15 },
      { l: "Review Ratings", k: "reviewRatings", m: 10 },
      { l: "AI / LLM Appearance", k: "aiLlmPresence", m: 10 },
      { l: "Autocomplete Safety", k: "autocompleteSafety", m: 10 },
      { l: "Social Media Presence", k: "socialPresence", m: 10 },
      { l: "Complaint Sites", k: "complaintSites", m: 10 },
      { l: "Content Control", k: "contentControl", m: 5 },
      { l: "Domain Ownership", k: "domainOwnership", m: 5 },
    ];
    for (const c of scoreItems) {
      need(16);
      const v = cs[c.k] || 0;
      const pct = Math.round((v / c.m) * 100);
      doc.fontSize(8).fillColor(C.onV).text(c.l, ML, doc.y, { continued: true });
      doc.fillColor(C.pri).text(`  ${v}/${c.m}`);
      bar(ML, doc.y + 1, 200, pct, scoreClr(pct));
      doc.y += 14;
    }

    // 3.3 Sentiment Distribution
    sub("3.3", "Sentiment Distribution");
    const sb = (report.sentimentBreakdown || {}) as Record<string, number>;
    const tot = (sb.positive || 0) + (sb.neutral || 0) + (sb.negative || 0) || 1;
    const pP = Math.round(((sb.positive || 0) / tot) * 100);
    const nP = Math.round(((sb.neutral || 0) / tot) * 100);
    const ngP = Math.round(((sb.negative || 0) / tot) * 100);
    const bY = doc.y;
    const pW = (pP / 100) * cW;
    const nW = (nP / 100) * cW;
    if (pW > 0) doc.rect(ML, bY, pW, 7).fill(C.grn);
    if (nW > 0) doc.rect(ML + pW, bY, nW, 7).fill(C.outV);
    if (ngP > 0) doc.rect(ML + pW + nW, bY, cW - pW - nW, 7).fill(C.red);
    doc.y = bY + 14;
    doc.fontSize(7.5).fillColor(C.grn).text(`Positive: ${sb.positive || 0} (${pP}%)`, ML, doc.y, { continued: true });
    doc.fillColor(C.out).text(`    Neutral: ${sb.neutral || 0} (${nP}%)`, { continued: true });
    doc.fillColor(C.red).text(`    Negative: ${sb.negative || 0} (${ngP}%)`);
    doc.moveDown(0.4);

    // Data stats
    const ds = (report.dataStats || {}) as Record<string, number>;
    doc.fontSize(7).fillColor(C.on).text(
      `Total Results: ${ds.totalResults || 0}   |   News: ${ds.newsCount || 0}   |   Social: ${ds.socialCount || 0}   |   Reviews: ${ds.reviewCount || 0}   |   Complaints: ${ds.complaintCount || 0}   |   Unique Top-10 Domains: ${ds.uniqueDomainsInTop10 || 0}`,
      ML, doc.y, { width: cW }
    );


    // ════════════════════════════════════════════════════════════════
    // 4. TREND ANALYSIS
    // ════════════════════════════════════════════════════════════════
    const st = r("sentimentTimeline");
    if (st && st.trend) {
      sec("4", "Trend Analysis");
      sub("4.1", "Sentiment Trend");
      lv("Trend Direction", String(st.trend).toUpperCase());
      doc.moveDown(0.2);
      body(String(st.trendAnalysis || ""));

      const rn = (st.recentNegatives || []) as Record<string, unknown>[];
      if (rn.length > 0) {
        sub("4.2", "Recent Negative Events");
        for (const n of rn) {
          need(18);
          doc.fontSize(8).fillColor(C.on).text(String(n.title || ""), ML + 8, doc.y, { width: cW - 12 });
          doc.fontSize(7).fillColor(C.out).text(`${s(n.dateFound, "")} (${n.daysAgo || "?"}d ago) — ${s(n.summary, "")}`, ML + 8, doc.y, { width: cW - 12 });
          doc.moveDown(0.15);
        }
      }
    }


    // ════════════════════════════════════════════════════════════════
    // 5. REVENUE IMPACT ANALYSIS
    // ════════════════════════════════════════════════════════════════
    if (ri) {
      sec("5", "Revenue Impact Analysis");
      const totalImpact = ri.totalEstimatedImpact as number | undefined;
      if (totalImpact && totalImpact < 0) {
        doc.fontSize(18).fillColor(C.red).text(`${totalImpact}%`, ML, doc.y, { continued: true });
        doc.fontSize(9).fillColor(C.out).text("  estimated revenue at risk");
        doc.moveDown(0.4);
      }
      body(String(ri.analysis || ""));
      doc.moveDown(0.3);

      // Channel breakdown
      const bd = ri.categoryBreakdown as Record<string, number> | undefined;
      if (bd && Object.keys(bd).length > 0) {
        doc.fontSize(8).fillColor(C.pri).text("Channel Breakdown:", ML, doc.y, { width: cW });
        doc.moveDown(0.15);
        for (const [cat, val] of Object.entries(bd)) {
          if (val < 0) {
            need(12);
            doc.fontSize(7.5).fillColor(C.onV).text(`${cat}:`, ML + 8, doc.y, { continued: true });
            doc.fillColor(C.red).text(` ${val}%`);
          }
        }
        doc.moveDown(0.3);
      }

      // 5.1 Top risks
      const tr = (ri.topRisks || []) as Record<string, unknown>[];
      if (tr.length > 0) {
        sub("5.1", "Top Revenue Risks");
        for (const t of tr) {
          need(14);
          doc.fontSize(8).fillColor(C.red).text(`${t.impact || ""}%`, ML + 8, doc.y, { continued: true });
          doc.fillColor(C.on).text(`  ${String(t.title || "")}`);
        }
        doc.moveDown(0.3);
      }

      // Actionable intelligence
      const actionableIntel = (ri.actionableIntelligence || []) as string[];
      if (actionableIntel.length > 0) {
        doc.fontSize(8.5).fillColor(C.pri).text("Actionable Intelligence", ML, doc.y, { width: cW });
        doc.moveDown(0.15);
        for (const item of actionableIntel) bullet(item, "#059669");
        doc.moveDown(0.3);
      }

      // Board/executive summary
      const execSummary = ri.executiveSummary as string | undefined;
      if (execSummary) {
        doc.fontSize(8.5).fillColor(C.pri).text("Board Summary", ML, doc.y, { width: cW });
        doc.moveDown(0.15);
        body(execSummary);
      }
    }


    // ════════════════════════════════════════════════════════════════
    // 6. SEARCH PRESENCE & VISIBILITY
    // ════════════════════════════════════════════════════════════════
    sec("6", "Search Presence & Visibility");

    // 6.1 Top SERP results
    const tsl = (report.topSerpLinks || []) as Record<string, unknown>[];
    if (tsl.length > 0) {
      sub("6.1", "SERP Results (Page 1)");
      tableHeader([
        { text: "#", width: 30 },
        { text: "Sentiment", width: 65 },
        { text: "Title", width: cW - 95 },
      ]);
      for (const l of tsl.slice(0, 10)) {
        need(14);
        const sentClr = l.sentiment === "positive" ? C.grn : l.sentiment === "negative" ? C.red : C.out;
        const ownTag = l.isOwned ? "  [OWNED]" : "";
        tableRow([
          { text: `${l.position || ""}`, width: 30, color: C.out },
          { text: String(l.sentiment || "").toUpperCase(), width: 65, color: sentClr },
          { text: `${String(l.title || "")}${ownTag}`, width: cW - 95 },
        ]);
      }
      doc.moveDown(0.3);
    }

    // 6.2 SERP Control
    const sb2 = r("serpBreakdown");
    if (sb2) {
      sub("6.2", "SERP Control");
      lv("First Page Dominance", s(sb2.firstPageDominance));
      const owned = (sb2.ownedProperties || []) as string[];
      const risky = (sb2.riskyResults || []) as string[];
      if (owned.length) {
        doc.moveDown(0.2);
        doc.fontSize(7.5).fillColor(C.grn).text("Owned Properties:", ML, doc.y, { width: cW });
        for (const u of owned) bullet(u, C.grn);
      }
      if (risky.length) {
        doc.moveDown(0.2);
        doc.fontSize(7.5).fillColor(C.red).text("Risky Results:", ML, doc.y, { width: cW });
        for (const u of risky) bullet(u, C.red);
      }
      doc.moveDown(0.3);
    }

    // 6.3 Volatility
    const svol = r("serpVolatility");
    if (svol && svol.level) {
      sub("6.3", "SERP Volatility");
      lv("Level", String(svol.level).toUpperCase());
      lv("Trend", s(svol.trend));
      doc.moveDown(0.2);
      body(String(svol.analysis || ""));
      const corr = (svol.corrections || []) as string[];
      if (corr.length) {
        doc.moveDown(0.2);
        for (const c of corr) bullet(c);
      }
    }

    // 6.4 People Also Ask
    const paa = (report.peopleAlsoAsk || []) as string[];
    if (paa.length > 0) {
      sub("6.4", "People Also Ask");
      for (const q of paa) {
        need(12);
        doc.fontSize(7.5).fillColor(C.on).text(`Q:  ${q}`, ML + 8, doc.y, { width: cW - 12 });
      }
    }


    // ════════════════════════════════════════════════════════════════
    // 7. PLATFORM & BRAND PRESENCE
    // ════════════════════════════════════════════════════════════════
    sec("7", "Platform & Brand Presence");

    // 7.1 Domain
    const di = r("domainInfo");
    if (di) {
      sub("7.1", "Domain");
      lv("Domain", s(di.domain));
      lv("Active Website", di.hasSite ? "Yes" : "No");
      doc.moveDown(0.3);
    }

    // 7.2 Social Media
    const sp = r("socialPresenceDetail");
    if (sp) {
      sub("7.2", "Social Media Presence");
      body(String(sp.assessment || ""));
      const found = (sp.found || []) as string[];
      const miss = (sp.missing || []) as string[];
      if (found.length) { doc.moveDown(0.2); lv("Found", found.join(", ")); }
      if (miss.length) { lv("Missing", miss.join(", ")); }
      doc.moveDown(0.3);
    }

    // 7.3 Knowledge Panel
    const kg = r("knowledgeGraph");
    sub("7.3", "Google Knowledge Panel");
    if (kg) {
      lv("Title", s(kg.title));
      if (kg.type) lv("Type", String(kg.type));
      if (kg.description) { doc.moveDown(0.15); body(String(kg.description)); }
    } else {
      doc.fontSize(8).fillColor(C.org).text("No Knowledge Panel detected — a key trust signal is missing.", ML, doc.y, { width: cW });
    }


    // ════════════════════════════════════════════════════════════════
    // 8. REVIEWS & TRUST SIGNALS
    // ════════════════════════════════════════════════════════════════
    sec("8", "Reviews & Trust Signals");

    // 8.1 Review platforms
    const rs = r("reviewSummary");
    if (rs) {
      sub("8.1", "Review Platforms");
      body(String(rs.assessment || ""));
      const pl = (rs.platforms_found || []) as string[];
      if (pl.length) { doc.moveDown(0.2); lv("Platforms", pl.join(", ")); }
      doc.moveDown(0.3);
    }

    // 8.2 Reviews Dashboard
    const rd = r("reviewDashboard");
    if (rd) {
      sub("8.2", "Reviews Dashboard");
      lv("Aggregated Rating", `${((rd.aggregatedRating as number) || 0).toFixed?.(1) || "N/A"}/5.0`);
      lv("Total Reviews", String(rd.totalReviews || 0));
      doc.moveDown(0.2);
      body(String(rd.trendAnalysis || ""));
      const plats = (rd.platforms || []) as Record<string, unknown>[];
      if (plats.length > 0) {
        doc.moveDown(0.2);
        tableHeader([
          { text: "Platform", width: 120 },
          { text: "Rating", width: 60 },
          { text: "Reviews", width: 60 },
          { text: "Sentiment", width: cW - 240 },
        ]);
        for (const p of plats) {
          need(14);
          tableRow([
            { text: s(p.name), width: 120 },
            { text: `${(p.rating as number)?.toFixed?.(1) || "N/A"}/5`, width: 60, color: (p.rating as number) >= 4 ? C.grn : (p.rating as number) >= 3 ? C.ylw : C.red },
            { text: String(p.reviewCount || 0), width: 60 },
            { text: s(p.sentiment), width: cW - 240 },
          ]);
        }
      }
      doc.moveDown(0.3);

      // Recent reviews
      const recentReviews = (rd.recentReviews || []) as Record<string, unknown>[];
      if (recentReviews.length > 0) {
        doc.fontSize(8.5).fillColor(C.pri).text("Recent Reviews", ML, doc.y, { width: cW });
        doc.moveDown(0.15);
        for (const rv of recentReviews.slice(0, 8)) {
          need(22);
          const rvSent = String(rv.sentiment || "neutral");
          const rvClr = rvSent === "positive" ? C.grn : rvSent === "negative" ? C.red : C.out;
          doc.fontSize(7.5).fillColor(rvClr).text(`[${rvSent.toUpperCase()}]`, ML + 8, doc.y, { continued: true });
          doc.fillColor(C.on).text(`  ${s(rv.text || rv.title, "")}`);
          if (rv.url) link(String(rv.url), String(rv.url));
        }
        doc.moveDown(0.3);
      }

      // Crisis detection from reviews
      const reviewCrisis = rd.crisisDetection as Record<string, unknown> | undefined;
      if (reviewCrisis && reviewCrisis.detected) {
        doc.fontSize(8).fillColor(C.red).text(`Review Crisis Alert: ${s(reviewCrisis.summary)}`, ML, doc.y, { width: cW });
        doc.moveDown(0.2);
      }
    }

    // 8.3 Review Risks
    const rdRisks = (rd?.risks || []) as Record<string, unknown>[];
    if (rdRisks.length > 0) {
      sub("8.3", "Review Risks");
      for (const rk of rdRisks) {
        need(20);
        doc.fontSize(7.5).fillColor(C.red).text(`[${s(rk.platform)}] ${s(rk.review)}`, ML, doc.y, { width: cW });
        doc.fontSize(7).fillColor(C.onV).text(String(rk.risk || ""), ML + 8, doc.y, { width: cW - 12 });
        doc.moveDown(0.15);
      }
    }


    // ════════════════════════════════════════════════════════════════
    // 9. SEARCH EXPERIENCE
    // ════════════════════════════════════════════════════════════════
    sec("9", "Search Experience");

    // 9.1 Autocomplete
    const ac = r("autocompleteSentiment");
    if (ac) {
      sub("9.1", "Google Autocomplete Analysis");
      body(String(ac.analysis || ""));
      const neg = (ac.negative_terms || []) as string[];
      if (neg.length) { doc.moveDown(0.2); lv("Concerning Terms", neg.join(", ")); }
      doc.moveDown(0.3);
    }

    // 9.2 Google Images
    const gi = r("googleImagesAnalysis");
    if (gi) {
      sub("9.2", "Google Images Analysis");
      lv("Ranking", s(gi.ranking));
      lv("Owned Images", `~${gi.ownedImagesPct || 0}%`);
      doc.moveDown(0.2);
      body(String(gi.analysis || ""));

      // Sentiment breakdown for images
      const imgSentiment = gi.sentimentBreakdown as Record<string, number> | undefined;
      if (imgSentiment) {
        doc.moveDown(0.2);
        doc.fontSize(8).fillColor(C.pri).text("Image Sentiment Breakdown:", ML, doc.y, { width: cW });
        doc.moveDown(0.1);
        const imgPos = imgSentiment.positive || 0;
        const imgNeu = imgSentiment.neutral || 0;
        const imgNeg = imgSentiment.negative || 0;
        doc.fontSize(7.5).fillColor(C.grn).text(`Positive: ${imgPos}%`, ML + 8, doc.y, { continued: true });
        doc.fillColor(C.out).text(`    Neutral: ${imgNeu}%`, { continued: true });
        doc.fillColor(C.red).text(`    Negative: ${imgNeg}%`);
      }

      const conc = (gi.concerns || []) as string[];
      if (conc.length > 0) {
        doc.moveDown(0.2);
        for (const c of conc) bullet(c, C.red);
      }
    }


    // ════════════════════════════════════════════════════════════════
    // 10. CONTENT & MEDIA ANALYSIS
    // ════════════════════════════════════════════════════════════════
    sec("10", "Content & Media Analysis");

    // 10.1 News sentiment
    const newsSent = r("newsSentiment") || r("newsAnalysis");
    if (newsSent) {
      sub("10.1", "News Sentiment");
      body(String(newsSent.analysis || newsSent.summary || ""));
      doc.moveDown(0.3);
    }

    // 10.2 Media Brand Sentiment
    const mb = r("mediaBrandSentiment");
    if (mb) {
      const outlets = (mb.outlets || []) as Record<string, unknown>[];
      if (outlets.length > 0) {
        sub("10.2", "Media Brand Sentiment");
        tableHeader([
          { text: "Outlet", width: 140 },
          { text: "Tier", width: 70 },
          { text: "Score", width: 50 },
          { text: "Article", width: cW - 260 },
        ]);
        for (const o of outlets) {
          need(14);
          const tClr = o.tier === "premium" ? C.grn : o.tier === "mid-tier" ? C.sec : C.out;
          const sS = (o.sentimentScore as number) || 0;
          const articleTitle = s(o.articleTitle, "");
          tableRow([
            { text: s(o.name), width: 140 },
            { text: s(o.tier), width: 70, color: tClr },
            { text: `${sS}/10`, width: 50, color: sS >= 7 ? C.grn : sS >= 5 ? C.ylw : C.red },
            { text: articleTitle || "—", width: cW - 260 },
          ]);
          if (o.articleUrl) link(String(o.articleUrl), String(o.articleUrl));
        }
        doc.moveDown(0.2);
        lv("Average Score", `${mb.averageScore || 0}/10`);
        doc.moveDown(0.2);
        body(String(mb.analysis || ""));
      }
    }


    // ════════════════════════════════════════════════════════════════
    // 11. AI & LLM PERCEPTION
    // ════════════════════════════════════════════════════════════════
    const ai = r("aiLlmAppearance");
    if (ai) {
      sec("11", "AI & LLM Perception");

      sub("11.1", "AI Visibility Score");
      lv("Score", `${ai.score || 0}/10`);
      lv("Verdict", s(ai.verdict));
      doc.moveDown(0.2);
      body(String(ai.analysis || ""));

      const aiS = (ai.strengths || []) as string[];
      const aiW = (ai.weaknesses || []) as string[];
      if (aiS.length || aiW.length) {
        sub("11.2", "AI Strengths & Weaknesses");
        if (aiS.length) {
          doc.fontSize(8).fillColor(C.grn).text("Strengths:", ML, doc.y, { width: cW });
          for (const item of aiS) bullet(item, C.grn);
          doc.moveDown(0.2);
        }
        if (aiW.length) {
          doc.fontSize(8).fillColor(C.red).text("Weaknesses:", ML, doc.y, { width: cW });
          for (const item of aiW) bullet(item, C.red);
          doc.moveDown(0.2);
        }
      }

      const aiR = (ai.recommendations || []) as string[];
      if (aiR.length) {
        sub("11.3", "AI Strategy Recommendations");
        for (const item of aiR) bullet(item, C.sec);
      }
    }


    // ════════════════════════════════════════════════════════════════
    // 12. CONVERSATION & COMMUNITY
    // ════════════════════════════════════════════════════════════════
    sec("12", "Conversation & Community");

    // 12.1 Overall
    const cvs = r("conversationSentiment");
    if (cvs) {
      sub("12.1", "Overall Conversation Sentiment");
      lv("Score", `${cvs.score || 0}/10`);
      lv("Verdict", s(cvs.verdict));
      doc.moveDown(0.2);
      body(String(cvs.analysis || ""));
      const tnt = (cvs.topNegativeTopics || []) as Record<string, unknown>[];
      if (tnt.length > 0) {
        doc.moveDown(0.2);
        doc.fontSize(8).fillColor(C.red).text("Top Negative Topics:", ML, doc.y, { width: cW });
        for (const t of tnt) {
          need(14);
          doc.fontSize(7.5).fillColor(C.red).text(`${s(t.topic)} (${s(t.source)}, impact: ${s(t.impact)})`, ML + 8, doc.y, { width: cW - 12 });
        }
      }
      doc.moveDown(0.3);
    }

    // 12.2 Reddit & Quora
    const fs = r("forumSentiment");
    if (fs) {
      const convs = (fs.conversations || []) as Record<string, unknown>[];
      if (convs.length > 0) {
        sub("12.2", "Reddit & Quora Discussions");
        lv("Overall Sentiment", s(fs.overallSentiment));
        doc.moveDown(0.2);
        body(String(fs.analysis || ""));
        doc.moveDown(0.2);
        for (const c of convs) {
          need(16);
          const sentClr = c.sentiment === "positive" ? C.grn : c.sentiment === "negative" ? C.red : C.out;
          doc.fontSize(7.5).fillColor(C.sec).text(`[${String(c.platform || "").toUpperCase()}]`, ML + 4, doc.y, { continued: true });
          doc.fillColor(sentClr).text(` ${s(c.sentiment)}`, { continued: true });
          doc.fillColor(C.on).text(`  ${s(c.title)}`);
          doc.fontSize(7).fillColor(C.onV).text(String(c.summary || ""), ML + 12, doc.y, { width: cW - 16 });
          if (c.url) link(String(c.url), String(c.url));
          doc.moveDown(0.15);
        }
      }
    }

    // 12.3 YouTube / Video
    const vs = r("videoSentimentAnalysis");
    if (vs && vs.hasVideos) {
      sub("12.3", "YouTube & Video Analysis");
      lv("Overall Sentiment", s(vs.overallSentiment));
      doc.moveDown(0.2);
      body(String(vs.analysis || ""));
      doc.moveDown(0.2);
      const vids = (vs.videos || []) as Record<string, unknown>[];
      for (const v of vids.slice(0, 8)) {
        need(18);
        const sentClr = v.sentiment === "positive" ? C.grn : v.sentiment === "negative" ? C.red : C.out;
        doc.fontSize(7.5).fillColor(sentClr).text(`[${String(v.sentiment || "").toUpperCase()}]`, ML + 4, doc.y, { continued: true });
        doc.fillColor(C.on).text(`  ${s(v.title)}`);
        doc.fontSize(7).fillColor(C.out).text(`by ${s(v.channel)}  |  ${(v.views as number || 0).toLocaleString()} views${v.isOwned ? "  |  OWNED" : ""}`, ML + 12, doc.y, { width: cW - 16 });
        if (v.url) link(String(v.url), String(v.url));
        doc.moveDown(0.15);
      }
      const vidConcerns = (vs.concerns || []) as string[];
      for (const c of vidConcerns) bullet(c, C.red);
    }


    // ════════════════════════════════════════════════════════════════
    // 13. INFLUENCER & AUTHORITY
    // ════════════════════════════════════════════════════════════════
    sec("13", "Influencer & Authority");

    // 13.1 Influencer Mentions
    const inf = r("influencerMentions");
    if (inf) {
      const mentions = (inf.mentions || []) as Record<string, unknown>[];
      sub("13.1", "Influencer & Third-Party Mentions");
      body(String(inf.analysis || ""));
      doc.moveDown(0.2);
      for (const m of mentions) {
        need(22);
        const sentClr = m.sentiment === "positive" ? C.grn : m.sentiment === "negative" ? C.red : C.out;
        doc.fontSize(8).fillColor(C.on).text(s(m.influencerName), ML + 4, doc.y, { continued: true });
        doc.fillColor(C.sec).text(`  [${s(m.platform)}]`, { continued: true });
        doc.fillColor(sentClr).text(`  ${s(m.sentiment)}`);
        doc.fontSize(7).fillColor(C.onV).text(String(m.summary || ""), ML + 12, doc.y, { width: cW - 16 });
        doc.moveDown(0.15);
      }
    }

    // 13.2 Personal Influence
    const pi = r("personalInfluence");
    if (pi) {
      sub("13.2", "Personal Influence");
      lv("Score", `${pi.score || 0}/10`);
      lv("Verdict", s(pi.verdict));
      doc.moveDown(0.2);
      body(String(pi.analysis || ""));
      doc.moveDown(0.2);
      for (const k of ["authorProfiles", "guestPosts", "podcasts", "publicSpeaking", "wikipediaPresence", "interviews", "mediaFeatures", "linkedinActivity", "forumMentions"]) {
        const item = pi[k] as { found: boolean; details: string } | undefined;
        if (item) {
          need(12);
          const label = k.replace(/([A-Z])/g, " $1").trim();
          doc.fontSize(7.5).fillColor(item.found ? C.grn : C.out).text(`${item.found ? "+" : "-"}  ${label}`, ML + 8, doc.y, { width: cW - 12 });
        }
      }
    }


    // ════════════════════════════════════════════════════════════════
    // 14. AUTHORITY SIGNALS
    // ════════════════════════════════════════════════════════════════
    const bp = r("backlinkProfile");
    if (bp) {
      sec("14", "Authority Signals");
      sub("14.1", "Backlink Profile");
      lv("Health Score", `${bp.healthScore || 0}/10`);
      lv("Estimated Backlinks", s(bp.totalBacklinks, "Unknown"));
      if (bp.toxicLinksDetected) lv("Toxic Links", `${bp.toxicLinksCount || 0} detected — ${s(bp.toxicLinksStatus)}`);
      if (bp.isVulnerable && !bp.toxicLinksDetected) {
        doc.fontSize(7.5).fillColor(C.org).text(`Note: ${s(bp.vulnerabilityNote)}`, ML, doc.y, { width: cW });
      }
      doc.moveDown(0.2);
      body(String(bp.analysis || ""));
      const bpR = (bp.recommendations || []) as string[];
      for (const item of bpR) bullet(item);
    }


    // ════════════════════════════════════════════════════════════════
    // 15. RISK & CRISIS MONITORING
    // ════════════════════════════════════════════════════════════════
    sec("15", "Risk & Crisis Monitoring");

    // 15.1 Crisis detection
    const cd = r("crisisDetection");
    if (cd) {
      sub("15.1", "Crisis Detection");
      lv("Alert Level", String(cd.alertLevel || "none").toUpperCase());
      doc.moveDown(0.2);
      body(String(cd.summary || ""));
      const alerts = (cd.alerts || []) as Record<string, unknown>[];
      for (const a of alerts) {
        need(18);
        doc.fontSize(7.5).fillColor(C.red).text(`[${s(a.priority).toUpperCase()}] ${s(a.title)}`, ML, doc.y, { width: cW });
        doc.fontSize(6.5).fillColor(C.out).text(`Source: ${s(a.source)}  |  Impact: ${s(a.impact)}`, ML + 8, doc.y, { width: cW - 12 });
        doc.moveDown(0.15);
      }
      const threats = (cd.threats || []) as Record<string, unknown>[];
      if (threats.length) {
        doc.moveDown(0.2);
        for (const t of threats) {
          need(18);
          doc.fontSize(7.5).fillColor(C.on).text(`${s(t.threat)} — Likelihood: ${s(t.likelihood)}, Impact: ${s(t.impact)}`, ML + 4, doc.y, { width: cW - 8 });
          doc.fontSize(7).fillColor(C.sec).text(`Mitigation: ${s(t.mitigation)}`, ML + 12, doc.y, { width: cW - 16 });
          doc.moveDown(0.15);
        }
      }
    }

    // 15.2 Suspicious Activity
    const sa = r("suspiciousActivityAnalysis");
    if (sa) {
      sub("15.2", "Suspicious Activity");
      lv("Score", `${sa.score || 0}/10`);
      lv("Risk Level", s(sa.riskLevel));
      doc.moveDown(0.2);
      body(String(sa.analysis || ""));
      const pats = (sa.patterns || []) as Record<string, unknown>[];
      for (const p of pats) {
        need(22);
        doc.fontSize(7.5).fillColor(C.red).text(`[${s(p.severity).toUpperCase()}] ${String(p.type || "").replace(/_/g, " ")}`, ML, doc.y, { width: cW });
        doc.fontSize(7).fillColor(C.onV).text(String(p.description || ""), ML + 8, doc.y, { width: cW - 12 });
        doc.moveDown(0.15);
      }
      if (sa.recommendation) {
        doc.moveDown(0.15);
        doc.fontSize(8).fillColor(C.sec).text(`Recommendation: ${String(sa.recommendation)}`, ML, doc.y, { width: cW });
      }
    }

    // 15.3 Future Risk
    const fra = r("futureRiskAssessment");
    if (fra) {
      sub("15.3", "Future Risk Assessment");
      lv("Overall Risk", s(fra.overallRisk));
      lv("Risk Score", `${fra.riskScore || 0}/10`);
      doc.moveDown(0.2);
      body(String(fra.analysis || ""));
      const fRisks = (fra.risks || []) as Record<string, unknown>[];
      for (const rk of fRisks) {
        need(18);
        doc.fontSize(7.5).fillColor(C.on).text(s(rk.risk), ML + 4, doc.y, { width: cW - 8 });
        doc.fontSize(6.5).fillColor(C.out).text(`Likelihood: ${s(rk.likelihood)}  |  Impact: ${s(rk.impact)}  |  Mitigation: ${s(rk.mitigation)}`, ML + 12, doc.y, { width: cW - 16 });
        doc.moveDown(0.15);
      }
    }


    // ════════════════════════════════════════════════════════════════
    // 16. STRENGTHS & WEAKNESSES
    // ════════════════════════════════════════════════════════════════
    sec("16", "Strengths & Weaknesses");

    // 16.1 Strengths
    const strengths = ra("strengths");
    if (strengths.length > 0) {
      sub("16.1", `Strengths (${strengths.length})`);
      for (const item of strengths) {
        need(16);
        doc.rect(ML, doc.y, 2, 18).fill(C.grn);
        doc.fontSize(8).fillColor(C.on).text(String(item.title || ""), ML + 8, doc.y, { width: cW - 12 });
        doc.fontSize(7).fillColor(C.onV).text(String(item.description || ""), ML + 8, doc.y, { width: cW - 12 });
        doc.moveDown(0.3);
      }
    }

    // 16.2 Problems
    const allProblems = ra("problems");
    if (allProblems.length > 0) {
      sub("16.2", `Problems Found (${allProblems.length})`);
      for (const p of allProblems) {
        need(20);
        const sv2 = p.severity === "high" ? C.red : p.severity === "medium" ? C.ylw : C.sec;
        doc.rect(ML, doc.y, 2, 22).fill(sv2);
        doc.fontSize(7.5).fillColor(sv2).text(String(p.severity || "").toUpperCase(), ML + 8, doc.y, { continued: true });
        doc.fillColor(C.on).text(`  ${String(p.title || "")}`);
        doc.fontSize(7).fillColor(C.onV).text(String(p.description || ""), ML + 8, doc.y, { width: cW - 12 });
        doc.moveDown(0.35);
      }
    }


    // ════════════════════════════════════════════════════════════════
    // 17. STRATEGIC RECOMMENDATIONS
    // ════════════════════════════════════════════════════════════════
    const recs = ra("recommendations");
    if (recs.length > 0) {
      sec("17", "Strategic Recommendations");

      const highRecs2 = recs.filter(rc => rc.priority === "high");
      const medRecs = recs.filter(rc => rc.priority === "medium");
      const otherRecs = recs.filter(rc => rc.priority !== "high" && rc.priority !== "medium");

      // 17.1 High Priority
      if (highRecs2.length > 0) {
        sub("17.1", "High Priority");
        for (const rc of highRecs2) {
          need(24);
          doc.rect(ML, doc.y, 2, 24).fill(C.red);
          doc.fontSize(8).fillColor(C.on).text(String(rc.action || ""), ML + 8, doc.y, { width: cW - 12 });
          doc.fontSize(7).fillColor(C.onV).text(String(rc.reason || ""), ML + 8, doc.y, { width: cW - 12 });
          doc.fontSize(7).fillColor(C.grn).text(`Impact: ${s(rc.estimatedImpact)}`, ML + 8, doc.y, { width: cW - 12 });
          if (rc.revenueImpact) doc.fontSize(7).fillColor("#059669").text(`Revenue: ${String(rc.revenueImpact)}`, ML + 8, doc.y, { width: cW - 12 });
          doc.moveDown(0.35);
        }
      }

      // 17.2 Medium Priority
      if (medRecs.length > 0) {
        sub("17.2", "Medium Priority");
        for (const rc of medRecs) {
          need(22);
          doc.rect(ML, doc.y, 2, 26).fill(C.ylw);
          doc.fontSize(8).fillColor(C.on).text(String(rc.action || ""), ML + 8, doc.y, { width: cW - 12 });
          doc.fontSize(7).fillColor(C.onV).text(String(rc.reason || ""), ML + 8, doc.y, { width: cW - 12 });
          doc.fontSize(7).fillColor(C.grn).text(`Impact: ${s(rc.estimatedImpact)}`, ML + 8, doc.y, { width: cW - 12 });
          doc.moveDown(0.35);
        }
      }

      // Other / low priority
      if (otherRecs.length > 0) {
        for (const rc of otherRecs) {
          need(20);
          doc.rect(ML, doc.y, 2, 22).fill(C.sec);
          doc.fontSize(8).fillColor(C.on).text(String(rc.action || ""), ML + 8, doc.y, { width: cW - 12 });
          doc.fontSize(7).fillColor(C.onV).text(String(rc.reason || ""), ML + 8, doc.y, { width: cW - 12 });
          doc.moveDown(0.3);
        }
      }

      // 17.3 AI Strategy
      const aiRecs = ai ? ((ai.recommendations || []) as string[]) : [];
      if (aiRecs.length > 0) {
        sub("17.3", "AI & LLM Strategy");
        for (const item of aiRecs) bullet(item, C.sec);
      }
    }


    // ════════════════════════════════════════════════════════════════
    // 18. MARKET & COMPETITIVE CONTEXT
    // ════════════════════════════════════════════════════════════════
    sec("18", "Market & Competitive Context");

    // 18.1 Industry Benchmark
    const ib = r("industryBenchmark");
    if (ib?.applicable) {
      sub("18.1", `Industry Benchmark: ${s(ib.industry)}`);
      tableHeader([
        { text: "Metric", width: cW * 0.5 },
        { text: "Score", width: cW * 0.5 },
      ]);
      tableRow([
        { text: "Market Leaders", width: cW * 0.5 },
        { text: `${ib.marketLeaderScore || 0}/100`, width: cW * 0.5, color: C.grn },
      ]);
      tableRow([
        { text: "Industry Average", width: cW * 0.5 },
        { text: `${ib.industryAverage || 0}/100`, width: cW * 0.5, color: C.ylw },
      ]);
      tableRow([
        { text: name, width: cW * 0.5 },
        { text: `${score}/100`, width: cW * 0.5, color: sClr },
      ]);
      if ((ib.gap as number) > 0) lv("Gap to Leader", `${ib.gap} points`);
      doc.moveDown(0.2);
      body(String(ib.analysis || ""));
      const ibR = (ib.recommendations || []) as string[];
      for (const item of ibR) bullet(item);
    }

    // 18.2 Geographic Presence
    const gp = r("geographicPresence");
    if (gp) {
      sub("18.2", "Geographic Reputation Reach");
      lv("Scope", s(gp.scope));
      lv("Primary Market", s(gp.primaryMarket));
      doc.moveDown(0.2);
      body(String(gp.analysis || ""));
      const mkts = (gp.markets || []) as Record<string, unknown>[];
      if (mkts.length > 0) {
        doc.moveDown(0.2);
        tableHeader([
          { text: "Country", width: 160 },
          { text: "Strength", width: 120 },
          { text: "Score", width: cW - 280 },
        ]);
        for (const m of mkts.slice(0, 7)) {
          need(14);
          const mScore = m.score as number | undefined;
          tableRow([
            { text: s(m.country), width: 160 },
            { text: s(m.strength), width: 120 },
            { text: mScore != null ? `${mScore}/100` : "—", width: cW - 280, color: mScore != null ? scoreClr(mScore) : C.out },
          ]);
        }
      }
    }


    // ════════════════════════════════════════════════════════════════
    // 19. APPENDIX
    // ════════════════════════════════════════════════════════════════
    sec("19", "Appendix");

    // 19.1 Full search results
    const results = ra("results");
    if (results.length > 0) {
      sub("19.1", `Full Search Results (${results.length})`);
      for (const item of results) {
        need(20);
        const sentClr = item.sentiment === "positive" ? C.grn : item.sentiment === "negative" ? C.red : C.out;
        doc.fontSize(6.5).fillColor(C.out).text(`#${item.position || ""}`, ML, doc.y, { continued: true });
        doc.fillColor(sentClr).text(` [${String(item.sentiment || "").toUpperCase()}]`, { continued: true });
        doc.fillColor(C.on).text(`  ${String(item.title || "")}`);
        if (item.link) doc.fontSize(6).fillColor(C.sec).text(String(item.link), ML + 8, doc.y, { width: cW - 12, link: String(item.link) });
        doc.moveDown(0.1);
      }
      doc.moveDown(0.3);
    }

    // 19.2 Data sources
    sub("19.2", "Data Sources & Methodology");
    doc.fontSize(7.5).fillColor(C.onV).text(
      "This report aggregates data from Google Search, Google News, Google Images, Google Autocomplete, " +
      "review platforms, social media profiles, Reddit, Quora, YouTube, domain records, AI/LLM engines, " +
      "backlink analysis, and proprietary sentiment models. All data was collected at the time of report generation.",
      ML, doc.y, { width: cW, lineGap: 2 }
    );
    doc.moveDown(0.4);

    // 19.3 Reddit/Quora Links
    const forumConvs = fs ? ((fs.conversations || []) as Record<string, unknown>[]) : [];
    const forumWithLinks = forumConvs.filter(c => c.url);
    if (forumWithLinks.length > 0) {
      sub("19.3", "Reddit & Quora Links");
      for (const c of forumWithLinks) {
        need(16);
        doc.fontSize(7).fillColor(C.sec).text(`[${String(c.platform || "").toUpperCase()}] ${s(c.title)}`, ML + 4, doc.y, { width: cW - 8 });
        link(String(c.url), String(c.url));
      }
      doc.moveDown(0.3);
    }

    // 19.4 YouTube Links
    const ytVids = vs ? ((vs.videos || []) as Record<string, unknown>[]) : [];
    const ytWithLinks = ytVids.filter(v => v.url);
    if (ytWithLinks.length > 0) {
      sub("19.4", "YouTube Video Links");
      for (const v of ytWithLinks) {
        need(16);
        doc.fontSize(7).fillColor(C.on).text(s(v.title), ML + 4, doc.y, { width: cW - 8 });
        link(String(v.url), String(v.url));
      }
      doc.moveDown(0.3);
    }

    // 19.5 Media Links
    const mediaOutlets = mb ? ((mb.outlets || []) as Record<string, unknown>[]) : [];
    const mediaWithLinks = mediaOutlets.filter(o => o.articleUrl);
    if (mediaWithLinks.length > 0) {
      sub("19.5", "Media Article Links");
      for (const o of mediaWithLinks) {
        need(16);
        doc.fontSize(7).fillColor(C.on).text(`${s(o.name)} — ${s(o.articleTitle, s(o.name))}`, ML + 4, doc.y, { width: cW - 8 });
        link(String(o.articleUrl), String(o.articleUrl));
      }
    }


    // ════════════════════════════════════════════════════════════════
    // BLANK PAGE CLEANUP
    // ════════════════════════════════════════════════════════════════
    const totalPages = doc.bufferedPageRange();
    if (totalPages.count > 1) {
      doc.switchToPage(totalPages.count - 1);
      if (doc.y < usableTop + 30) {
        doc.fontSize(7).fillColor(C.out).text("— End of Report —", ML, H / 2, { align: "center", width: cW });
      }
    }


    // ════════════════════════════════════════════════════════════════
    // RUNNING HEADERS & FOOTERS
    // ════════════════════════════════════════════════════════════════
    const finalPages = doc.bufferedPageRange();
    for (let i = 0; i < finalPages.count; i++) {
      doc.switchToPage(i);

      // Header (skip cover page = page 0)
      if (i > 0) {
        doc.fontSize(5.5).fillColor(C.out).text(
          "CONFIDENTIAL  —  REPUTATION INTELLIGENCE REPORT",
          ML, 22,
          { width: cW * 0.75, characterSpacing: 1 }
        );
        doc.fontSize(5.5).fillColor(C.out).text(
          name,
          ML + cW * 0.75, 22,
          { width: cW * 0.25, align: "right" }
        );
        doc.moveTo(ML, 34).lineTo(ML + cW, 34).strokeColor(C.outV).lineWidth(0.3).stroke();
      }

      // Footer
      doc.moveTo(ML, H - footerZone + 4).lineTo(ML + cW, H - footerZone + 4).strokeColor(C.outV).lineWidth(0.3).stroke();
      doc.fontSize(5.5).fillColor(C.out).text(
        "Confidential — Online Reputation Intelligence Report",
        ML, H - footerZone + 10,
        { width: cW * 0.65 }
      );
      doc.fontSize(5.5).fillColor(C.out).text(
        `Page ${i + 1} of ${finalPages.count}  |  ${reportDate}`,
        ML + cW * 0.65, H - footerZone + 10,
        { width: cW * 0.35, align: "right" }
      );
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

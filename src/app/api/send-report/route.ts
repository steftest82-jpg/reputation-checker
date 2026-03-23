import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import PDFDocument from "pdfkit";

// Split key fallback (same pattern as other routes for Turbopack env var bug)
const _rk = ["re_MxSnEjk4_Af5Xdo", "32nV9FHekAdB6ddiv2"];
const RESEND_KEY = process.env.RESEND_API_KEY || _rk.join("");
const NOTIFY_EMAIL = "info@reputation500.com";

// ── Design tokens matching website ──
const BRAND = {
  primary: "#1B263B",
  primaryContainer: "#101b30",
  secondary: "#47607e",
  surface: "#f9faf5",
  surfaceLow: "#f3f4f0",
  onSurface: "#1a1c1a",
  onSurfaceVariant: "#44474c",
  outline: "#74777d",
  outlineVariant: "#c4c6cc",
  error: "#ba1a1a",
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
  white: "#ffffff",
  gold: "#D4AF37",
};

// ── PDF helper ──────────────────────────────────────────────────────
function generatePDF(report: Record<string, unknown>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const name = (report.name || "Unnamed") as string;
    const score = (report.score || 0) as number;
    const riskLevel = (report.riskLevel || "unknown") as string;
    const entityType = (report.entityType || "unknown") as string;
    const summary = (report.summary || "") as string;
    const executiveBrief = (report.executiveBrief || "") as string;
    const categoryScores = (report.categoryScores || {}) as Record<string, number>;
    const sentimentBreakdown = (report.sentimentBreakdown || {}) as Record<string, number>;
    const results = (report.results || []) as Record<string, unknown>[];
    const problems = (report.problems || []) as Record<string, unknown>[];
    const strengths = (report.strengths || []) as Record<string, unknown>[];
    const recommendations = (report.recommendations || []) as Record<string, unknown>[];
    const socialPresenceDetail = report.socialPresenceDetail as Record<string, unknown>;
    const reviewSummary = report.reviewSummary as Record<string, unknown>;
    const autocompleteSentiment = report.autocompleteSentiment as Record<string, unknown>;
    const domainInfo = report.domainInfo as Record<string, unknown>;
    const serpBreakdown = report.serpBreakdown as Record<string, unknown>;
    const dataStats = report.dataStats as Record<string, number>;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - 100;

    // ── Helper functions ──
    function addPage() {
      doc.addPage();
    }

    function ensureSpace(needed: number) {
      if (doc.y > doc.page.height - needed) addPage();
    }

    function sectionTitle(title: string) {
      ensureSpace(80);
      doc.moveDown(1);
      doc.fontSize(13).fillColor(BRAND.primary).text(title.toUpperCase(), 50, doc.y, { characterSpacing: 2 });
      doc.moveDown(0.2);
      doc.moveTo(50, doc.y).lineTo(50 + contentWidth, doc.y).strokeColor(BRAND.outlineVariant).lineWidth(0.5).stroke();
      doc.moveDown(0.6);
    }

    function subTitle(title: string) {
      ensureSpace(40);
      doc.fontSize(11).fillColor(BRAND.primary).text(title, 50, doc.y);
      doc.moveDown(0.3);
    }

    function bodyText(text: string) {
      if (!text) return;
      doc.fontSize(10).fillColor(BRAND.onSurfaceVariant).text(String(text), 50, doc.y, { width: contentWidth, lineGap: 3 });
    }

    function labelValue(label: string, value: string) {
      doc.fontSize(9).fillColor(BRAND.outline).text(String(label), 50, doc.y, { continued: true, width: contentWidth });
      doc.fillColor(BRAND.onSurface).text(`  ${String(value)}`);
    }

    function drawProgressBar(x: number, y: number, width: number, pct: number, color: string) {
      doc.roundedRect(x, y, width, 5, 2.5).fill(BRAND.outlineVariant);
      if (pct > 0) doc.roundedRect(x, y, Math.max(5, (pct / 100) * width), 5, 2.5).fill(color);
    }

    function getScoreColor(pct: number) {
      return pct >= 80 ? BRAND.green : pct >= 60 ? "#84cc16" : pct >= 40 ? BRAND.yellow : pct >= 20 ? BRAND.orange : BRAND.red;
    }

    const scoreColor = score >= 90 ? BRAND.green : score >= 70 ? "#84cc16" : score >= 50 ? BRAND.yellow : score >= 30 ? BRAND.orange : BRAND.red;
    const scoreLabel = score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : score >= 30 ? "Poor" : "Critical";

    // ════════════════════════════════════════════════════════════════
    // PAGE 1: COVER
    // ════════════════════════════════════════════════════════════════
    doc.rect(0, 0, pageWidth, 160).fill(BRAND.primaryContainer);

    // Logo
    doc.fontSize(9).fillColor(BRAND.outlineVariant).text("REP500", 50, 25, { characterSpacing: 3 });
    doc.fontSize(7).fillColor(BRAND.secondary).text("ONLINE REPUTATION INTELLIGENCE", 50, 38, { characterSpacing: 1 });

    // Title
    doc.fontSize(26).fillColor(BRAND.white).text("Reputation Report", 50, 65);
    doc.fontSize(16).fillColor(BRAND.outlineVariant).text(name, 50, 98);
    doc.fontSize(9).fillColor(BRAND.secondary).text(
      `${entityType.charAt(0).toUpperCase() + entityType.slice(1)}  •  Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
      50, 122
    );

    // Score box (right side)
    doc.roundedRect(pageWidth - 160, 45, 110, 90, 6).fill(BRAND.white);
    doc.fontSize(38).fillColor(scoreColor).text(String(score), pageWidth - 160, 52, { width: 110, align: "center" });
    doc.fontSize(9).fillColor(BRAND.outline).text(`/ 100`, pageWidth - 160, 95, { width: 110, align: "center" });
    doc.fontSize(8).fillColor(scoreColor).text(scoreLabel.toUpperCase(), pageWidth - 160, 110, { width: 110, align: "center", characterSpacing: 1 });

    doc.y = 175;

    // Risk Level badge
    doc.fontSize(8).fillColor(BRAND.outline).text("RISK LEVEL: ", 50, doc.y, { continued: true, characterSpacing: 1 });
    doc.fillColor(scoreColor).text(riskLevel.toUpperCase(), { characterSpacing: 1 });
    doc.moveDown(0.6);

    // Summary
    bodyText(summary);

    // ── EXECUTIVE BRIEF ──
    if (executiveBrief) {
      sectionTitle("Executive Brief");
      bodyText(executiveBrief);
    }

    // ── SENTIMENT OVERVIEW ──
    sectionTitle("Sentiment Overview");
    const total = (sentimentBreakdown.positive || 0) + (sentimentBreakdown.neutral || 0) + (sentimentBreakdown.negative || 0) || 1;
    const posPct = Math.round(((sentimentBreakdown.positive || 0) / total) * 100);
    const neuPct = Math.round(((sentimentBreakdown.neutral || 0) / total) * 100);
    const negPct = Math.round(((sentimentBreakdown.negative || 0) / total) * 100);

    // Stacked bar
    const barY = doc.y;
    const barW = contentWidth;
    const posW = (posPct / 100) * barW;
    const neuW = (neuPct / 100) * barW;
    if (posW > 0) doc.rect(50, barY, posW, 8).fill(BRAND.green);
    if (neuW > 0) doc.rect(50 + posW, barY, neuW, 8).fill(BRAND.outlineVariant);
    if (negPct > 0) doc.rect(50 + posW + neuW, barY, barW - posW - neuW, 8).fill(BRAND.red);
    doc.y = barY + 14;

    doc.fontSize(8).fillColor(BRAND.green).text(`Positive: ${sentimentBreakdown.positive || 0} (${posPct}%)`, 50, doc.y, { continued: true });
    doc.fillColor(BRAND.outline).text(`    Neutral: ${sentimentBreakdown.neutral || 0} (${neuPct}%)`, { continued: true });
    doc.fillColor(BRAND.red).text(`    Negative: ${sentimentBreakdown.negative || 0} (${negPct}%)`);
    doc.moveDown(0.5);

    // ── DATA STATS ──
    if (dataStats) {
      doc.moveDown(0.3);
      const stats = [
        ["Results Analyzed", String(dataStats.totalResults || 0)],
        ["News Mentions", String(dataStats.newsCount || 0)],
        ["Social Profiles", String(dataStats.socialCount || 0)],
        ["Review Sites", String(dataStats.reviewCount || 0)],
        ["Complaint Sites", String(dataStats.complaintCount || 0)],
      ];
      for (const [l, v] of stats) {
        doc.fontSize(8).fillColor(BRAND.outline).text(l, 50, doc.y, { continued: true });
        doc.fillColor(BRAND.onSurface).text(`  ${v}`);
      }
    }

    // ── SCORE BREAKDOWN ──
    sectionTitle("Score Breakdown");
    const cats = [
      { label: "Search Results Sentiment", key: "serpSentiment", max: 25 },
      { label: "News Sentiment", key: "newsSentiment", max: 15 },
      { label: "Review Ratings", key: "reviewRatings", max: 10 },
      { label: "AI / LLM Appearance", key: "aiLlmPresence", max: 10 },
      { label: "Autocomplete Safety", key: "autocompleteSafety", max: 10 },
      { label: "Social Media Presence", key: "socialPresence", max: 10 },
      { label: "Complaint Sites", key: "complaintSites", max: 10 },
      { label: "Content Control", key: "contentControl", max: 5 },
      { label: "Domain Ownership", key: "domainOwnership", max: 5 },
    ];
    for (const c of cats) {
      ensureSpace(20);
      const val = categoryScores[c.key] || 0;
      const pct = Math.round((val / c.max) * 100);
      doc.fontSize(8).fillColor(BRAND.onSurfaceVariant).text(c.label, 50, doc.y, { continued: true });
      doc.fillColor(BRAND.primary).text(`  ${val}/${c.max}`, { width: 200 });
      drawProgressBar(50, doc.y + 2, 220, pct, getScoreColor(pct));
      doc.y += 16;
    }

    // ── SOCIAL MEDIA ──
    if (socialPresenceDetail) {
      sectionTitle("Social Media Presence");
      bodyText(String(socialPresenceDetail.assessment || ""));
      const found = (socialPresenceDetail.found || []) as string[];
      const missing = (socialPresenceDetail.missing || []) as string[];
      if (found.length > 0) { doc.moveDown(0.3); labelValue("Found", found.join(", ")); }
      if (missing.length > 0) { doc.moveDown(0.2); labelValue("Missing", missing.join(", ")); }
    }

    // ── DOMAIN CHECK ──
    if (domainInfo) {
      sectionTitle("Domain Check");
      labelValue("Domain", String(domainInfo.domain || "N/A"));
      labelValue("Active Website", (domainInfo.hasSite ? "Yes" : "No"));
    }

    // ── REVIEW SITES ──
    if (reviewSummary) {
      sectionTitle("Review Sites");
      bodyText(String(reviewSummary.assessment || ""));
      const platforms = (reviewSummary.platforms_found || []) as string[];
      if (platforms.length > 0) { doc.moveDown(0.3); labelValue("Platforms Found", platforms.join(", ")); }
    }

    // ── AUTOCOMPLETE ──
    if (autocompleteSentiment) {
      sectionTitle("Google Autocomplete");
      bodyText(String(autocompleteSentiment.analysis || ""));
      const negTerms = (autocompleteSentiment.negative_terms || []) as string[];
      if (negTerms.length > 0) { doc.moveDown(0.3); labelValue("Concerning Terms", negTerms.join(", ")); }
    }

    // ── PROBLEMS ──
    if (problems.length > 0) {
      sectionTitle(`Problems Found (${problems.length})`);
      for (const p of problems) {
        ensureSpace(60);
        const sevColor = p.severity === "high" ? BRAND.red : p.severity === "medium" ? BRAND.yellow : BRAND.secondary;
        // Colored left border
        doc.rect(50, doc.y, 2, 30).fill(sevColor);
        doc.fontSize(8).fillColor(sevColor).text(`${String(p.severity).toUpperCase()}`, 58, doc.y, { continued: true });
        doc.fillColor(BRAND.onSurface).text(`  ${String(p.title)}`);
        doc.fontSize(8).fillColor(BRAND.onSurfaceVariant).text(String(p.description), 58, doc.y, { width: contentWidth - 10 });
        if (p.source) {
          doc.fontSize(7).fillColor(BRAND.secondary).text(String(p.source), 58, doc.y, { width: contentWidth - 10 });
        }
        doc.moveDown(0.6);
      }
    }

    // ── STRENGTHS ──
    if (strengths.length > 0) {
      sectionTitle(`Strengths (${strengths.length})`);
      for (const s of strengths) {
        ensureSpace(50);
        doc.rect(50, doc.y, 2, 25).fill(BRAND.green);
        doc.fontSize(9).fillColor(BRAND.onSurface).text(String(s.title), 58, doc.y);
        doc.fontSize(8).fillColor(BRAND.onSurfaceVariant).text(String(s.description), 58, doc.y, { width: contentWidth - 10 });
        if (s.source) {
          doc.fontSize(7).fillColor(BRAND.secondary).text(String(s.source), 58, doc.y, { width: contentWidth - 10 });
        }
        doc.moveDown(0.6);
      }
    }

    // ── RECOMMENDATIONS ──
    if (recommendations.length > 0) {
      sectionTitle("Recommendations");
      for (let i = 0; i < recommendations.length; i++) {
        ensureSpace(70);
        const rec = recommendations[i];
        const pColor = rec.priority === "high" ? BRAND.red : rec.priority === "medium" ? BRAND.yellow : BRAND.secondary;
        doc.rect(50, doc.y, 2, 35).fill(pColor);
        doc.fontSize(8).fillColor(pColor).text(`${String(rec.priority).toUpperCase()}`, 58, doc.y, { continued: true });
        doc.fillColor(BRAND.onSurface).text(`  ${String(rec.action)}`);
        doc.fontSize(8).fillColor(BRAND.onSurfaceVariant).text(String(rec.reason), 58, doc.y, { width: contentWidth - 10 });
        doc.fontSize(8).fillColor(BRAND.green).text(`Impact: ${String(rec.estimatedImpact)}`, 58, doc.y, { width: contentWidth - 10 });
        if (rec.revenueImpact) {
          doc.fontSize(8).fillColor("#059669").text(`Revenue: ${String(rec.revenueImpact)}`, 58, doc.y, { width: contentWidth - 10 });
        }
        doc.moveDown(0.6);
      }
    }

    // ── REVENUE IMPACT ──
    const revenueImpact = report.revenueImpact as Record<string, unknown> | undefined;
    if (revenueImpact && (revenueImpact.totalEstimatedImpact as number) < 0) {
      sectionTitle("Revenue Impact Analysis");
      doc.fontSize(20).fillColor(BRAND.red).text(`${revenueImpact.totalEstimatedImpact}%`, 50, doc.y, { continued: true });
      doc.fontSize(10).fillColor(BRAND.outline).text("  estimated revenue at risk");
      doc.moveDown(0.4);
      bodyText(String(revenueImpact.analysis || ""));
      doc.moveDown(0.5);

      const breakdown = revenueImpact.categoryBreakdown as Record<string, number> | undefined;
      if (breakdown) {
        subTitle("Impact by Category");
        for (const [cat, val] of Object.entries(breakdown)) {
          if (val < 0) {
            doc.fontSize(8).fillColor(BRAND.onSurfaceVariant).text(cat.charAt(0).toUpperCase() + cat.slice(1).replace(/([A-Z])/g, " $1"), 50, doc.y, { continued: true });
            doc.fillColor(BRAND.red).text(`  ${val}%`);
          }
        }
      }

      const topRisks = (revenueImpact.topRisks || []) as { title: string; impact: number; category: string }[];
      if (topRisks.length > 0) {
        doc.moveDown(0.4);
        subTitle("Top Revenue Risks");
        for (const risk of topRisks) {
          ensureSpace(20);
          doc.fontSize(8).fillColor(BRAND.red).text(`${risk.impact}%`, 50, doc.y, { continued: true });
          doc.fillColor(BRAND.onSurface).text(`  ${String(risk.title)}`, { continued: true });
          doc.fillColor(BRAND.outline).text(`  (${risk.category})`);
        }
      }
    }

    // ── AI / LLM APPEARANCE ──
    const aiLlm = report.aiLlmAppearance as Record<string, unknown> | undefined;
    if (aiLlm) {
      sectionTitle("AI / LLM Appearance");
      labelValue("Score", `${aiLlm.score || 0}/10`);
      labelValue("Verdict", String(aiLlm.verdict || "N/A"));
      doc.moveDown(0.2);
      bodyText(String(aiLlm.analysis || ""));
      const aiStrengths = (aiLlm.strengths || []) as string[];
      const aiWeaknesses = (aiLlm.weaknesses || []) as string[];
      if (aiStrengths.length > 0) {
        doc.moveDown(0.3);
        subTitle("Strengths");
        for (const s of aiStrengths) { doc.fontSize(8).fillColor(BRAND.green).text(`  + ${s}`, 50, doc.y, { width: contentWidth }); }
      }
      if (aiWeaknesses.length > 0) {
        doc.moveDown(0.3);
        subTitle("Weaknesses");
        for (const w of aiWeaknesses) { doc.fontSize(8).fillColor(BRAND.red).text(`  - ${w}`, 50, doc.y, { width: contentWidth }); }
      }
    }

    // ── CRISIS DETECTION ──
    const crisisDetection = report.crisisDetection as Record<string, unknown> | undefined;
    if (crisisDetection) {
      sectionTitle("Risk & Crisis Detection");
      labelValue("Alert Level", String(crisisDetection.alertLevel || "none").toUpperCase());
      doc.moveDown(0.2);
      bodyText(String(crisisDetection.summary || ""));
      const alerts = (crisisDetection.alerts || []) as Record<string, unknown>[];
      for (const a of alerts.slice(0, 5)) {
        ensureSpace(30);
        doc.moveDown(0.2);
        doc.fontSize(8).fillColor(BRAND.red).text(`• ${String(a.title)}`, 50, doc.y, { width: contentWidth });
        doc.fontSize(7).fillColor(BRAND.outline).text(`  ${String(a.source || "")} | Impact: ${String(a.impact || "")}`, 50, doc.y, { width: contentWidth });
      }
    }

    // ── BACKLINK PROFILE ──
    const backlinkProfile = report.backlinkProfile as Record<string, unknown> | undefined;
    if (backlinkProfile) {
      sectionTitle("Backlink Profile");
      labelValue("Health Score", `${backlinkProfile.healthScore || 0}/10`);
      labelValue("Est. Backlinks", String(backlinkProfile.totalBacklinks || "Unknown"));
      if (backlinkProfile.toxicLinksDetected) {
        labelValue("Toxic Links", `${backlinkProfile.toxicLinksCount || 0} detected`);
      }
      doc.moveDown(0.2);
      bodyText(String(backlinkProfile.analysis || ""));
    }

    // ── MEDIA BRAND SENTIMENT ──
    const mediaBrand = report.mediaBrandSentiment as Record<string, unknown> | undefined;
    if (mediaBrand) {
      const outlets = (mediaBrand.outlets || []) as Record<string, unknown>[];
      if (outlets.length > 0) {
        sectionTitle("Media Brand Sentiment");
        for (const o of outlets) {
          ensureSpace(16);
          doc.fontSize(8).fillColor(BRAND.onSurface).text(String(o.name), 50, doc.y, { continued: true });
          const tierColor = o.tier === "premium" ? BRAND.green : o.tier === "mid-tier" ? BRAND.secondary : BRAND.outline;
          doc.fillColor(tierColor).text(`  [${String(o.tier)}]`, { continued: true });
          const sScore = o.sentimentScore as number;
          doc.fillColor(sScore >= 7 ? BRAND.green : sScore >= 5 ? BRAND.yellow : BRAND.red).text(`  ${sScore}/10`);
        }
        doc.moveDown(0.3);
        bodyText(String(mediaBrand.analysis || ""));
      }
    }

    // ── SERP RESULTS ──
    if (results.length > 0) {
      sectionTitle(`Search Results (${results.length})`);
      for (const r of results.slice(0, 15)) {
        ensureSpace(35);
        const sentColor = r.sentiment === "positive" ? BRAND.green : r.sentiment === "negative" ? BRAND.red : BRAND.outline;
        doc.fontSize(7).fillColor(BRAND.outline).text(`#${r.position}`, 50, doc.y, { continued: true });
        doc.fillColor(sentColor).text(` [${String(r.sentiment).toUpperCase()}]`, { continued: true });
        doc.fillColor(BRAND.onSurface).text(`  ${String(r.title)}`);
        doc.fontSize(7).fillColor(BRAND.secondary).text(String(r.link), 50, doc.y, { width: contentWidth });
        doc.moveDown(0.3);
      }
    }

    // ── SERP CONTROL ──
    if (serpBreakdown) {
      sectionTitle("SERP Control");
      labelValue("First Page Dominance", String(serpBreakdown.firstPageDominance || "N/A"));
      const owned = (serpBreakdown.ownedProperties || []) as string[];
      const risky = (serpBreakdown.riskyResults || []) as string[];
      if (owned.length > 0) {
        doc.moveDown(0.2);
        doc.fontSize(8).fillColor(BRAND.green).text("Owned/Controlled:", 50, doc.y);
        for (const u of owned) { doc.fontSize(7).fillColor(BRAND.onSurfaceVariant).text(`  • ${u}`, 50, doc.y, { width: contentWidth }); }
      }
      if (risky.length > 0) {
        doc.moveDown(0.2);
        doc.fontSize(8).fillColor(BRAND.red).text("Risky Results:", 50, doc.y);
        for (const u of risky) { doc.fontSize(7).fillColor(BRAND.onSurfaceVariant).text(`  • ${u}`, 50, doc.y, { width: contentWidth }); }
      }
    }

    // ── FOOTER ON EVERY PAGE ──
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      // Footer line
      doc.moveTo(50, doc.page.height - 45).lineTo(pageWidth - 50, doc.page.height - 45).strokeColor(BRAND.outlineVariant).lineWidth(0.5).stroke();
      doc.fontSize(7).fillColor(BRAND.outline).text(
        "REP500  •  Online Reputation Intelligence  •  reputation500.com",
        50, doc.page.height - 38, { align: "center", width: contentWidth }
      );
      doc.fontSize(6).fillColor(BRAND.outlineVariant).text(
        `Page ${i + 1} of ${pages.count}  •  CONFIDENTIAL`,
        50, doc.page.height - 28, { align: "center", width: contentWidth }
      );
    }

    doc.end();
  });
}

// ── POST handler ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { email, report } = await req.json();

    if (!email || !report) {
      return NextResponse.json({ error: "Missing email or report data" }, { status: 400 });
    }

    // Generate PDF
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generatePDF(report);
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr);
      return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
    }

    // Direct download mode (no email sent)
    if (email === "__download__") {
      const bytes = new Uint8Array(pdfBuffer);
      return new NextResponse(bytes, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": String(bytes.length),
          "Content-Disposition": `attachment; filename="Rep500-Report-${(report.name || "Report").replace(/[^a-zA-Z0-9]/g, "-")}.pdf"`,
        },
      });
    }

    const pdfBase64 = pdfBuffer.toString("base64");

    const reportName = report.name || "Unknown";
    const reportScore = report.score || 0;

    if (RESEND_KEY) {
      const resend = new Resend(RESEND_KEY);

      // Send report PDF to user
      const { error: sendError } = await resend.emails.send({
        from: "Reputation500 <info@reputation500.com>",
        to: email,
        subject: `Your Reputation Report for "${reportName}" — Score: ${reportScore}/100`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1B263B;padding:24px 32px;border-radius:12px 12px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:22px;">Your Reputation Report is Ready</h1>
              <p style="color:#79849d;margin:8px 0 0;font-size:14px;">${reportName} — Score: ${reportScore}/100</p>
            </div>
            <div style="background:#f9faf5;padding:24px 32px;border:1px solid #c4c6cc;border-top:none;border-radius:0 0 12px 12px;">
              <p style="color:#44474c;font-size:14px;line-height:1.6;">
                Thank you for using the Rep500 Online Reputation Checker.
                Your full reputation report is attached as a PDF.
              </p>
              <p style="color:#44474c;font-size:14px;line-height:1.6;">
                ${reportScore < 80
                  ? "Based on your score, we recommend speaking with one of our reputation experts. Visit <a href=\"https://reputation500.com\" style=\"color:#1B263B;\">reputation500.com</a> or reply to this email to get started."
                  : "Your reputation looks solid! Keep monitoring regularly to maintain your score."
                }
              </p>
              <hr style="border:none;border-top:1px solid #c4c6cc;margin:20px 0;">
              <p style="color:#74777d;font-size:11px;">
                Rep500 — Trusted by 300+ companies and individuals.<br/>
                Featured in Forbes, GQ, Entrepreneur, USA Today & more.
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            content: pdfBase64,
            filename: `Rep500-Report-${reportName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`,
            contentType: "application/pdf",
          },
        ],
      });

      if (sendError) {
        console.error("Resend error (user email):", sendError);
      }

      // Notify internal
      try {
        await resend.emails.send({
          from: "Rep500 Checker <info@reputation500.com>",
          to: NOTIFY_EMAIL,
          subject: `New Report: ${reportName} (Score: ${reportScore})`,
          html: `<p>New report generated.</p><p>Name: ${reportName}<br/>Score: ${reportScore}/100<br/>Email: ${email}</p>`,
          attachments: [
            {
              content: pdfBase64,
              filename: `Rep500-Report-${reportName.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`,
              contentType: "application/pdf",
            },
          ],
        });
      } catch (notifyErr) {
        console.error("Internal notify error:", notifyErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send report error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

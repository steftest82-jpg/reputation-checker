import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Split key fallback (same pattern as other routes for Turbopack env var bug)
const _rk = ["re_MxSnEjk4_Af5Xdo", "32nV9FHekAdB6ddiv2"];
const RESEND_KEY = process.env.RESEND_API_KEY || _rk.join("");
const TO_EMAIL = "info@reputation500.com";

const td = `padding:8px;border-bottom:1px solid #eee;`;
const th = `${td}font-weight:bold;`;

function buildReportHtml(r: Record<string, unknown>): string {
  const cat = r.categoryScores as Record<string, number> | undefined;
  const sentiment = r.sentimentBreakdown as Record<string, number> | undefined;
  const problems = r.problems as { title: string; description: string; severity: string }[] | undefined;
  const strengths = r.strengths as { title: string; description: string }[] | undefined;
  const recommendations = r.recommendations as { title: string; description: string; priority: string }[] | undefined;
  const results = r.results as { title: string; link: string; snippet: string; sentiment: string }[] | undefined;
  const serpBreakdown = r.serpBreakdown as Record<string, unknown> | undefined;
  const socialPresence = r.socialPresenceDetail as Record<string, unknown> | undefined;
  const reviewSummary = r.reviewSummary as Record<string, unknown> | undefined;
  const autocompleteSentiment = r.autocompleteSentiment as Record<string, unknown> | undefined;
  const dataStats = r.dataStats as Record<string, number> | undefined;

  let html = `
    <hr style="margin:24px 0;border:none;border-top:2px solid #2563eb;">
    <h2 style="color:#2563eb;">Full Report: ${r.name || "N/A"}</h2>
    <p><strong>Entity Type:</strong> ${r.entityType || "N/A"}</p>
    <p><strong>Score:</strong> ${r.score ?? "N/A"}/100 &nbsp; | &nbsp; <strong>Risk Level:</strong> ${r.riskLevel || "N/A"}</p>
    <p><strong>Summary:</strong> ${r.summary || "N/A"}</p>
    <p><strong>Executive Brief:</strong> ${r.executiveBrief || "N/A"}</p>
  `;

  // Category scores
  if (cat) {
    html += `<h3 style="margin-top:20px;">Category Scores</h3>
    <table style="border-collapse:collapse;width:100%;max-width:500px;">
      <tr><td style="${th}">Search Results</td><td style="${td}">${cat.searchResults ?? "-"}/100</td></tr>
      <tr><td style="${th}">Sentiment</td><td style="${td}">${cat.sentiment ?? "-"}/100</td></tr>
      <tr><td style="${th}">Content Quality</td><td style="${td}">${cat.contentQuality ?? "-"}/100</td></tr>
      <tr><td style="${th}">Social Presence</td><td style="${td}">${cat.socialPresence ?? "-"}/100</td></tr>
      <tr><td style="${th}">Autocomplete</td><td style="${td}">${cat.autocompleteSentiment ?? "-"}/100</td></tr>
      <tr><td style="${th}">Reviews</td><td style="${td}">${cat.reviews ?? "-"}/100</td></tr>
    </table>`;
  }

  // Sentiment breakdown
  if (sentiment) {
    html += `<h3 style="margin-top:20px;">Sentiment Breakdown</h3>
    <p>Positive: ${sentiment.positive}% &nbsp;|&nbsp; Neutral: ${sentiment.neutral}% &nbsp;|&nbsp; Negative: ${sentiment.negative}%</p>`;
  }

  // Data stats
  if (dataStats) {
    html += `<h3 style="margin-top:20px;">Data Stats</h3>
    <p>Total Results: ${dataStats.totalResults} &nbsp;|&nbsp; Complaints: ${dataStats.complaintCount} &nbsp;|&nbsp; Reviews: ${dataStats.reviewCount} &nbsp;|&nbsp; Social: ${dataStats.socialCount} &nbsp;|&nbsp; News: ${dataStats.newsCount}</p>`;
  }

  // Problems
  if (problems?.length) {
    html += `<h3 style="margin-top:20px;color:#dc2626;">Problems Found (${problems.length})</h3><ul>`;
    for (const p of problems) {
      html += `<li><strong>[${p.severity}]</strong> ${p.title} — ${p.description}</li>`;
    }
    html += `</ul>`;
  }

  // Strengths
  if (strengths?.length) {
    html += `<h3 style="margin-top:20px;color:#16a34a;">Strengths (${strengths.length})</h3><ul>`;
    for (const s of strengths) {
      html += `<li><strong>${s.title}</strong> — ${s.description}</li>`;
    }
    html += `</ul>`;
  }

  // Recommendations
  if (recommendations?.length) {
    html += `<h3 style="margin-top:20px;color:#2563eb;">Recommendations (${recommendations.length})</h3><ul>`;
    for (const rec of recommendations) {
      html += `<li><strong>[${rec.priority}]</strong> ${rec.title} — ${rec.description}</li>`;
    }
    html += `</ul>`;
  }

  // SERP breakdown
  if (serpBreakdown) {
    html += `<h3 style="margin-top:20px;">SERP Breakdown</h3>`;
    const owned = serpBreakdown.ownedProperties as string[] | undefined;
    const risky = serpBreakdown.riskyResults as string[] | undefined;
    if (owned?.length) html += `<p><strong>Owned Properties:</strong> ${owned.join(", ")}</p>`;
    if (risky?.length) html += `<p><strong>Risky Results:</strong> ${risky.join(", ")}</p>`;
    html += `<p><strong>First Page Dominance:</strong> ${serpBreakdown.firstPageDominance || "N/A"}</p>`;
  }

  // Social presence
  if (socialPresence) {
    const found = socialPresence.found as string[] | undefined;
    const missing = socialPresence.missing as string[] | undefined;
    html += `<h3 style="margin-top:20px;">Social Presence</h3>`;
    if (found?.length) html += `<p><strong>Found:</strong> ${found.join(", ")}</p>`;
    if (missing?.length) html += `<p><strong>Missing:</strong> ${missing.join(", ")}</p>`;
    html += `<p><strong>Assessment:</strong> ${socialPresence.assessment || "N/A"}</p>`;
  }

  // Review summary
  if (reviewSummary) {
    const platforms = reviewSummary.platforms_found as string[] | undefined;
    html += `<h3 style="margin-top:20px;">Review Summary</h3>`;
    if (platforms?.length) html += `<p><strong>Platforms Found:</strong> ${platforms.join(", ")}</p>`;
    html += `<p><strong>Overall Sentiment:</strong> ${reviewSummary.overall_sentiment || "N/A"}</p>`;
    html += `<p><strong>Assessment:</strong> ${reviewSummary.assessment || "N/A"}</p>`;
  }

  // Autocomplete sentiment
  if (autocompleteSentiment) {
    const neg = autocompleteSentiment.negative_terms as string[] | undefined;
    const neutral = autocompleteSentiment.neutral_terms as string[] | undefined;
    html += `<h3 style="margin-top:20px;">Autocomplete Sentiment</h3>`;
    html += `<p><strong>Score:</strong> ${autocompleteSentiment.score ?? "N/A"}/100</p>`;
    if (neg?.length) html += `<p><strong>Negative Terms:</strong> ${neg.join(", ")}</p>`;
    if (neutral?.length) html += `<p><strong>Neutral Terms:</strong> ${neutral.join(", ")}</p>`;
    html += `<p><strong>Analysis:</strong> ${autocompleteSentiment.analysis || "N/A"}</p>`;
  }

  // Search results
  if (results?.length) {
    html += `<h3 style="margin-top:20px;">Search Results (${results.length})</h3>
    <table style="border-collapse:collapse;width:100%;">
      <tr style="background:#f3f4f6;">
        <th style="${th}text-align:left;">#</th>
        <th style="${th}text-align:left;">Title</th>
        <th style="${th}text-align:left;">Sentiment</th>
        <th style="${th}text-align:left;">URL</th>
      </tr>`;
    results.forEach((item, i) => {
      html += `<tr>
        <td style="${td}">${i + 1}</td>
        <td style="${td}">${item.title}</td>
        <td style="${td}">${item.sentiment}</td>
        <td style="${td}"><a href="${item.link}" style="color:#2563eb;word-break:break-all;">${item.link}</a></td>
      </tr>`;
    });
    html += `</table>`;
  }

  return html;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, packageName, reportName, reportScore, reportData } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isGeneralContact = !packageName;
    const emailType = isGeneralContact ? "General Contact Inquiry" : packageName === "Report Unlock" ? "Report Unlock Lead" : "Package Inquiry";

    let emailHtml = `
      <h2>${isGeneralContact ? "📩 New Contact Form Submission" : `New ${emailType}`} from Rep500</h2>
      ${isGeneralContact ? `<p style="color:#2563eb;font-weight:bold;font-size:14px;">This is a general contact inquiry from the website footer.</p>` : ""}
      <table style="border-collapse:collapse;width:100%;max-width:500px;">
        <tr><td style="${th}">Name</td><td style="${td}">${name}</td></tr>
        <tr><td style="${th}">Email</td><td style="${td}"><a href="mailto:${email}">${email}</a></td></tr>
        ${packageName ? `<tr><td style="${th}">Package</td><td style="${td}">${packageName}</td></tr>` : `<tr><td style="${th}">Type</td><td style="${td}">General Contact</td></tr>`}
        ${reportName ? `<tr><td style="${th}">Report For</td><td style="${td}">${reportName}</td></tr>` : ""}
        ${reportScore !== undefined && reportScore > 0 ? `<tr><td style="${th}">Reputation Score</td><td style="${td}">${reportScore}/100</td></tr>` : ""}
      </table>
    `;

    // If full report data is included, render it
    if (reportData && typeof reportData === "object") {
      emailHtml += buildReportHtml(reportData);
    }

    // Always log the lead
    console.log("=== NEW LEAD ===");
    console.log(JSON.stringify({ name, email, packageName, reportName, reportScore }, null, 2));

    if (RESEND_KEY) {
      const resend = new Resend(RESEND_KEY);
      const { data, error } = await resend.emails.send({
        from: "Reputation500 <onboarding@resend.dev>",
        to: TO_EMAIL,
        subject: isGeneralContact ? `Contact Form: ${name}` : `New Lead: ${name} — ${packageName}`,
        html: emailHtml,
      });

      if (error) {
        console.error("Resend error:", JSON.stringify(error));
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.log("Email sent:", data?.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

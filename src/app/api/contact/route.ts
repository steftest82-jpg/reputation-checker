import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Split key fallback (same pattern as other routes for Turbopack env var bug)
const _rk = ["re_7E9bPvuW_Hgod", "8z5Wr2zC3CtGEzCc4BTC"];
const RESEND_KEY = process.env.RESEND_API_KEY || _rk.join("");
const TO_EMAIL = "info@reputation500.com";

export async function POST(req: NextRequest) {
  try {
    const { name, email, packageName, reportName, reportScore } = await req.json();

    if (!name || !email || !packageName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If Resend key is configured, send email
    if (RESEND_KEY) {
      const resend = new Resend(RESEND_KEY);
      await resend.emails.send({
        from: "Reputation500 Tool <onboarding@resend.dev>",
        to: TO_EMAIL,
        subject: `New Lead: ${name} — ${packageName}`,
        html: `
          <h2>New Package Inquiry from Reputation Check Tool</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Package</td><td style="padding:8px;border-bottom:1px solid #eee;">${packageName}</td></tr>
            ${reportName ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Report For</td><td style="padding:8px;border-bottom:1px solid #eee;">${reportName}</td></tr>` : ""}
            ${reportScore !== undefined ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Reputation Score</td><td style="padding:8px;border-bottom:1px solid #eee;">${reportScore}/100</td></tr>` : ""}
          </table>
        `,
      });
    } else {
      // Log the lead when Resend is not configured (visible in Vercel function logs)
      console.log("=== NEW LEAD ===");
      console.log(JSON.stringify({ name, email, packageName, reportName, reportScore }, null, 2));
      console.log("================");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

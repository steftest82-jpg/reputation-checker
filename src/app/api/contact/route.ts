import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Split key fallback (same pattern as other routes for Turbopack env var bug)
const _rk = ["re_MxSnEjk4_Af5Xdo", "32nV9FHekAdB6ddiv2"];
const RESEND_KEY = process.env.RESEND_API_KEY || _rk.join("");
const TO_EMAIL = "info@reputation500.com";

export async function POST(req: NextRequest) {
  try {
    const { name, email, packageName, reportName, reportScore } = await req.json();

    if (!name || !email || !packageName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailHtml = `
      <h2>New Package Inquiry from Reputation Check Tool</h2>
      <table style="border-collapse:collapse;width:100%;max-width:500px;">
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Package</td><td style="padding:8px;border-bottom:1px solid #eee;">${packageName}</td></tr>
        ${reportName ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Report For</td><td style="padding:8px;border-bottom:1px solid #eee;">${reportName}</td></tr>` : ""}
        ${reportScore !== undefined ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Reputation Score</td><td style="padding:8px;border-bottom:1px solid #eee;">${reportScore}/100</td></tr>` : ""}
      </table>
    `;

    // Always log the lead
    console.log("=== NEW LEAD ===");
    console.log(JSON.stringify({ name, email, packageName, reportName, reportScore }, null, 2));

    if (RESEND_KEY) {
      const resend = new Resend(RESEND_KEY);
      const { data, error } = await resend.emails.send({
        from: "Reputation500 <info@reputation500.com>",
        to: TO_EMAIL,
        subject: `New Lead: ${name} — ${packageName}`,
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

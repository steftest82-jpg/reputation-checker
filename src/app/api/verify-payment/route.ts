import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_KEY) console.error("FATAL: STRIPE_SECRET_KEY is not set");

// ── Rate limiter for verify-payment endpoint ─────────────────────
const verifyHits: Record<string, { count: number; firstHit: number }> = {};
const VERIFY_MAX = 20;
const VERIFY_WINDOW = 60 * 60 * 1000; // 1 hour

function isVerifyRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = verifyHits[ip];
  if (!entry || now - entry.firstHit > VERIFY_WINDOW) {
    verifyHits[ip] = { count: 1, firstHit: now };
    return false;
  }
  entry.count++;
  return entry.count > VERIFY_MAX;
}

export async function POST(req: NextRequest) {
  try {
    if (!STRIPE_KEY) {
      return NextResponse.json({ error: "Service configuration error" }, { status: 503 });
    }

    // ── Rate limit to prevent session ID brute-forcing ──
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    if (isVerifyRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { session_id } = await req.json();

    if (!session_id || typeof session_id !== "string") {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // ── Validate session_id format (Stripe IDs start with cs_) ──
    if (!/^cs_(test_|live_)[a-zA-Z0-9]+$/.test(session_id)) {
      return NextResponse.json({ error: "Invalid session ID format" }, { status: 400 });
    }

    const stripe = new Stripe(STRIPE_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    // ── Verify session is recent (max 24 hours) to prevent replay ──
    const sessionAge = Date.now() - (session.created * 1000);
    if (sessionAge > 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "Session expired" }, { status: 402 });
    }

    return NextResponse.json({
      paid: true,
      name: session.metadata?.scan_name || "",
      type: session.metadata?.scan_type || "person",
      domain: session.metadata?.scan_domain || "",
      customerEmail: session.customer_details?.email || "",
    });
  } catch (err: unknown) {
    // ── Don't leak Stripe internals to client ──
    console.error("Payment verification error:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

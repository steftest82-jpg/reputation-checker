import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_KEY) console.error("FATAL: STRIPE_SECRET_KEY is not set");

// ── Allowed origins for Stripe redirect — prevents open redirect ──
const ALLOWED_ORIGINS = [
  "https://www.rep500.com",
  "https://rep500.com",
  "https://reputation500.com",
  "https://www.reputation500.com",
];

// ── Rate limiter for checkout endpoint ────────────────────────────
const checkoutHits: Record<string, { count: number; firstHit: number }> = {};
const CHECKOUT_MAX = 10;
const CHECKOUT_WINDOW = 60 * 60 * 1000; // 1 hour

function isCheckoutRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = checkoutHits[ip];
  if (!entry || now - entry.firstHit > CHECKOUT_WINDOW) {
    checkoutHits[ip] = { count: 1, firstHit: now };
    return false;
  }
  entry.count++;
  return entry.count > CHECKOUT_MAX;
}

// ── HTML/special char sanitization for Stripe fields ─────────────
function sanitizeForStripe(str: string): string {
  return str.replace(/[<>"'&]/g, "").trim().slice(0, 200);
}

export async function POST(req: NextRequest) {
  try {
    if (!STRIPE_KEY) {
      return NextResponse.json({ error: "Service configuration error" }, { status: 503 });
    }

    // ── Rate limit ──
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    if (isCheckoutRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const stripe = new Stripe(STRIPE_KEY);
    const { name, type, domain } = await req.json();

    if (!name || !type || typeof name !== "string" || typeof type !== "string") {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    // ── Validate and lock origin to allowed list ──
    const reqOrigin = req.headers.get("origin") || "";
    const origin = ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : ALLOWED_ORIGINS[0];

    // ── Sanitize user input before sending to Stripe ──
    const safeName = sanitizeForStripe(name);
    const safeType = type === "company" ? "company" : "person";
    const safeDomain = domain ? sanitizeForStripe(String(domain)) : "";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Reputation Analysis",
              description: `Full reputation scan for ${safeName}`,
            },
            unit_amount: 3499, // $34.99
            tax_behavior: "exclusive",
          },
          quantity: 1,
        },
      ],
      metadata: {
        scan_name: safeName,
        scan_type: safeType,
        scan_domain: safeDomain,
      },
      success_url: `${origin}?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    // ── Don't leak Stripe internals to client ──
    console.error("Stripe checkout error:", err instanceof Error ? err.message : "Unknown error");
    return NextResponse.json({ error: "Checkout creation failed. Please try again." }, { status: 500 });
  }
}

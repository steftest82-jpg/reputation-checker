import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    return NextResponse.json({
      paid: true,
      name: session.metadata?.scan_name || "",
      type: session.metadata?.scan_type || "person",
      domain: session.metadata?.scan_domain || "",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    console.error("Payment verification error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

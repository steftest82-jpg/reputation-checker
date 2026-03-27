import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { name, type, domain } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "https://reputation500.com";

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
              description: `Full reputation scan for "${name}"`,
            },
            unit_amount: 3499, // $34.99
            tax_behavior: "exclusive",
          },
          quantity: 1,
        },
      ],
      metadata: {
        scan_name: name,
        scan_type: type,
        scan_domain: domain || "",
      },
      success_url: `${origin}?paid=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout creation failed";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

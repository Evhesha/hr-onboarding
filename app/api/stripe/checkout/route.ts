import { NextResponse } from "next/server";

const STRIPE_API_URL = "https://api.stripe.com/v1/checkout/sessions";

type CheckoutPayload = {
  fullName?: string;
  email?: string;
  notes?: string;
};

function formEncode(entries: Array<[string, string]>) {
  const body = new URLSearchParams();
  for (const [key, value] of entries) {
    body.append(key, value);
  }
  return body;
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY не настроен." }, { status: 500 });
  }

  try {
    const payload = (await request.json()) as CheckoutPayload;
    const origin = new URL(request.url).origin;
    const successUrl = `${origin}/premium?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/premium?status=cancel`;
    const priceId = process.env.STRIPE_PRICE_ID;

    const entries: Array<[string, string]> = [
      ["mode", "subscription"],
      ["success_url", successUrl],
      ["cancel_url", cancelUrl],
      ["customer_email", payload.email?.trim() || ""],
      ["metadata[fullName]", payload.fullName?.trim() || ""],
      ["metadata[email]", payload.email?.trim() || ""],
      ["metadata[notes]", payload.notes?.trim() || ""],
      ["metadata[source]", "premium-page"],
      ["line_items[0][quantity]", "1"],
    ];

    if (priceId) {
      entries.push(["line_items[0][price]", priceId]);
    } else {
      entries.push(
        ["line_items[0][price_data][currency]", process.env.STRIPE_PRICE_CURRENCY || "usd"],
        ["line_items[0][price_data][unit_amount]", process.env.STRIPE_PRICE_AMOUNT || "999"],
        ["line_items[0][price_data][product_data][name]", process.env.STRIPE_PRODUCT_NAME || "Premium Subscription"],
        ["line_items[0][price_data][recurring][interval]", process.env.STRIPE_PRICE_INTERVAL || "month"],
      );
    }

    const stripeResponse = await fetch(STRIPE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formEncode(entries),
      cache: "no-store",
    });

    const raw = await stripeResponse.text();
    const data = JSON.parse(raw) as { url?: string; error?: { message?: string } };

    if (!stripeResponse.ok || !data.url) {
      return NextResponse.json(
        { error: data.error?.message || "Stripe Checkout Session не создан." },
        { status: stripeResponse.status || 500 },
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.json({ error: `Stripe недоступен: ${message}` }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

const STRIPE_API_URL = "https://api.stripe.com/v1/checkout/sessions";

type CheckoutPayload = {
  fullName?: string;
  email?: string;
  notes?: string;
  purchaseType?: "premium" | "lesson" | "all";
  lessonSlug?: string;
  lessonTitle?: string;
  lessonSlugs?: string[];
  source?: string;
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
    const purchaseType = payload.purchaseType ?? "premium";
    const isLessonPurchase = purchaseType === "lesson";
    const isAllPurchase = purchaseType === "all";
    const priceId = isLessonPurchase
      ? process.env.STRIPE_LESSON_PRICE_ID
      : isAllPurchase
        ? process.env.STRIPE_ALL_PRICE_ID
        : process.env.STRIPE_PRICE_ID;
    const successUrl = isLessonPurchase
      ? `${origin}/learning?purchase=success&session_id={CHECKOUT_SESSION_ID}`
      : isAllPurchase
        ? `${origin}/learning?purchase=success&session_id={CHECKOUT_SESSION_ID}`
        : `${origin}/premium?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = isLessonPurchase
      ? `${origin}/learning?purchase=cancel`
      : isAllPurchase
        ? `${origin}/learning?purchase=cancel`
        : `${origin}/premium?status=cancel`;

    if (isLessonPurchase && !payload.lessonSlug) {
      return NextResponse.json({ error: "lessonSlug обязателен для покупки урока." }, { status: 400 });
    }
    if (isAllPurchase && (!payload.lessonSlugs || payload.lessonSlugs.length === 0)) {
      return NextResponse.json({ error: "lessonSlugs обязателен для покупки всех блоков." }, { status: 400 });
    }

    const entries: Array<[string, string]> = [
      ["mode", isLessonPurchase || isAllPurchase ? "payment" : "subscription"],
      ["success_url", successUrl],
      ["cancel_url", cancelUrl],
      ["customer_email", payload.email?.trim() || ""],
      ["metadata[fullName]", payload.fullName?.trim() || ""],
      ["metadata[email]", payload.email?.trim() || ""],
      ["metadata[notes]", payload.notes?.trim() || ""],
      [
        "metadata[source]",
        payload.source?.trim() || (isLessonPurchase ? "lesson-paywall" : isAllPurchase ? "learning-page" : "premium-page"),
      ],
      ["metadata[purchaseType]", purchaseType],
      ["line_items[0][quantity]", "1"],
    ];

    if (isLessonPurchase) {
      entries.push(["metadata[lessonSlug]", payload.lessonSlug ?? ""]);
      if (payload.lessonTitle) {
        entries.push(["metadata[lessonTitle]", payload.lessonTitle.trim()]);
      }
    }

    if (isAllPurchase) {
      entries.push(["metadata[lessonSlugs]", (payload.lessonSlugs || []).join(",")]);
    }

    if (priceId) {
      entries.push(["line_items[0][price]", priceId]);
    } else {
      if (isLessonPurchase) {
        entries.push(
          ["line_items[0][price_data][currency]", process.env.STRIPE_LESSON_PRICE_CURRENCY || "usd"],
          ["line_items[0][price_data][unit_amount]", process.env.STRIPE_LESSON_PRICE_AMOUNT || "1000"],
          [
            "line_items[0][price_data][product_data][name]",
            payload.lessonTitle?.trim() || `Lesson access: ${payload.lessonSlug}`,
          ],
        );
      } else if (isAllPurchase) {
        entries.push(
          ["line_items[0][price_data][currency]", process.env.STRIPE_ALL_PRICE_CURRENCY || "usd"],
          ["line_items[0][price_data][unit_amount]", process.env.STRIPE_ALL_PRICE_AMOUNT || "3000"],
          ["line_items[0][price_data][product_data][name]", "All premium blocks (lifetime access)"],
        );
      } else {
        entries.push(
          ["line_items[0][price_data][currency]", process.env.STRIPE_PRICE_CURRENCY || "usd"],
          ["line_items[0][price_data][unit_amount]", process.env.STRIPE_PRICE_AMOUNT || "999"],
          ["line_items[0][price_data][product_data][name]", process.env.STRIPE_PRODUCT_NAME || "Premium Subscription"],
          ["line_items[0][price_data][recurring][interval]", process.env.STRIPE_PRICE_INTERVAL || "month"],
        );
      }
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

import { NextResponse } from "next/server";
import { resolveBackendUrl } from "@/lib/backendUrl";

type StripeSessionResponse = {
  id?: string;
  status?: string;
  payment_status?: string;
  mode?: string;
  metadata?: Record<string, string>;
};

export async function POST(request: Request) {
  const backendUrl = resolveBackendUrl();
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY не настроен." }, { status: 500 });
  }

  try {
    const { sessionId } = (await request.json()) as { sessionId?: string };
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId обязателен." }, { status: 400 });
    }

    const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
    });

    const stripePayload = (await stripeResponse.json()) as StripeSessionResponse & {
      error?: { message?: string };
    };

    if (!stripeResponse.ok) {
      return NextResponse.json(
        { error: stripePayload.error?.message || "Не удалось проверить Checkout Session." },
        { status: stripeResponse.status || 500 },
      );
    }

    const isSuccessful =
      stripePayload.id === sessionId &&
      stripePayload.status === "complete" &&
      stripePayload.payment_status === "paid";

    if (!isSuccessful) {
      return NextResponse.json({ error: "Stripe Checkout ещё не завершён успешно." }, { status: 400 });
    }

    let backendResponse: Response;
    const purchaseType = stripePayload.metadata?.purchaseType || "premium";
    const lessonSlugFromMetadata =
      stripePayload.metadata?.lessonSlug || stripePayload.metadata?.lesson_slug || undefined;

    if (stripePayload.mode === "payment") {
      if (purchaseType === "all") {
        const lessonSlugsRaw = stripePayload.metadata?.lessonSlugs || "";
        const lessonSlugs = lessonSlugsRaw
          .split(",")
          .map((slug) => slug.trim())
          .filter(Boolean);

        if (lessonSlugs.length === 0) {
          return NextResponse.json({ error: "Не указан lessonSlugs для покупки всех блоков." }, { status: 400 });
        }

        backendResponse = await fetch(`${backendUrl}/billing/activate-lessons`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cookie: request.headers.get("cookie") ?? "",
          },
          body: JSON.stringify({ sessionId, lessonSlugs }),
          cache: "no-store",
        });
      } else {
        const lessonSlug = lessonSlugFromMetadata;
        if (!lessonSlug) {
          return NextResponse.json({ error: "Не указан lessonSlug для покупки урока." }, { status: 400 });
        }

        backendResponse = await fetch(`${backendUrl}/billing/activate-lesson`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cookie: request.headers.get("cookie") ?? "",
          },
          body: JSON.stringify({ sessionId, lessonSlug }),
          cache: "no-store",
        });
      }
    } else {
      backendResponse = await fetch(`${backendUrl}/billing/activate-premium`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: request.headers.get("cookie") ?? "",
        },
        body: JSON.stringify({ sessionId }),
        cache: "no-store",
      });
    }

    const contentType = backendResponse.headers.get("content-type") || "application/json";
    const setCookie = backendResponse.headers.get("set-cookie");
    const body = await backendResponse.text();

    let responseBody: string = body;
    if (contentType.includes("application/json")) {
      try {
        const parsed = JSON.parse(body) as Record<string, unknown>;
        const enriched = {
          ...parsed,
          purchaseType,
          lessonSlug: lessonSlugFromMetadata,
        };
        responseBody = JSON.stringify(enriched);
      } catch {
        responseBody = body;
      }
    }

    const headers = new Headers({ "Content-Type": contentType });
    if (setCookie) {
      headers.set("set-cookie", setCookie);
    }

    return new Response(responseBody, {
      status: backendResponse.status,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.json({ error: `Не удалось активировать доступ: ${message}` }, { status: 500 });
  }
}

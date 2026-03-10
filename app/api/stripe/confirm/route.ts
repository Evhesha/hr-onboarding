import { NextResponse } from "next/server";
import { resolveBackendUrl } from "@/lib/backendUrl";

type StripeSessionResponse = {
  id?: string;
  status?: string;
  payment_status?: string;
  mode?: string;
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
      stripePayload.mode === "subscription" &&
      stripePayload.status === "complete" &&
      stripePayload.payment_status === "paid";

    if (!isSuccessful) {
      return NextResponse.json({ error: "Stripe Checkout ещё не завершён успешно." }, { status: 400 });
    }

    const backendResponse = await fetch(`${backendUrl}/billing/activate-premium`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ sessionId }),
      cache: "no-store",
    });

    const contentType = backendResponse.headers.get("content-type") || "application/json";
    const setCookie = backendResponse.headers.get("set-cookie");
    const body = await backendResponse.text();

    const response = new Response(body, {
      status: backendResponse.status,
      headers: { "Content-Type": contentType },
    });

    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.json({ error: `Не удалось активировать Premium: ${message}` }, { status: 500 });
  }
}

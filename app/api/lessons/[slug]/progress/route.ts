import { NextResponse } from "next/server";
import { resolveBackendUrl } from "@/lib/backendUrl";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const backendUrl = resolveBackendUrl();

  try {
    const { slug } = await params;

    const backendResponse = await fetch(`${backendUrl}/lessons/${slug}`, {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    const contentType = backendResponse.headers.get("content-type") || "application/json";
    const body = await backendResponse.text();

    return new Response(body, {
      status: backendResponse.status,
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.json(
      { error: `Lessons backend недоступен (${backendUrl}): ${message}` },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const backendUrl = resolveBackendUrl();

  try {
    const { slug } = await params;
    const payload = await request.json();

    const backendResponse = await fetch(`${backendUrl}/lessons/${slug}/progress`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const contentType = backendResponse.headers.get("content-type") || "application/json";
    const body = await backendResponse.text();

    return new Response(body, {
      status: backendResponse.status,
      headers: { "Content-Type": contentType },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.json(
      { error: `Lessons backend недоступен (${backendUrl}): ${message}` },
      { status: 503 },
    );
  }
}

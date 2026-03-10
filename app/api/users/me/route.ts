import { NextResponse } from "next/server";
import { resolveBackendUrl } from "@/lib/backendUrl";

export async function GET(request: Request) {
  const backendUrl = resolveBackendUrl();

  try {
    const backendResponse = await fetch(`${backendUrl}/users/me`, {
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
      { error: `Auth backend недоступен (${backendUrl}): ${message}` },
      { status: 503 },
    );
  }
}

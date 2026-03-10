import { NextResponse } from "next/server";
import { resolveBackendUrl } from "@/lib/backendUrl";

export async function POST(request: Request) {
  const backendUrl = resolveBackendUrl();

  try {
    const payload = await request.json();

    const backendResponse = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    return NextResponse.json(
      { error: `Auth backend недоступен (${backendUrl}): ${message}` },
      { status: 503 },
    );
  }
}

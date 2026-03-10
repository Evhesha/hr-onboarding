import { NextResponse } from "next/server";
import { getLessons } from "@/lib/lessonCatalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lessons = await getLessons();
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Failed to load lessons catalog:", error);
    return NextResponse.json({ error: "Не удалось загрузить каталог уроков" }, { status: 500 });
  }
}

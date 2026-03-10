import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const LESSONS_IMAGES_DIR = path.join(process.cwd(), "lessons-images");

function getContentType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const requestedPath = resolvedParams.path.join("/");
  const fullPath = path.resolve(LESSONS_IMAGES_DIR, requestedPath);

  if (!fullPath.startsWith(LESSONS_IMAGES_DIR + path.sep)) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  try {
    const imageBuffer = await readFile(fullPath);
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": getContentType(fullPath),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

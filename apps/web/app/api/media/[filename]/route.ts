import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  // Xavfsizlik: path traversal himoyasi
  const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, "");
  const filePath = join(process.cwd(), "tmp", "uploads", safeFilename);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Fayl topilmadi" }, { status: 404 });
  }

  try {
    const fileStat = await stat(filePath);
    const fileBuffer = await readFile(filePath);

    let contentType = "application/octet-stream";
    if (safeFilename.endsWith(".mp4")) contentType = "video/mp4";
    else if (safeFilename.endsWith(".jpg") || safeFilename.endsWith(".jpeg")) contentType = "image/jpeg";
    else if (safeFilename.endsWith(".png")) contentType = "image/png";
    else if (safeFilename.endsWith(".wav")) contentType = "audio/wav";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileStat.size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Faylni o'qishda xatolik" },
      { status: 500 },
    );
  }
}


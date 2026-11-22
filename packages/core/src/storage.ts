// Media fayllarni Vercel Blob yoki lokal storage'ga yuklash — TZ 5.1.
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface StorageUploadResult {
  videoUrl: string;
  coverUrl: string;
}

/**
 * Bitta faylni yuklaydi. Token bo'lsa Vercel Blob'ga, bo'lmasa lokal diskka yozadi.
 */
export async function uploadMediaFile(
  data: Buffer,
  pathname: string,
  contentType: string,
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    const blob = await put(pathname, data, {
      access: "public",
      token,
      contentType,
    });
    return blob.url;
  }

  // Lokal fallback (bepul dev muhit yoki token kiritilmaganda)
  const localDir = join(process.cwd(), "tmp", "uploads");
  await mkdir(localDir, { recursive: true });
  const localFilePath = join(localDir, pathname.replace(/\//g, "_"));
  await writeFile(localFilePath, data);

  // Lokal URL yoki fayl yo'li qaytariladi
  return `file://${localFilePath.replace(/\\/g, "/")}`;
}

/**
 * Tayyor Reels videoni va uning muqova rasmini yuklaydi.
 */
export async function uploadVideoAndCover(
  videoBuffer: Buffer,
  coverBuffer: Buffer,
  videoId: string,
): Promise<StorageUploadResult> {
  const timestamp = Date.now();
  const videoName = `videos/${videoId}_${timestamp}.mp4`;
  const coverName = `covers/${videoId}_${timestamp}.jpg`;

  const [videoUrl, coverUrl] = await Promise.all([
    uploadMediaFile(videoBuffer, videoName, "video/mp4"),
    uploadMediaFile(coverBuffer, coverName, "image/jpeg"),
  ]);

  return { videoUrl, coverUrl };
}

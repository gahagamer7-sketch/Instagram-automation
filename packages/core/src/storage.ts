// Media fayllarni Vercel Blob yoki lokal storage'ga yuklash — TZ 5.1.
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getUploadsDir } from "./tmp-paths";

export interface StorageUploadResult {
  videoUrl: string;
  coverUrl: string;
}

/**
 * Bitta faylni yuklaydi. Token bo'lsa Vercel Blob'ga, bo'lmasa yoziladigan tmp papkaga saqlaydi.
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

  // Lokal yoki /tmp fallback (token kiritilmaganda)
  const localDir = getUploadsDir();
  await mkdir(localDir, { recursive: true });
  const localFileName = pathname.replace(/\//g, "_");
  const localFilePath = join(localDir, localFileName);
  await writeFile(localFilePath, data);

  // Brauzer orqali to'g'ridan-to'g'ri o'ynash va yuklab olish uchun URL
  return `/api/media/${localFileName}`;
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

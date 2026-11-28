import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Vaqtinchalik fayllar uchun yozish mumkin bo'lgan ildiz papkani qaytaradi.
 * Vercel / AWS Lambda muhitlarida `/var/task` read-only bo'lgani uchun `os.tmpdir()` ishlatiladi.
 */
export function getTmpBaseDir(): string {
  if (process.env.AUTOCHANNEL_TMP_DIR) {
    return process.env.AUTOCHANNEL_TMP_DIR;
  }
  if (
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NODE_ENV === "production"
  ) {
    return join(tmpdir(), "autochannel");
  }
  return join(process.cwd(), "tmp");
}

export function getUploadsDir(): string {
  return join(getTmpBaseDir(), "uploads");
}

export function getRenderDir(runId: string): string {
  return join(getTmpBaseDir(), "render", runId);
}

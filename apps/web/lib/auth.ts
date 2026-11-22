export const SESSION_COOKIE = "autochannel_session";
export const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 kun

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Admin sessiyasi uchun xavfsiz HMAC token yaratadi.
 */
export async function createSessionToken(secret: string): Promise<string> {
  const ts = Date.now().toString();
  const key = await getHmacKey(secret);
  const enc = new TextEncoder();
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(`autochannel-admin:${ts}`),
  );
  const sigHex = bufferToHex(sigBuf);
  return `${ts}.${sigHex}`;
}

/**
 * Sessiya tokenining haqiqiyligi va muddatini tekshiradi.
 */
export async function verifySessionToken(
  token: string,
  secret: string,
  maxAgeMs = SESSION_MAX_AGE_SEC * 1000,
): Promise<boolean> {
  try {
    const [tsStr, sigHex] = token.split(".");
    if (!tsStr || !sigHex) return false;

    const ts = parseInt(tsStr, 10);
    if (Number.isNaN(ts)) return false;

    if (Date.now() - ts > maxAgeMs) return false;

    const key = await getHmacKey(secret);
    const enc = new TextEncoder();
    const expectedSig = await crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(`autochannel-admin:${tsStr}`),
    );
    const expectedHex = bufferToHex(expectedSig);

    return sigHex === expectedHex;
  } catch {
    return false;
  }
}


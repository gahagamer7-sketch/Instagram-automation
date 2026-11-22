export const SESSION_COOKIE = "autochannel_session";
export const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 kun

export interface UserSessionPayload {
  userId: string;
  email: string;
  name?: string | null;
  role?: "user" | "admin";
}

export interface UserSession {
  userId: string;
  email: string;
  name: string | null;
  role: "user" | "admin";
  createdAt: number;
}

export function getAuthSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "autochannel-default-auth-secret-key-32-chars-long"
  );
}

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

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Foydalanuvchi parolini xavfsiz PBKDF2 (SHA-256, 100 000 iteratsiya) orqali xeshlaydi.
 */
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  const saltHex = bufferToHex(salt.buffer);
  const hashHex = bufferToHex(derivedBits);
  return `${saltHex}:${hashHex}`;
}

/**
 * Kiritilgan parolni saqlangan PBKDF2 xesh bilan tekshiradi.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  try {
    const [saltHex, expectedHashHex] = storedHash.split(":");
    if (!saltHex || !expectedHashHex) return false;

    const salt = new Uint8Array(
      saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? [],
    );
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256,
    );
    const actualHashHex = bufferToHex(derivedBits);
    return actualHashHex === expectedHashHex;
  } catch {
    return false;
  }
}

/**
 * Foydalanuvchi sessiyasi yoki admin uchun HMAC token yaratadi.
 */
export async function createSessionToken(
  payloadOrSecret: UserSessionPayload | string,
  secret?: string,
): Promise<string> {
  const enc = new TextEncoder();

  if (typeof payloadOrSecret === "string") {
    // Legacy admin token qo'llab-quvvatlash
    const ts = Date.now().toString();
    const sec = payloadOrSecret || getAuthSecret();
    const key = await getHmacKey(sec);
    const sigBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(`autochannel-admin:${ts}`),
    );
    const sigHex = bufferToHex(sigBuf);
    return `${ts}.${sigHex}`;
  }

  const session: UserSession = {
    userId: payloadOrSecret.userId,
    email: payloadOrSecret.email,
    name: payloadOrSecret.name ?? null,
    role: payloadOrSecret.role ?? "user",
    createdAt: Date.now(),
  };

  const payloadBase64 = base64UrlEncode(JSON.stringify(session));
  const sec = secret || getAuthSecret();
  const key = await getHmacKey(sec);
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payloadBase64),
  );
  const sigHex = bufferToHex(sigBuf);
  return `${payloadBase64}.${sigHex}`;
}

/**
 * Sessiya tokenining haqiqiyligi va muddatini tekshiradi, tasdiqlangan UserSession qaytaradi.
 */
export async function verifySessionToken(
  token: string,
  secret?: string,
  maxAgeMs = SESSION_MAX_AGE_SEC * 1000,
): Promise<UserSession | null> {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [part1, sigHex] = parts;
    if (!part1 || !sigHex) return null;

    const sec = secret || getAuthSecret();
    const key = await getHmacKey(sec);
    const enc = new TextEncoder();

    // 1. Agar part1 faqat raqam bo'lsa -> legacy admin token formati
    if (/^\d+$/.test(part1)) {
      const ts = parseInt(part1, 10);
      if (Number.isNaN(ts)) return null;
      if (Date.now() - ts > maxAgeMs) return null;

      const expectedSig = await crypto.subtle.sign(
        "HMAC",
        key,
        enc.encode(`autochannel-admin:${part1}`),
      );
      const expectedHex = bufferToHex(expectedSig);
      if (sigHex !== expectedHex) return null;

      return {
        userId: "admin",
        email: "admin@autochannel.local",
        name: "Administrator",
        role: "admin",
        createdAt: ts,
      };
    }

    // 2. Multi-tenant payload-based token
    const expectedSig = await crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(part1),
    );
    const expectedHex = bufferToHex(expectedSig);
    if (sigHex !== expectedHex) return null;

    const rawJson = base64UrlDecode(part1);
    const session = JSON.parse(rawJson) as UserSession;

    if (!session || !session.userId || !session.email || !session.createdAt) {
      return null;
    }

    if (Date.now() - session.createdAt > maxAgeMs) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

import { prisma } from "@autochannel/db";
import { encrypt, decrypt, last4 } from "@autochannel/crypto";
import { createProvider, type AiProvider } from "@autochannel/ai";
import { PexelsProvider } from "@autochannel/integrations";

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 16) {
    throw new Error("ENCRYPTION_KEY sozlanmagan (kamida 16 belgi)");
  }
  return key;
}

/**
 * Legacy ADMIN_PASSWORD sessiyasi ("admin") uchun bazada egasi yozuvi bo'lishini ta'minlaydi.
 */
async function ensureCredentialOwner(userId: string): Promise<string> {
  const ownerId = userId.trim();
  if (!ownerId) {
    throw new Error("Foydalanuvchi aniqlanmadi. Qaytadan tizimga kiring.");
  }

  if (ownerId === "admin") {
    const existing = await prisma.user.findUnique({
      where: { id: "admin" },
      select: { id: true },
    });
    if (!existing) {
      await prisma.user
        .create({
          data: {
            id: "admin",
            email: "admin-root@autochannel.local",
            name: "Administrator",
            passwordHash: "env-admin",
            role: "admin",
          },
        })
        .catch(() => undefined);
    }
  }

  return ownerId;
}

export interface CredentialView {
  id: string;
  provider: string;
  last4: string;
  status: string;
  lastCheckedAt: string | null;
  lastError: string | null;
  dailyLimit: string | null;
  monthlyLimit: string | null;
  dailySpent: string;
  monthlySpent: string;
}

export function toView(c: {
  id: string;
  provider: string;
  last4: string;
  status: string;
  lastCheckedAt: Date | null;
  lastError: string | null;
  dailyLimit: unknown;
  monthlyLimit: unknown;
  dailySpent: unknown;
  monthlySpent: unknown;
}): CredentialView {
  return {
    id: c.id,
    provider: c.provider,
    last4: c.last4,
    status: c.status,
    lastCheckedAt: c.lastCheckedAt?.toISOString() ?? null,
    lastError: c.lastError,
    dailyLimit: c.dailyLimit != null ? String(c.dailyLimit) : null,
    monthlyLimit: c.monthlyLimit != null ? String(c.monthlyLimit) : null,
    dailySpent: String(c.dailySpent),
    monthlySpent: String(c.monthlySpent),
  };
}

export async function listCredentials(userId: string): Promise<CredentialView[]> {
  if (!userId) return [];
  const rows = await prisma.apiCredential.findMany({
    where: { userId },
    orderBy: { provider: "asc" },
  });
  return rows.map(toView);
}

export async function saveCredential(
  userId: string,
  provider: string,
  apiKey: string,
  limits?: { daily?: number; monthly?: number },
): Promise<CredentialView> {
  const ownerId = await ensureCredentialOwner(userId);
  const encKey = getEncryptionKey();
  const data = {
    userId: ownerId,
    provider,
    encryptedKey: encrypt(apiKey, encKey),
    last4: last4(apiKey),
    status: "unverified" as const,
    lastError: null,
    dailyLimit: limits?.daily,
    monthlyLimit: limits?.monthly,
  };
  const row = await prisma.apiCredential.upsert({
    where: { userId_provider: { userId: ownerId, provider } },
    create: data,
    update: data,
  });
  return toView(row);
}

export async function testCredential(
  id: string,
  userId: string,
): Promise<{
  ok: boolean;
  message: string;
  status: string;
}> {
  if (!userId) {
    return { ok: false, message: "Avtorizatsiyadan o'tilmagan", status: "error" };
  }

  const encKey = getEncryptionKey();
  const row = await prisma.apiCredential.findFirst({
    where: { id, userId },
  });
  if (!row) {
    return { ok: false, message: "Kalit topilmadi yoki sizga tegishli emas", status: "error" };
  }

  let result: { ok: boolean; message: string };
  if (row.provider === "gemini") {
    const provider = createProvider("gemini", decrypt(row.encryptedKey, encKey));
    result = await provider.checkConnection();
  } else if (row.provider === "groq") {
    const provider = createProvider("groq", decrypt(row.encryptedKey, encKey));
    result = await provider.checkConnection();
  } else if (row.provider === "pexels") {
    const pexels = new PexelsProvider(decrypt(row.encryptedKey, encKey));
    result = await pexels.checkConnection();
  } else {
    result = { ok: false, message: `"${row.provider}" provayderi qo'llab-quvvatlanmaydi` };
  }

  const status = result.ok ? "connected" : "error";
  await prisma.apiCredential.update({
    where: { id: row.id },
    data: { status, lastCheckedAt: new Date(), lastError: result.ok ? null : result.message },
  });
  return { ...result, status };
}

export async function getUserProviderKey(
  userId: string,
  provider: string,
): Promise<string | null> {
  if (!userId) return null;
  const encKey = getEncryptionKey();
  const row = await prisma.apiCredential.findUnique({
    where: { userId_provider: { userId, provider } },
  });
  if (!row) return null;
  return decrypt(row.encryptedKey, encKey);
}

export type ProviderLookup =
  | { ok: true; provider: AiProvider; credentialId: string }
  | { ok: false; message: string };

/**
 * Foydalanuvchining shaxsiy AI kalitini oladi (kalit bazadan deshifrlanadi).
 * Boshqa foydalanuvchining yoki umumiy muhit kalitiga o'tib ketmaydi.
 */
export async function getAiProvider(
  preferredProvider: "gemini" | "groq" = "gemini",
  userId?: string,
): Promise<ProviderLookup> {
  try {
    if (!userId) {
      return {
        ok: false,
        message: "Avtorizatsiyadan o'tilmagan. Iltimos tizimga kiring.",
      };
    }

    const encKey = getEncryptionKey();
    let row = await prisma.apiCredential.findUnique({
      where: { userId_provider: { userId, provider: preferredProvider } },
    });
    if (!row) {
      const fallback = preferredProvider === "groq" ? "gemini" : "groq";
      row = await prisma.apiCredential.findUnique({
        where: { userId_provider: { userId, provider: fallback } },
      });
    }
    if (!row) {
      return {
        ok: false,
        message:
          "Sizda AI kaliti kiritilmagan. Sozlamalar → API kalitlar bo'limida o'zingizning Gemini yoki Groq kalitingizni kiriting va tekshiring.",
      };
    }
    return {
      ok: true,
      provider: createProvider(row.provider, decrypt(row.encryptedKey, encKey)),
      credentialId: row.id,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Ovoz (TTS) sintezi uchun faqat shu foydalanuvchining shaxsiy Gemini provayderini qaytaradi.
 */
export async function getGeminiTtsProvider(userId?: string): Promise<ProviderLookup> {
  try {
    if (!userId) {
      return {
        ok: false,
        message: "Avtorizatsiyadan o'tilmagan. Iltimos tizimga kiring.",
      };
    }

    const encKey = getEncryptionKey();
    const row = await prisma.apiCredential.findUnique({
      where: { userId_provider: { userId, provider: "gemini" } },
    });
    if (!row) {
      return {
        ok: false,
        message:
          "Sizda Gemini API kaliti topilmadi. Ovoz (TTS) sintezi uchun Sozlamalarda o'zingizning Gemini kalitingizni kiritishingiz shart.",
      };
    }
    return {
      ok: true,
      provider: createProvider("gemini", decrypt(row.encryptedKey, encKey)),
      credentialId: row.id,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

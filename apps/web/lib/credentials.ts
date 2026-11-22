import { prisma } from "@autochannel/db";
import { encrypt, decrypt, last4 } from "@autochannel/crypto";
import { createProvider, type AiProvider } from "@autochannel/ai";
import { YouTubeProvider } from "@autochannel/integrations";

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 16) {
    throw new Error("ENCRYPTION_KEY sozlanmagan (kamida 16 belgi)");
  }
  return key;
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

export async function listCredentials(): Promise<CredentialView[]> {
  const rows = await prisma.apiCredential.findMany({ orderBy: { provider: "asc" } });
  return rows.map(toView);
}

export async function saveCredential(
  provider: string,
  apiKey: string,
  limits?: { daily?: number; monthly?: number },
): Promise<CredentialView> {
  const encKey = getEncryptionKey();
  const data = {
    provider,
    encryptedKey: encrypt(apiKey, encKey),
    last4: last4(apiKey),
    status: "unverified" as const,
    dailyLimit: limits?.daily,
    monthlyLimit: limits?.monthly,
  };
  const row = await prisma.apiCredential.upsert({
    where: { provider },
    create: data,
    update: data,
  });
  return toView(row);
}

export async function testCredential(id: string): Promise<{
  ok: boolean;
  message: string;
  status: string;
}> {
  const encKey = getEncryptionKey();
  const row = await prisma.apiCredential.findUnique({ where: { id } });
  if (!row) return { ok: false, message: "Kalit topilmadi", status: "error" };

  let result: { ok: boolean; message: string };
  if (row.provider === "gemini") {
    const provider = createProvider("gemini", decrypt(row.encryptedKey, encKey));
    result = await provider.checkConnection();
  } else if (row.provider === "youtube") {
    const yt = new YouTubeProvider(decrypt(row.encryptedKey, encKey));
    result = await yt.checkConnection();
  } else {
    result = { ok: false, message: `"${row.provider}" provayderi testi hali qo'shilmagan` };
  }

  const status = result.ok ? "connected" : "error";
  await prisma.apiCredential.update({
    where: { id },
    data: { status, lastCheckedAt: new Date(), lastError: result.ok ? null : result.message },
  });
  return { ...result, status };
}

export type ProviderLookup =
  | { ok: true; provider: AiProvider; credentialId: string }
  | { ok: false; message: string };

/**
 * AI chaqiruvi uchun tayyor provayder (kalit deshifrlanadi).
 * Kalit yo'q bo'lsa — bosqich "kalit kerak" holatida to'xtaydi (TZ 4.10).
 */
export async function getAiProvider(): Promise<ProviderLookup> {
  try {
    const encKey = getEncryptionKey();
    const row = await prisma.apiCredential.findUnique({ where: { provider: "gemini" } });
    if (!row) {
      return {
        ok: false,
        message:
          "Gemini kaliti kiritilmagan. Sozlamalar → API kalitlar bo'limida kalitni kiriting va tekshiring.",
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

"use server";

import { refresh } from "next/cache";
import { saveCredential, testCredential } from "@/lib/credentials";
import { providerMeta } from "@/lib/providers";
import { getCurrentUser } from "@/lib/session";

export interface ActionResult {
  ok: boolean;
  message: string;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message.slice(0, 300);
  return String(err).slice(0, 300);
}

function parseLimit(raw: FormDataEntryValue | null): number | undefined {
  if (raw == null) return undefined;
  const text = String(raw).trim().replace(",", ".");
  if (text === "") return undefined;
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0) return undefined;
  return Math.min(value, 1_000_000);
}

/** API kalitni saqlash (yangi yoki almashtirish) — TZ 4.10. */
export async function saveKeyAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const provider = String(formData.get("provider") ?? "").trim();
  const apiKey = String(formData.get("apiKey") ?? "").trim();
  const meta = providerMeta(provider);

  if (!meta) {
    return { ok: false, message: "Noma'lum provayder." };
  }
  if (apiKey.length < 8) {
    return { ok: false, message: "Kalit juda qisqa. To'liq kalitni kiriting." };
  }
  if (/\s/.test(apiKey)) {
    return { ok: false, message: "Kalitda bo'sh joy bo'lmasligi kerak." };
  }

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { ok: false, message: "Avtorizatsiyadan o'tilmagan. Iltimos tizimga kiring." };
    }
    const saved = await saveCredential(currentUser.user.id, provider, apiKey, {
      daily: parseLimit(formData.get("dailyLimit")),
      monthly: parseLimit(formData.get("monthlyLimit")),
    });
    refresh();
    return {
      ok: true,
      message: `${meta.label}: kalit saqlandi (••••${saved.last4}). Endi "Ulanishni tekshirish"ni bosing.`,
    };
  } catch (err) {
    return { ok: false, message: errorMessage(err) };
  }
}

/** "Ulanishni tekshirish" — TZ 4.10. */
export async function testKeyAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Kalit topilmadi." };

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { ok: false, message: "Avtorizatsiyadan o'tilmagan." };
    }
    const result = await testCredential(id, currentUser.user.id);
    refresh();
    return { ok: result.ok, message: result.message };
  } catch (err) {
    return { ok: false, message: errorMessage(err) };
  }
}

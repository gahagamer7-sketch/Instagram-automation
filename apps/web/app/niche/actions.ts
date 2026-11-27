"use server";

import { prisma } from "@autochannel/db";
import { refresh } from "next/cache";
import {
  YouTubeProvider,
  GoogleTrendsProvider,
  type TrendSignal,
} from "@autochannel/integrations";
import { scoreNiche, type NicheScores, type NicheCandidateInput } from "@/lib/niche";
import { getActiveSkillText } from "@/lib/skills";
import { getAiProvider } from "@/lib/credentials";
import { getCurrentUser } from "@/lib/session";


export interface NicheActionResult {
  ok: boolean;
  message: string;
  candidates?: Array<{
    niche: string;
    source: string;
    scores: NicheScores;
    signals: Record<string, unknown>;
  }>;
}

function errorMessage(err: unknown): string {
  return (err instanceof Error ? err.message : String(err)).slice(0, 300);
}

/**
 * Nisha kashfiyotchisini ishga tushiradi (TZ 4.0).
 * 1. Signal manbalardan nomzodlarni yig'adi (YouTube mostPopular UZ, LLM).
 * 2. Har birni 5-mezonli ballaydi.
 * 3. Top-3-ni DB'da saqlaydi (status: candidate).
 */
export async function discoverNichesAction(
  _prev: NicheActionResult | null,
  _formData: FormData,
): Promise<NicheActionResult> {
  const signals: TrendSignal[] = [];

  const youtubeKey = process.env.YOUTUBE_API_KEY;
  if (youtubeKey) {
    try {
      const yt = new YouTubeProvider(youtubeKey);
      const ytSignals = await yt.mostPopular({
        regionCode: "UZ",
        maxResults: 25,
      });
      signals.push(...ytSignals);
    } catch (err) {
      // YouTube xatoliklari discovery'ni to'shtirmaydi — davom etiladi.
    }
  }

  // Google Trends — reserved, hozircha bo'sh (TZ 4.0: scraping yo'q).
  await new GoogleTrendsProvider().checkConnection().catch(() => undefined);

  // LLM orqali qo'shimcha nomzodlarni generatsiya qilish (agar foydalanuvchining AI kaliti bo'lsa).
  let llmSignals: TrendSignal[] = [];
  try {
    const currentUser = await getCurrentUser();
    const providerLookup = await getAiProvider("gemini", currentUser?.user?.id);
    if (providerLookup.ok) {
      const skillText = await getActiveSkillText();
      const skillCtx = skillText
        ? `\n\nSkill (video qoidalari):\n${skillText.slice(0, 2000)}`
        : "";
      const prompt = [
        "O'zbekiston auditoriyasi (18-34 yosh) uchun Instagram Reels nisha nomzodlarini",
        "10 ta taklif ber. Har biriga qisqa sabab yoz.",
        "Format: faqat ro'yxat, har qator bitta nomzod.",
        "Mavzular: bilim, sog'lik, texnologiya, biznes, mashg'ulotlar, oila, yoshlar.",
        skillCtx,
      ].join("\n");

      const result = await providerLookup.provider.generateText(prompt, {
        temperature: 0.7,
        maxOutputTokens: 1024,
      });

      const lines = result.text
        .split("\n")
        .map((l) => l.replace(/^[-*\d\.]\s*/, "").trim())
        .filter((l) => l.length > 3);
      llmSignals = lines.slice(0, 10).map((query) => ({
        query,
        source: "llm",
        interest: 0.6,
        meta: { generator: "gemini" },
        fetchedAt: new Date().toISOString(),
      }));
    }
  } catch {
    // LLM xatoliklari discovery'ni to'shtirmaydi.
  }

  const allSignals = [...signals, ...llmSignals];

  if (allSignals.length === 0) {
    return {
      ok: false,
      message:
        "Signal manbai topilmadi. YOUTUBE_API_KEY yoki GEMINI_API_KEY kiriting.",
    };
  }

  // Har bir nomzodni ballash.
  const candidates = allSignals.map((s) => {
    const input: NicheCandidateInput = {
      niche: s.query,
      source: s.source,
      signals: { ...s.meta, interest: s.interest },
    };
    return {
      niche: s.query,
      source: s.source,
      scores: scoreNiche(input),
      signals: input.signals,
    };
  });

  // Ball bo'yicha tartiblab, top-10-ni DB'ga saqlash.
  candidates.sort((a, b) => b.scores.total - a.scores.total);
  const topList = candidates.slice(0, 10);

  const savedCandidates: Array<{
    id: string;
    niche: string;
    source: string;
    scores: NicheScores;
    signals: Record<string, unknown>;
  }> = [];

  try {
    await prisma.$transaction(async (tx) => {
      // Eski nomzodlarni rad etamiz (yangi discovery oldini tozalaydi).
      await tx.nicheCandidate.updateMany({
        where: { status: "candidate" },
        data: { status: "rejected" },
      });

      for (const c of topList) {
        const created = await tx.nicheCandidate.create({
          data: {
            niche: c.niche,
            signals: c.signals as any,
            scoreDemand: c.scores.demand,
            scoreCompetition: c.scores.competition,
            scoreAutomation: c.scores.automation,
            scoreMonetization: c.scores.monetization,
            scoreContentReserve: c.scores.contentReserve,
            scoreTotal: c.scores.total,
            status: "candidate",
          },
        });
        savedCandidates.push({
          id: created.id,
          niche: c.niche,
          source: c.source,
          scores: c.scores,
          signals: c.signals,
        });
      }
    });
  } catch (err) {
    return { ok: false, message: `DB saqlash xatosi: ${errorMessage(err)}` };
  }

  refresh();
  return {
    ok: true,
    message: `${allSignals.length} signal bo'yicha ${savedCandidates.length} ta nomzod topildi va ballalandi.`,
    candidates: savedCandidates,
  };
}

/** Nomzodni tanlash va kanalga biriktirish (TZ 4.0). */
export async function selectCandidateAction(
  candidateId: string,
  mode: "winner" | "testing" = "winner",
): Promise<{ ok: boolean; message: string }> {
  try {
    const candidate = await prisma.nicheCandidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate) {
      return { ok: false, message: "Nomzod topilmadi." };
    }

    await prisma.$transaction(async (tx) => {
      if (mode === "winner") {
        await tx.nicheCandidate.updateMany({
          where: { status: "winner" },
          data: { status: "candidate" },
        });
      }

      await tx.nicheCandidate.update({
        where: { id: candidateId },
        data: {
          status: mode,
          ...(mode === "testing"
            ? {
                testStartAt: new Date(),
                testEndAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              }
            : {}),
        },
      });

      const channel = await tx.channel.findFirst();
      if (!channel) {
        await tx.channel.create({
          data: {
            name: candidate.niche,
            niche: candidate.niche,
            status: mode === "winner" ? "active" : "niche_test",
          },
        });
      } else {
        await tx.channel.update({
          where: { id: channel.id },
          data: {
            niche: candidate.niche,
            status: mode === "winner" ? "active" : "niche_test",
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actor: "admin",
          action: `niche.select_${mode}`,
          target: `niche/${candidate.id}`,
          details: { niche: candidate.niche },
        },
      });
    });

    refresh();
    return {
      ok: true,
      message: `"${candidate.niche}" nishasi ${
        mode === "winner" ? "g'olib sifatida tanlandi" : "14 kunlik sinovga qo'yildi"
      }.`,
    };
  } catch (err) {
    return { ok: false, message: `Xatolik: ${errorMessage(err)}` };
  }
}

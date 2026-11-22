// Telegram Bot bildirishnomalari — TZ 4.9 & TZ 4.5.
// Yangi video tayyor, joylandi, avto-pauza, xatoliklar va haftalik hisobot.

import { IntegrationError } from "./index";

export interface VideoReadyNotification {
  topic: string;
  durationSec?: number;
  scheduledFor?: string;
  videoUrl?: string;
}

export interface VideoPublishedNotification {
  topic: string;
  igMediaId: string;
  publishedAt?: string;
}

export class TelegramProvider {
  private readonly token: string;
  private readonly baseUrl: string;

  constructor(token: string) {
    if (!token || token.trim().length === 0) {
      throw new IntegrationError("Telegram Bot Token kiritilmagan", "telegram");
    }
    this.token = token.trim();
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  /**
   * Bot tokenining to'g'riligini getMe so'rovi orqali tekshiradi (TZ 4.10).
   */
  async checkConnection(): Promise<{
    ok: boolean;
    message: string;
    botUsername?: string;
    botName?: string;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/getMe`, {
        signal: AbortSignal.timeout(10_000),
      });

      const data = (await res.json()) as {
        ok: boolean;
        result?: { username: string; first_name: string };
        description?: string;
      };

      if (!res.ok || !data.ok || !data.result) {
        return {
          ok: false,
          message: data.description || `Telegram API xatosi (${res.status})`,
        };
      }

      return {
        ok: true,
        message: `Telegram bot ulandi: @${data.result.username} (${data.result.first_name})`,
        botUsername: data.result.username,
        botName: data.result.first_name,
      };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Telegram chatga HTML formatida xabar yuboradi.
   */
  async sendMessage(chatId: string, text: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
        signal: AbortSignal.timeout(15_000),
      });

      const data = (await res.json()) as { ok: boolean; description?: string };
      if (!res.ok || !data.ok) {
        console.warn("[telegram] Xabar yuborishda xato:", data.description);
        return false;
      }
      return true;
    } catch (err) {
      console.warn("[telegram] Tarmoq xatosi:", err);
      return false;
    }
  }

  /**
   * Yangi video render bo'lib tayyor bo'lganda bildirishnoma yuborish.
   */
  async notifyVideoReady(chatId: string, info: VideoReadyNotification): Promise<boolean> {
    const text = [
      `🎬 <b>Yangi Reels videosi tayyor!</b>`,
      ``,
      `📌 <b>Mavzu:</b> ${info.topic}`,
      info.durationSec ? `⏱ <b>Davomiylik:</b> ~${info.durationSec}s` : "",
      info.scheduledFor ? `📅 <b>Joylash vaqti:</b> ${info.scheduledFor}` : "",
      info.videoUrl ? `🔗 <a href="${info.videoUrl}">Videoni ko'rish</a>` : "",
      ``,
      `<i>Reels reja bo'yicha Instagram'ga avtomatik joylanadi.</i>`,
    ]
      .filter(Boolean)
      .join("\n");

    return this.sendMessage(chatId, text);
  }

  /**
   * Video muvaffaqiyatli Instagram'ga joylanganda bildirishnoma.
   */
  async notifyVideoPublished(chatId: string, info: VideoPublishedNotification): Promise<boolean> {
    const text = [
      `🚀 <b>Reels Instagram'ga joylandi!</b>`,
      ``,
      `📌 <b>Mavzu:</b> ${info.topic}`,
      `🆔 <b>Media ID:</b> <code>${info.igMediaId}</code>`,
      `⏰ <b>Vaqt:</b> ${info.publishedAt || new Date().toLocaleString("uz-UZ")}`,
      ``,
      `<i>Insights statistikasi 24 soatdan so'ng tahlil qilinadi.</i>`,
    ].join("\n");

    return this.sendMessage(chatId, text);
  }

  /**
   * Ketma-ket xatoliklarda avto-pauza bildirishnomasi (TZ 4.5).
   */
  async notifyAutoPaused(chatId: string, reason: string): Promise<boolean> {
    const text = [
      `⚠️ <b>DIQQAT: Tizim avto-pauzaga o'tdi!</b>`,
      ``,
      `Sabab: <b>${reason}</b>`,
      ``,
      `Xavfsizlik yuzasidan yangi videolar joylash to'xtatildi.`,
      `Boshqaruv paneliga kirib holatni tekshiring va "Davom ettirish" tugmasini bosing.`,
    ].join("\n");

    return this.sendMessage(chatId, text);
  }

  /**
   * Muhim xatolik yuz berganda xabar berish.
   */
  async notifyError(chatId: string, errorMsg: string, context?: string): Promise<boolean> {
    const text = [
      `❌ <b>AutoChannel Tizimida Xatolik</b>`,
      context ? `Qayerda: <i>${context}</i>` : "",
      `Tafsilot: <code>${errorMsg.slice(0, 300)}</code>`,
    ]
      .filter(Boolean)
      .join("\n");

    return this.sendMessage(chatId, text);
  }
}


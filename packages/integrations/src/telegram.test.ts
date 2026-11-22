import { describe, expect, it } from "vitest";
import { TelegramProvider } from "./telegram";

describe("TelegramProvider", () => {
  it("bo'sh token berilganda xatolik beradi", () => {
    expect(() => new TelegramProvider("")).toThrow("Telegram Bot Token kiritilmagan");
    expect(() => new TelegramProvider("   ")).toThrow("Telegram Bot Token kiritilmagan");
  });

  it("to'g'ri token bilan obyekt yaratiladi", () => {
    const provider = new TelegramProvider("123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11");
    expect(provider).toBeInstanceOf(TelegramProvider);
  });
});


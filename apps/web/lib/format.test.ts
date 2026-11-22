import { describe, expect, it } from "vitest";
import { formatDateTime, formatNumber, formatUsd } from "./format";

describe("formatUsd", () => {
  it("ikki xona bilan formatlaydi", () => {
    expect(formatUsd(1.5)).toBe("$1.50");
    expect(formatUsd("0")).toBe("$0.00");
    expect(formatUsd(123.456)).toBe("$123.46");
  });

  it("bo'sh va noto'g'ri qiymatda $0.00 qaytaradi", () => {
    expect(formatUsd(null)).toBe("$0.00");
    expect(formatUsd(undefined)).toBe("$0.00");
    expect(formatUsd("")).toBe("$0.00");
    expect(formatUsd("abc")).toBe("$0.00");
  });
});

describe("formatDateTime", () => {
  it("Toshkent vaqtiga (UTC+5) o'giradi", () => {
    // 2026-11-22T14:30:00Z -> 19:30 Toshkent
    expect(formatDateTime("2026-11-22T14:30:00.000Z")).toBe("22.11.2026 19:30");
  });

  it("bo'sh va noto'g'ri qiymatda tire qaytaradi", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime("not-a-date")).toBe("—");
  });
});

describe("formatNumber", () => {
  it("mingliklarni ajratadi", () => {
    expect(formatNumber(1234)).toBe("1,234");
    expect(formatNumber(0)).toBe("0");
  });

  it("noto'g'ri qiymatda tire qaytaradi", () => {
    expect(formatNumber(null)).toBe("—");
    expect(formatNumber(Number.NaN)).toBe("—");
  });
});

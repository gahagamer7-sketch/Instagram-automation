import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./auth";

describe("Admin Session Auth", () => {
  const secret = "test-secret-super-safe-key-123456";

  it("to'g'ri yaratilgan tokenni muvaffaqiyatli tekshiradi", async () => {
    const token = await createSessionToken(secret);
    expect(token).toContain(".");

    const isValid = await verifySessionToken(token, secret);
    expect(isValid).toBe(true);
  });

  it("noto'g'ri sir (secret) bilan tekshirilganda rad etadi", async () => {
    const token = await createSessionToken(secret);
    const isValid = await verifySessionToken(token, "wrong-secret-key-9999");
    expect(isValid).toBe(false);
  });

  it("o'zgartirilgan (tampered) tokenni rad etadi", async () => {
    const token = await createSessionToken(secret);
    const [ts, sig] = token.split(".");
    const tampered = `${ts}.${sig.slice(0, -2)}aa`;
    const isValid = await verifySessionToken(tampered, secret);
    expect(isValid).toBe(false);
  });

  it("muddati o'tgan tokenni rad etadi", async () => {
    const token = await createSessionToken(secret);
    // maxAgeMs = -1000 (allaqachon o'tgan)
    const isValid = await verifySessionToken(token, secret, -1000);
    expect(isValid).toBe(false);
  });

  it("noto'g'ri formatdagi tokenda xato bermasdan false qaytaradi", async () => {
    expect(await verifySessionToken("invalid-token", secret)).toBe(false);
    expect(await verifySessionToken("", secret)).toBe(false);
  });
});


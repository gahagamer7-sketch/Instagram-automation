import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
  hashPassword,
  verifyPassword,
} from "./auth";

describe("Parol xeshlash (PBKDF2 SHA-256)", () => {
  it("parolni muvaffaqiyatli xeshlaydi va tasdiqlaydi", async () => {
    const raw = "SuperMaxfiyParol!2026";
    const hash = await hashPassword(raw);

    expect(hash).toContain(":");
    const [salt, key] = hash.split(":");
    expect(salt.length).toBe(32); // 16 bayt hex
    expect(key.length).toBe(64); // 256 bit hex

    const isMatch = await verifyPassword(raw, hash);
    expect(isMatch).toBe(true);
  });

  it("noto'g'ri parol kiritilganda rad etadi", async () => {
    const hash = await hashPassword("to'g'ri-parol");
    const isMatch = await verifyPassword("noto'g'ri-parol", hash);
    expect(isMatch).toBe(false);
  });
});

describe("Multi-tenant Foydalanuvchi Sessiyasi Auth", () => {
  const secret = "test-secret-super-safe-key-123456";

  it("foydalanuvchi obyekti bilan tokenni muvaffaqiyatli yaratadi va o'qiydi", async () => {
    const userPayload = {
      userId: "usr_12345",
      email: "test@autochannel.uz",
      name: "Ali Valiyev",
      role: "user" as const,
    };

    const token = await createSessionToken(userPayload, secret);
    expect(token).toContain(".");

    const session = await verifySessionToken(token, secret);
    expect(session).not.toBeNull();
    expect(session?.userId).toBe("usr_12345");
    expect(session?.email).toBe("test@autochannel.uz");
    expect(session?.name).toBe("Ali Valiyev");
    expect(session?.role).toBe("user");
    expect(typeof session?.createdAt).toBe("number");
  });

  it("legacy admin secret bilan yaratilgan tokenni ham taniydi", async () => {
    const token = await createSessionToken(secret);
    expect(token).toContain(".");

    const session = await verifySessionToken(token, secret);
    expect(session).not.toBeNull();
    expect(session?.userId).toBe("admin");
    expect(session?.role).toBe("admin");
  });

  it("noto'g'ri sir (secret) bilan tekshirilganda rad etadi", async () => {
    const token = await createSessionToken(
      { userId: "usr_1", email: "a@b.com" },
      secret,
    );
    const session = await verifySessionToken(token, "wrong-secret-key-9999");
    expect(session).toBeNull();
  });

  it("o'zgartirilgan (tampered) tokenni rad etadi", async () => {
    const token = await createSessionToken(
      { userId: "usr_1", email: "a@b.com" },
      secret,
    );
    const [payload, sig] = token.split(".");
    const tampered = `${payload}.${sig.slice(0, -2)}aa`;
    const session = await verifySessionToken(tampered, secret);
    expect(session).toBeNull();
  });

  it("muddati o'tgan tokenni rad etadi", async () => {
    const token = await createSessionToken(
      { userId: "usr_1", email: "a@b.com" },
      secret,
    );
    const session = await verifySessionToken(token, secret, -1000);
    expect(session).toBeNull();
  });

  it("noto'g'ri formatdagi tokenda xato bermasdan null qaytaradi", async () => {
    expect(await verifySessionToken("invalid-token", secret)).toBeNull();
    expect(await verifySessionToken("", secret)).toBeNull();
  });
});

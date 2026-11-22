import { describe, expect, it } from "vitest";
import { decrypt, encrypt, generateMasterKey, last4 } from "./index";

const KEY = "0123456789abcdef0123456789abcdef";

describe("encrypt / decrypt", () => {
  it("matnni shifrlab, qayta ochadi", () => {
    const plaintext = "AIzaSy-super-secret-key-1234567890";
    const ciphertext = encrypt(plaintext, KEY);

    expect(ciphertext).not.toContain(plaintext);
    expect(ciphertext.split(".")).toHaveLength(3);
    expect(decrypt(ciphertext, KEY)).toBe(plaintext);
  });

  it("bir xil matn har safar boshqacha shifrlanadi (IV tasodifiy)", () => {
    const a = encrypt("bir xil", KEY);
    const b = encrypt("bir xil", KEY);
    expect(a).not.toBe(b);
    expect(decrypt(a, KEY)).toBe(decrypt(b, KEY));
  });

  it("noto'g'ri kalit bilan ochilmaydi", () => {
    const ciphertext = encrypt("maxfiy", KEY);
    expect(() => decrypt(ciphertext, "boshqa-kalit-1234567890")).toThrow();
  });

  it("buzilgan shifrmatnda xato beradi (GCM integrity)", () => {
    const ciphertext = encrypt("maxfiy", KEY);
    const [iv, tag, data] = ciphertext.split(".");
    const tampered = [iv, tag, `${data!.slice(0, -4)}AAAA`].join(".");
    expect(() => decrypt(tampered, KEY)).toThrow();
  });

  it("noto'g'ri formatdagi qiymatni rad etadi", () => {
    expect(() => decrypt("buzilgan", KEY)).toThrow("Malformed ciphertext");
  });

  it("unicode matnni saqlaydi", () => {
    const plaintext = "o'zbek tili: g'oya, ssenariy — 100% ✓";
    expect(decrypt(encrypt(plaintext, KEY), KEY)).toBe(plaintext);
  });
});

describe("last4", () => {
  it("oxirgi 4 belgini qaytaradi", () => {
    expect(last4("AIzaSy1234567890")).toBe("7890");
  });

  it("qisqa matnda hammasini qaytaradi", () => {
    expect(last4("ab")).toBe("ab");
  });
});

describe("generateMasterKey", () => {
  it("64 belgilik hex kalit yaratadi", () => {
    const key = generateMasterKey();
    expect(key).toHaveLength(64);
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(generateMasterKey()).not.toBe(key);
  });
});

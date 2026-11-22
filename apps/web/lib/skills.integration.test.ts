import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { prisma } from "@autochannel/db";
import {
  activateSkillVersion,
  createSkillVersion,
  getActiveSkill,
  listSkillVersions,
} from "./skills";
import { SKILL_MIN_CHARS } from "./skill-text";

/**
 * Haqiqiy bazaga qarshi testlar. `pnpm db:dev` ishlamayotgan bo'lsa
 * avtomatik o'tkazib yuboriladi (CI'da baza talab qilinmaydi).
 */
const dbReady = await (async () => {
  try {
    await prisma.$queryRaw`select 1`;
    return true;
  } catch {
    return false;
  }
})();

const NAME = `test-skill-${randomUUID().slice(0, 8)}`;
const VALID_TEXT = [
  "# Test skill",
  "",
  "## Tuzilma",
  "Hook 0-3 sekund, asosiy qism, CTA.",
  "",
  "## Uslub",
  "Qisqa gaplar, jonli ohang.",
  "",
  "## Taqiqlar",
  "Siyosat, tibbiy maslahat yo'q.",
  "",
  "x".repeat(SKILL_MIN_CHARS),
].join("\n");

describe.skipIf(!dbReady)("skill versioning (DB)", () => {
  it("birinchi versiyani yaratadi va faollashtiradi", async () => {
    const created = await createSkillVersion({
      name: NAME,
      text: VALID_TEXT,
      activate: true,
    });

    expect(created.ok).toBe(true);
    if (created.ok) expect(created.version).toBe(1);

    const active = await getActiveSkill(NAME);
    expect(active?.version).toBe(1);
    expect(active?.isActive).toBe(true);
  });

  it("ikkinchi versiya faol versiyani o'zgartirmaydi", async () => {
    const created = await createSkillVersion({
      name: NAME,
      text: `${VALID_TEXT}\n\nyangi qo'shimcha`,
      activate: false,
    });

    expect(created.ok).toBe(true);
    if (created.ok) expect(created.version).toBe(2);

    const active = await getActiveSkill(NAME);
    expect(active?.version).toBe(1);

    const versions = await listSkillVersions(NAME);
    expect(versions.map((v) => v.version)).toEqual([2, 1]);
  });

  it("faqat bitta versiya faol qoladi", async () => {
    const versions = await listSkillVersions(NAME);
    const v2 = versions.find((v) => v.version === 2);
    expect(v2).toBeDefined();

    const activated = await activateSkillVersion(v2!.id, "test");
    expect(activated.ok).toBe(true);

    const after = await listSkillVersions(NAME);
    expect(after.filter((v) => v.isActive)).toHaveLength(1);
    expect(after.find((v) => v.isActive)?.version).toBe(2);
  });

  it("qisqa matnni rad etadi va baza o'zgarmaydi", async () => {
    const before = await listSkillVersions(NAME);
    const result = await createSkillVersion({
      name: NAME,
      text: "juda qisqa",
      activate: true,
    });

    expect(result.ok).toBe(false);
    const after = await listSkillVersions(NAME);
    expect(after).toHaveLength(before.length);
  });

  it("mavjud bo'lmagan versiyani faollashtirmaydi", async () => {
    const result = await activateSkillVersion("mavjud-emas-id", "test");
    expect(result.ok).toBe(false);
  });

  it("audit log yozadi", async () => {
    const logs = await prisma.auditLog.findMany({
      where: { target: `skills/${NAME}` },
    });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.some((l) => l.action === "skill.create+activate")).toBe(true);
  });

  it("tozalash: test yozuvlari o'chiriladi", async () => {
    const deleted = await prisma.skill.deleteMany({ where: { name: NAME } });
    const logs = await prisma.auditLog.deleteMany({
      where: { target: `skills/${NAME}` },
    });
    expect(deleted.count).toBeGreaterThan(0);
    expect(logs.count).toBeGreaterThan(0);
  });
});

describe.skipIf(dbReady)("skill versioning (baza yo'q)", () => {
  it("baza ishlamaganda testlar o'tkazib yuboriladi", () => {
    expect(dbReady).toBe(false);
  });
});

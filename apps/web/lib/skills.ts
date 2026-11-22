import { prisma } from "@autochannel/db";
import { validateSkillText } from "./skill-text";

/** Standart skill nomi — seed ham shu nom bilan yaratadi. */
export const SKILL_NAME = "reels-asosiy";

export interface SkillVersionView {
  id: string;
  name: string;
  version: number;
  isActive: boolean;
  chars: number;
  /** Ro'yxatda ko'rsatish uchun qisqa boshlanish. */
  head: string;
  createdAt: string;
  updatedAt: string;
}

function toView(row: {
  id: string;
  name: string;
  text: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): SkillVersionView {
  return {
    id: row.id,
    name: row.name,
    version: row.version,
    isActive: row.isActive,
    chars: row.text.length,
    head: row.text.split("\n").find((line) => line.trim().length > 0)?.slice(0, 120) ?? "",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listSkillVersions(name = SKILL_NAME): Promise<SkillVersionView[]> {
  const rows = await prisma.skill.findMany({
    where: { name },
    orderBy: { version: "desc" },
  });
  return rows.map(toView);
}

export async function getActiveSkill(name = SKILL_NAME): Promise<SkillVersionView | null> {
  const row = await prisma.skill.findFirst({ where: { name, isActive: true } });
  return row ? toView(row) : null;
}

export async function getSkillText(id: string): Promise<string | null> {
  const row = await prisma.skill.findUnique({ where: { id }, select: { text: true } });
  return row?.text ?? null;
}

export type SkillActionResult =
  | { ok: true; message: string; version?: number }
  | { ok: false; message: string };

/** Yangi versiya yaratadi (mavjudlari o'chirilmaydi — tarix saqlanadi). */
export async function createSkillVersion(input: {
  name?: string;
  text: string;
  activate: boolean;
  actor?: string;
}): Promise<SkillActionResult> {
  const name = input.name?.trim() || SKILL_NAME;
  const validation = validateSkillText(input.text);
  if (!validation.ok) return { ok: false, message: validation.message };

  try {
    const created = await prisma.$transaction(async (tx) => {
      const last = await tx.skill.findFirst({
        where: { name },
        orderBy: { version: "desc" },
        select: { version: true },
      });
      const version = (last?.version ?? 0) + 1;

      if (input.activate) {
        await tx.skill.updateMany({ where: { name }, data: { isActive: false } });
      }

      return tx.skill.create({
        data: { name, text: validation.text, version, isActive: input.activate },
      });
    });

    await prisma.auditLog.create({
      data: {
        actor: input.actor ?? "admin",
        action: input.activate ? "skill.create+activate" : "skill.create",
        target: `skills/${name}`,
        details: { version: created.version, chars: created.text.length },
      },
    });

    return {
      ok: true,
      version: created.version,
      message: input.activate
        ? `v${created.version} saqlandi va faollashtirildi.`
        : `v${created.version} saqlandi (faol versiya o'zgarmadi).`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Saqlashda xato: ${message.slice(0, 200)}` };
  }
}

/** Versiyani faol qiladi (aynan bir vaqtda bitta faol versiya). */
export async function activateSkillVersion(
  id: string,
  actor = "admin",
): Promise<SkillActionResult> {
  const row = await prisma.skill.findUnique({ where: { id } });
  if (!row) return { ok: false, message: "Versiya topilmadi." };
  if (row.isActive) return { ok: true, message: `v${row.version} allaqachon faol.` };

  try {
    await prisma.$transaction([
      prisma.skill.updateMany({ where: { name: row.name }, data: { isActive: false } }),
      prisma.skill.update({ where: { id }, data: { isActive: true } }),
    ]);

    await prisma.auditLog.create({
      data: {
        actor,
        action: "skill.activate",
        target: `skills/${row.name}`,
        details: { version: row.version },
      },
    });

    return { ok: true, message: `v${row.version} faollashtirildi.` };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Faollashtirishda xato: ${message.slice(0, 200)}` };
  }
}

/** Faol skill matnini oladi (ssenariy generatori uchun kirish nuqtasi). */
export async function getActiveSkillText(name = SKILL_NAME): Promise<string | null> {
  const row = await prisma.skill.findFirst({
    where: { name, isActive: true },
    select: { text: true },
  });
  return row?.text ?? null;
}

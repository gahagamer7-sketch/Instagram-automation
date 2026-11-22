// Dev bazasini boshlang'ich ma'lumot bilan to'ldiradi: app_settings yagona
// qatori va faol skill (packages/core/skills/reels-asosiy.md).
//
// Ishga tushirish: pnpm db:seed

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const here = dirname(fileURLToPath(import.meta.url));
const skillPath = resolve(here, "../../core/skills/reels-asosiy.md");
const prisma = new PrismaClient();

async function main() {
  const settingsCount = await prisma.appSetting.count();
  if (settingsCount === 0) {
    await prisma.appSetting.create({ data: {} });
    console.log("[seed] app_settings: yaratildi");
  } else {
    console.log(`[seed] app_settings: mavjud (${settingsCount})`);
  }

  const activeSkill = await prisma.skill.findFirst({ where: { isActive: true } });
  if (activeSkill) {
    console.log(`[seed] skills: faol skill mavjud — "${activeSkill.name}" v${activeSkill.version}`);
  } else {
    const text = readFileSync(skillPath, "utf8");
    const skill = await prisma.skill.create({
      data: { name: "reels-asosiy", text, version: 1, isActive: true },
    });
    console.log(`[seed] skills: "${skill.name}" v${skill.version} yaratildi (${text.length} belgi)`);
  }
}

main()
  .catch((err) => {
    console.error("[seed] xato:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

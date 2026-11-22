// Vitest setup: lokal dev muhit o'zgaruvchilarini apps/web/.env.local dan yuklaydi.
// Integratsiya testlari haqiqiy bazaga ulanishi uchun kerak.
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, "apps/web/.env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = (rawValue ?? "").trim().replace(/^["']|["']$/g, "");
  }
}

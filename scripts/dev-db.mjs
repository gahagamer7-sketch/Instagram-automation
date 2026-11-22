// Mahalliy dev bazasi: PGlite (WASM PostgreSQL) ustida PostgreSQL wire-protokol
// serveri. Neon/Supabase kaliti bo'lmasa ham butun panelni ishlatish uchun.
//
// Ishga tushirish: pnpm db:dev
// Ulanish satri:    postgresql://postgres:postgres@127.0.0.1:5432/autochannel
//
// Ma'lumotlar `.dev/pgdata` papkasida saqlanadi (git'ga tushmaydi).
// Bu faqat lokal dev uchun: ishlab chiqarishda DATABASE_URL Neon/Supabase'ga
// ko'rsatiladi va kod o'zgarmaydi.

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.PGLITE_DATA_DIR ?? resolve(root, ".dev/pgdata");
const port = Number(process.env.PGLITE_PORT ?? 5432);
const host = process.env.PGLITE_HOST ?? "127.0.0.1";

mkdirSync(dataDir, { recursive: true });

const db = await PGlite.create({ dataDir });

const version = await db.query("select version() as v");
console.log(`[db] ${version.rows[0]?.v ?? "PGlite"} (${dataDir})`);

const server = new PGLiteSocketServer({ db, host, port, maxConnections: 10 });

server.addEventListener("listening", () => {
  console.log(`[db] tayyor: postgresql://postgres:postgres@${host}:${port}/autochannel`);
});

server.addEventListener("error", (event) => {
  console.error("[db] server xatosi:", event);
});

await server.start();

let stopping = false;
async function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  console.log(`[db] ${signal} — to'xtatilmoqda...`);
  try {
    await server.stop();
    await db.close();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

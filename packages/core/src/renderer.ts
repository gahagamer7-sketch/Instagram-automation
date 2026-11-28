// FFmpeg orqali 1080x1920 (9:16) vertikal Reels video montaji va subtitr integratsiyasi — TZ 4.4.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getAnimationStyle, type AnimationStyleId } from "./animation-styles";
import type { SceneCue } from "./script-engine";

export interface RenderOptions {
  audioPath: string;
  shotList: SceneCue[];
  channelName: string;
  styleId?: AnimationStyleId;
  outputDir: string;
  durationSec?: number;
  backgroundMedia?: {
    type: "video" | "image";
    path: string;
  };
}

export interface RenderResult {
  videoPath: string;
  coverPath: string;
  durationSec: number;
}

/**
 * FFmpeg binariy yo'lini aniqlaydi (env -> ffmpeg-static -> tizim PATH).
 */
export function resolveFfmpegPath(): string {
  const envPath = process.env.FFMPEG_PATH;
  if (envPath && existsSync(/*turbopackIgnore: true*/ envPath)) {
    return envPath;
  }

  try {
    const req = createRequire(import.meta.url);
    const staticPath = req("ffmpeg-static") as string | null;
    if (staticPath && existsSync(/*turbopackIgnore: true*/ staticPath)) {
      return staticPath;
    }
  } catch {
    // Zaxira qidiruvga o'tamiz
  }

  const binName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const localModuleBin = join(process.cwd(), "node_modules", "ffmpeg-static", binName);
  if (existsSync(/*turbopackIgnore: true*/ localModuleBin)) {
    return localModuleBin;
  }

  return "ffmpeg";
}

function resolveFontsDir(): string | null {
  const here = dirname(fileURLToPath(import.meta.url));
  const bundled = join(here, "..", "fonts");
  if (existsSync(/*turbopackIgnore: true*/ join(bundled, "DejaVuSans-Bold.ttf"))) {
    return bundled;
  }
  const cwdFonts = join(process.cwd(), "packages", "core", "fonts");
  if (existsSync(/*turbopackIgnore: true*/ join(cwdFonts, "DejaVuSans-Bold.ttf"))) {
    return cwdFonts;
  }
  return null;
}

function escapeFfmpegFilterPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "'\\''");
}

function runFfmpeg(ffmpegBin: string, args: string[], errorPrefix: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(ffmpegBin, args);
    let errOutput = "";

    proc.stderr.on("data", (d) => (errOutput += d.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${errorPrefix} (${code}): ${errOutput.slice(-600)}`));
    });
    proc.on("error", (err) => reject(err));
  });
}

function formatAssTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);

  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${h}:${pad(m)}:${pad(s)}.${pad(cs, 2)}`;
}

/**
 * Vaqt oraliqlarini (masalan: "0-3s", "3-15s") soniyalar shaklida parslaydi.
 */
function parseTimeRange(
  timeRange: string,
  fallbackStart: number,
  fallbackDuration: number,
): { start: number; end: number } {
  const match = timeRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (match && match[1] && match[2]) {
    const start = parseFloat(match[1]);
    const end = parseFloat(match[2]);
    if (end > start) return { start, end };
  }
  return { start: fallbackStart, end: fallbackStart + fallbackDuration };
}

/**
 * `*SO'Z*` ko'rinishidagi urg'u belgilarini ASS rang tegiga aylantiradi.
 */
function formatAssHighlightText(raw: string, highlightAssHex: string): string {
  const clean = raw.replace(/\r?\n/g, "\\N").slice(0, 140);
  return clean.replace(/\*([^*]+)\*/g, `{\\c${highlightAssHex}&}$1{\\c}`);
}

/**
 * Shot list, brend va tanlangan animatsiya uslubidan ASS subtitr faylini hosil qiladi.
 */
export function buildAssSubtitles(
  shotList: SceneCue[],
  channelName: string,
  totalDuration: number,
  styleId?: AnimationStyleId,
): string {
  const handle = `@${channelName.toLowerCase().replace(/\s+/g, "")}`;
  const totalFormatted = formatAssTime(totalDuration);
  const styleProfile = getAnimationStyle(styleId);
  const rc = styleProfile.renderConfig;

  const header = `[Script Info]
Title: AutoChannel Subtitles (${styleProfile.name})
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: BrandHeader,${rc.fontName},34,${rc.highlightAssHex},&H000000FF,${rc.outlineAssHex},&H90000000,-1,0,0,0,100,100,0,0,1,3,1,8,60,60,180,1
Style: Hook,${rc.fontName},62,${rc.primaryAssHex},&H000000FF,${rc.outlineAssHex},&H90000000,-1,0,0,0,100,100,0,0,1,4,2,5,90,90,100,1
Style: Body,${rc.fontName},52,${rc.primaryAssHex},&H000000FF,${rc.outlineAssHex},&H90000000,-1,0,0,0,100,100,0,0,1,4,2,5,90,90,100,1
Style: CTA,${rc.fontName},56,${rc.highlightAssHex},&H000000FF,${rc.outlineAssHex},&H90000000,-1,0,0,0,100,100,0,0,1,4,2,5,90,90,100,1
Style: BrandFooter,${rc.fontName},30,&H00CBD5E1,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,1,2,60,60,170,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,${totalFormatted},BrandHeader,,0,0,0,,${handle} • ${rc.headerLabel}
Dialogue: 0,0:00:00.00,${totalFormatted},BrandFooter,,0,0,0,,1080×1920 AI Studio
`;

  let currentStart = 0;
  const defaultStep = Math.max(2.5, totalDuration / (shotList.length || 1));

  const events = shotList.map((cue) => {
    const { start, end } = parseTimeRange(cue.timeRange, currentStart, defaultStep);
    currentStart = end;

    const style = cue.type === "hook" ? "Hook" : cue.type === "cta" ? "CTA" : "Body";
    const text = formatAssHighlightText(cue.screenText || cue.spokenText, rc.highlightAssHex);

    const startStr = formatAssTime(start);
    const endStr = formatAssTime(Math.min(totalDuration, end));

    return `Dialogue: 0,${startStr},${endStr},${style},,0,0,0,,${text}`;
  });

  return header + events.join("\n") + "\n";
}

async function readWavDurationSec(filePath: string): Promise<number | null> {
  try {
    const buf = await readFile(filePath);
    if (
      buf.length >= 44 &&
      buf.subarray(0, 4).toString("ascii") === "RIFF" &&
      buf.subarray(8, 12).toString("ascii") === "WAVE"
    ) {
      const byteRate = buf.readUInt32LE(28);
      if (byteRate > 0) {
        return (buf.length - 44) / byteRate;
      }
    }
  } catch {
    // WAV o'qishda xatolik bo'lsa ffprobe fallback ishlaydi
  }
  return null;
}

/**
 * Audio faylning aniq davomiyligini aniqlaydi (WAV sarlavhasi -> ffprobe -> 30s).
 */
export async function getMediaDuration(filePath: string): Promise<number> {
  const wavDuration = await readWavDurationSec(filePath);
  if (wavDuration && wavDuration > 0) {
    return wavDuration;
  }

  return new Promise((resolve) => {
    const proc = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    let output = "";
    proc.stdout.on("data", (data) => (output += data.toString()));
    proc.on("close", (code) => {
      if (code === 0 && output.trim()) {
        const val = parseFloat(output.trim());
        if (!isNaN(val) && val > 0) return resolve(val);
      }
      resolve(30); // Standart fallback: 30s
    });
    proc.on("error", () => resolve(30));
  });
}

/**
 * 1080x1920 (9:16) vertikal Reels videosi va muqova rasmini render qiladi.
 */
export async function renderReelsVideo(options: RenderOptions): Promise<RenderResult> {
  const { audioPath, shotList, channelName, styleId, outputDir } = options;
  const styleProfile = getAnimationStyle(styleId);
  const ffmpegBin = resolveFfmpegPath();

  await mkdir(outputDir, { recursive: true });

  const duration = options.durationSec || (await getMediaDuration(audioPath));
  const roundedDuration = Math.max(5, Math.ceil(duration));

  // 1. Tanlangan uslub asosida ASS subtitr faylini yaratish
  const assContent = buildAssSubtitles(shotList, channelName, roundedDuration, styleId);
  const assPath = join(outputDir, "subtitles.ass");
  await writeFile(assPath, assContent, "utf8");

  const videoPath = join(outputDir, "video.mp4");
  const coverPath = join(outputDir, "cover.jpg");

  // 2. FFmpeg bilan video yig'ish (Background + Audio + Subtitrlar)
  const escapedAssPath = escapeFfmpegFilterPath(assPath);
  const fontsDir = resolveFontsDir();
  const assFilter = fontsDir
    ? `ass='${escapedAssPath}':fontsdir='${escapeFfmpegFilterPath(fontsDir)}'`
    : `ass='${escapedAssPath}'`;

  const inputArgs: string[] = [];
  let baseVideoFilter = "vignette=PI/4";

  if (options.backgroundMedia) {
    const bgPath = options.backgroundMedia.path.replace(/\\/g, "/");
    if (options.backgroundMedia.type === "video") {
      inputArgs.push("-stream_loop", "-1", "-i", bgPath);
    } else {
      inputArgs.push("-loop", "1", "-i", bgPath);
    }
    baseVideoFilter =
      "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,vignette=PI/5";
  } else {
    inputArgs.push(
      "-f",
      "lavfi",
      "-i",
      `color=c=${styleProfile.renderConfig.bgHex}:s=1080x1920:r=30:d=${roundedDuration}`,
    );
  }

  const buildEncodeArgs = (vf: string) => [
    "-y",
    ...inputArgs,
    "-i",
    audioPath,
    "-vf",
    vf,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-af",
    "loudnorm=I=-14:LRA=11:TP=-1.5", // TZ 4.5: LUFS -14 ovoz balandligi me'yori
    "-t",
    String(roundedDuration),
    videoPath,
  ];

  try {
    await runFfmpeg(ffmpegBin, buildEncodeArgs(`${baseVideoFilter},${assFilter}`), "FFmpeg xatosi");
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : "";
    const isSubtitleFilterIssue =
      msg.includes("no such filter") ||
      msg.includes("fontconfig") ||
      msg.includes("libass") ||
      msg.includes("ass");

    if (!isSubtitleFilterIssue) {
      throw err;
    }

    console.warn("[renderer] ASS subtitr filtri ishlamadi, subtitrsiz zaxira render bajarilmoqda.");
    await runFfmpeg(ffmpegBin, buildEncodeArgs(baseVideoFilter), "FFmpeg zaxira xatosi");
  }

  // 3. Muqova rasmini (1080x1920 JPEG) videoning 1-soniyasidan ajratib olish
  const coverArgs = [
    "-y",
    "-ss",
    "00:00:01.000",
    "-i",
    videoPath,
    "-vframes",
    "1",
    "-q:v",
    "2",
    coverPath,
  ];

  await runFfmpeg(ffmpegBin, coverArgs, "Muqova ajratishda FFmpeg xatosi");

  return {
    videoPath,
    coverPath,
    durationSec: roundedDuration,
  };
}

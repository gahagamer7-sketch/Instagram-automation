// FFmpeg orqali 1080x1920 (9:16) Reels video montaji va subtitr integratsiyasi — TZ 4.4.
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { SceneCue } from "./script-engine";

export interface RenderOptions {
  audioPath: string;
  shotList: SceneCue[];
  channelName: string;
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
function parseTimeRange(timeRange: string, fallbackStart: number, fallbackDuration: number): { start: number; end: number } {
  const match = timeRange.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (match && match[1] && match[2]) {
    const start = parseFloat(match[1]);
    const end = parseFloat(match[2]);
    if (end > start) return { start, end };
  }
  return { start: fallbackStart, end: fallbackStart + fallbackDuration };
}

/**
 * Shot list va brend elementlaridan professional ASS subtitr faylini hosil qiladi.
 */
export function buildAssSubtitles(
  shotList: SceneCue[],
  channelName: string,
  totalDuration: number,
): string {
  const handle = `@${channelName.toLowerCase().replace(/\s+/g, "")}`;
  const totalFormatted = formatAssTime(totalDuration);

  const header = `[Script Info]
Title: AutoChannel Subtitles
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: BrandHeader,Arial,36,&H0022D3EE,&H000000FF,&H000B1220,&H90000000,-1,0,0,0,100,100,0,0,1,3,1,8,60,60,180,1
Style: Hook,Arial,60,&H00FFFFFF,&H000000FF,&H001D4ED8,&H90000000,-1,0,0,0,100,100,0,0,1,4,2,5,90,90,100,1
Style: Body,Arial,50,&H00E6EDF7,&H000000FF,&H000F172A,&H90000000,-1,0,0,0,100,100,0,0,1,4,2,5,90,90,100,1
Style: CTA,Arial,54,&H0022D3EE,&H000000FF,&H001E3A8A,&H90000000,-1,0,0,0,100,100,0,0,1,4,2,5,90,90,100,1
Style: BrandFooter,Arial,34,&H008EA0BF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,1,2,60,60,170,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,${totalFormatted},BrandHeader,,0,0,0,,${handle}
Dialogue: 0,0:00:00.00,${totalFormatted},BrandFooter,,0,0,0,,Obuna bo'ling • Saqlab qo'ying
`;

  let currentStart = 0;
  const defaultStep = Math.max(3, totalDuration / (shotList.length || 1));

  const events = shotList.map((cue, idx) => {
    const { start, end } = parseTimeRange(cue.timeRange, currentStart, defaultStep);
    currentStart = end;

    const style = cue.type === "hook" ? "Hook" : cue.type === "cta" ? "CTA" : "Body";
    const text = (cue.screenText || cue.spokenText)
      .replace(/\r?\n/g, "\\N")
      .slice(0, 140);

    const startStr = formatAssTime(start);
    const endStr = formatAssTime(Math.min(totalDuration, end));

    return `Dialogue: 0,${startStr},${endStr},${style},,0,0,0,,${text}`;
  });

  return header + events.join("\n") + "\n";
}

/**
 * FFmpeg yordamida audio faylning aniq davomiyligini aniqlaydi.
 */
export async function getMediaDuration(filePath: string): Promise<number> {
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
  const { audioPath, shotList, channelName, outputDir } = options;

  await mkdir(outputDir, { recursive: true });

  const duration = options.durationSec || (await getMediaDuration(audioPath));
  const roundedDuration = Math.max(5, Math.ceil(duration));

  // 1. ASS subtitr faylini yaratish
  const assContent = buildAssSubtitles(shotList, channelName, roundedDuration);
  const assPath = join(outputDir, "subtitles.ass");
  await writeFile(assPath, assContent, "utf8");

  const videoPath = join(outputDir, "video.mp4");
  const coverPath = join(outputDir, "cover.jpg");

  // 2. FFmpeg bilan video yig'ish (Background + Audio + Subtitrlar)
  // Subtitr fayli yo'lini FFmpeg filtri uchun moslash (Windows backslash va probellarni to'g'irlash)
  const escapedAssPath = assPath
    .replace(/\\/g, "/")
    .replace(/:/g, "\\:")
    .replace(/'/g, "'\\''");

  const inputArgs: string[] = [];
  let videoFilter = `ass='${escapedAssPath}'`;

  if (options.backgroundMedia) {
    const bgPath = options.backgroundMedia.path.replace(/\\/g, "/");
    if (options.backgroundMedia.type === "video") {
      inputArgs.push("-stream_loop", "-1", "-i", bgPath);
    } else {
      inputArgs.push("-loop", "1", "-i", bgPath);
    }
    videoFilter = `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,ass='${escapedAssPath}'`;
  } else {
    inputArgs.push("-f", "lavfi", "-i", `color=c=0x0B1220:s=1080x1920:r=30:d=${roundedDuration}`);
  }

  const ffmpegArgs = [
    "-y",
    ...inputArgs,
    "-i",
    audioPath,
    "-vf",
    videoFilter,
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

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("ffmpeg", ffmpegArgs);
    let errOutput = "";

    proc.stderr.on("data", (d) => (errOutput += d.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg xatosi (${code}): ${errOutput.slice(-500)}`));
    });
    proc.on("error", (err) => reject(err));
  });

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

  await new Promise<void>((resolve, reject) => {
    const proc = spawn("ffmpeg", coverArgs);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Muqova ajratishda FFmpeg xatosi (${code})`));
    });
    proc.on("error", (err) => reject(err));
  });

  return {
    videoPath,
    coverPath,
    durationSec: roundedDuration,
  };
}


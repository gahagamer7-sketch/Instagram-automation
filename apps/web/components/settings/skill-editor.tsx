"use client";

import { useActionState, useRef, useState } from "react";
import { FlaskConical, LoaderCircle, Save, Upload } from "lucide-react";
import { saveSkillAction, testSkillAction } from "@/app/settings/skill/actions";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { missingSkillSections, SKILL_MAX_CHARS, SKILL_MIN_CHARS } from "@/lib/skill-text";

export function SkillEditor({
  initialText,
  activeVersion,
  activeId,
}: {
  initialText: string;
  activeVersion: number | null;
  /** Faol versiya almashganda muharrir matni shu versiyaga sinxronlanadi. */
  activeId: string | null;
}) {
  const [text, setText] = useState(initialText);
  const [syncedId, setSyncedId] = useState(activeId);

  // Props o'zgarganda holatni render paytida moslashtirish (React tavsiya etgan usul):
  // remount bo'lmagani uchun forma natijasi xabari saqlanib qoladi.
  if (activeId !== syncedId) {
    setSyncedId(activeId);
    setText(initialText);
  }
  const [fileName, setFileName] = useState<string | null>(null);
  const [saveState, saveAction, saving] = useActionState(saveSkillAction, null);
  const [testState, testAction, testing] = useActionState(testSkillAction, null);
  const fileRef = useRef<HTMLInputElement>(null);

  const missing = missingSkillSections(text);
  const tooShort = text.trim().length < SKILL_MIN_CHARS;
  const tooLong = text.length > SKILL_MAX_CHARS;

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 200_000) {
      setFileName(`"${file.name}" juda katta (200 KB dan oshmasin)`);
      return;
    }
    const content = await file.text();
    setText(content);
    setFileName(file.name);
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Skill matni</h2>
          <p className="mt-1 text-sm text-muted">
            Har bosqichda Gemini&apos;ga system instruction sifatida beriladi.
            Tizim qoidalari (QA, taqiqlar, limitlar) bu matndan ustun turadi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeVersion ? (
            <Badge tone="success">Faol: v{activeVersion}</Badge>
          ) : (
            <Badge tone="warning">Faol versiya yo&apos;q</Badge>
          )}
          <Badge tone={tooShort || tooLong ? "danger" : "neutral"}>
            <span className="nums">{text.length}</span> belgi
          </Badge>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-4 w-4" aria-hidden />
          .md fayldan yuklash
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          className="sr-only"
          id="skill-file"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        {fileName && <span className="text-xs text-muted">{fileName}</span>}
      </div>

      <form action={saveAction} className="mt-4 space-y-4">
        <input type="hidden" name="name" value="reels-asosiy" />
        <div>
          <label htmlFor="skill-text" className="sr-only">
            Skill matni
          </label>
          <Textarea
            id="skill-text"
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="min-h-[26rem] font-mono text-[13px] leading-relaxed"
            aria-describedby="skill-hint"
          />
          <p id="skill-hint" className="mt-2 text-xs text-muted">
            Kamida {SKILL_MIN_CHARS}, ko&apos;pi {SKILL_MAX_CHARS} belgi.
            {missing.length > 0 && (
              <span className="text-warning">
                {" "}
                Yetishmayotgan bo&apos;limlar: {missing.join(", ")}.
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="activate"
              defaultChecked
              className="h-4 w-4 rounded border-border accent-[var(--primary)]"
            />
            Saqlagandan keyin faollashtirish
          </label>

          <Button type="submit" variant="gradient" disabled={saving || tooShort || tooLong}>
            <Save className="h-4 w-4" aria-hidden />
            {saving ? "Saqlanmoqda..." : "Yangi versiya sifatida saqlash"}
          </Button>
        </div>

        {saveState && (
          <Alert tone={saveState.ok ? "success" : "danger"}>{saveState.message}</Alert>
        )}
      </form>

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <FlaskConical className="h-4 w-4 text-accent-cyan" aria-hidden />
          Sinab ko&apos;rish
        </h3>
        <p className="mt-1 text-sm text-muted">
          Muharrirdagi matn bilan haqiqiy Gemini chaqiruvi bajariladi va namuna
          ssenariy qaytariladi. Baza hisoblanmaydi, lekin tokenni sarflaydi.
        </p>

        <form action={testAction} className="mt-4 space-y-4">
          <input type="hidden" name="text" value={text} />
          <Field id="skill-topic" label="Sinov mavzusi" hint="Bo'sh qoldirsangiz — standart mavzu">
            <Input
              id="skill-topic"
              name="topic"
              placeholder="Masalan: ish suhbatida birinchi taassurot"
              maxLength={160}
            />
          </Field>

          <Button type="submit" variant="secondary" disabled={testing || tooShort || tooLong}>
            {testing ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <FlaskConical className="h-4 w-4" aria-hidden />
            )}
            {testing ? "AI yozmoqda..." : "Ssenariy yaratib ko'rish"}
          </Button>

          {testState && (
            <Alert tone={testState.ok ? "success" : "danger"}>{testState.message}</Alert>
          )}

          {testState?.output && (
            <div>
              <p className="mb-2 text-xs text-muted">
                Namuna natija{testState.parsed ? " (JSON)" : " (xom matn)"}
              </p>
              <pre className="max-h-96 overflow-auto rounded-xl border border-border bg-surface-2 p-3 text-xs leading-relaxed">
                {testState.output}
              </pre>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

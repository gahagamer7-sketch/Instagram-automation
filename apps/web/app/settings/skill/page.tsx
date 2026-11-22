import { Suspense } from "react";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/card";
import { SettingsNav } from "@/components/settings/settings-nav";
import { SkillEditor } from "@/components/settings/skill-editor";
import { SkillVersions } from "@/components/settings/skill-versions";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { getActiveSkill, getSkillText, listSkillVersions } from "@/lib/skills";

export const metadata = {
  title: "Skill — AutoChannel",
};

export default function SkillPage() {
  return (
    <>
      <PageHeader
        title="Skill — AI yo'riqnomasi"
        description="Video yaratish yo'riqnomasi: uslub, Reels tuzilmasi, vizual qoidalar, taqiqlar va namunalar. Ssenariy generatori shu matnga amal qiladi."
      />

      <SettingsNav />

      <div className="mb-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
        Skill — tavsiya. Tizim qoidalari (QA tekshiruvi, taqiqlar filtri, kunlik
        limit) skill matnidan ustun turadi: skill nima desa ham, xavfli yoki
        limitdan oshgan kontent joylanmaydi.
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-[34rem]" />
            </div>
            <CardSkeleton lines={6} />
          </div>
        }
      >
        <SkillSection />
      </Suspense>
    </>
  );
}

async function SkillSection() {
  try {
    const [versions, active] = await Promise.all([
      listSkillVersions(),
      getActiveSkill(),
    ]);
    const activeText = active ? ((await getSkillText(active.id)) ?? "") : "";

    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SkillEditor
            initialText={activeText}
            activeVersion={active?.version ?? null}
            activeId={active?.id ?? null}
          />
        </div>
        <div>
          <SkillVersions versions={versions} />
        </div>
      </div>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <Alert tone="danger">
        Skill ma&apos;lumotlarini yuklab bo&apos;lmadi: {message.split("\n")[0]}.
        Baza ulanishini tekshiring.
      </Alert>
    );
  }
}

import { Suspense } from "react";
import { CardSkeleton } from "@/components/ui/skeleton";
import { VideoCreatorStudio } from "@/components/reels/video-creator-studio";
import { getActiveSkill, getSkillText } from "@/lib/skills";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Video Yaratish Studiyasi — AutoChannel",
  description: "G'oya va Skill asosida to'liq avtomatlashgan 1080x1920 video ishlab chiqarish.",
};

export default function CreateVideoPage() {
  return (
    <Suspense fallback={<CardSkeleton lines={10} />}>
      <StudioContent />
    </Suspense>
  );
}

async function StudioContent() {
  const [currentUser, activeSkill] = await Promise.all([
    getCurrentUser(),
    getActiveSkill(),
  ]);

  const activeSkillText = activeSkill ? ((await getSkillText(activeSkill.id)) ?? "") : "";
  const niche = currentUser?.channel?.niche || "Foydali Ma'lumotlar";

  return (
    <VideoCreatorStudio
      initialActiveSkill={activeSkillText}
      defaultNiche={niche}
    />
  );
}


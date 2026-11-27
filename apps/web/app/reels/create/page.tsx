import { Suspense } from "react";
import { CardSkeleton } from "@/components/ui/skeleton";
import { VideoCreatorStudio } from "@/components/reels/video-creator-studio";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "Video Yaratish Studiyasi — AutoChannel",
  description: "6 xil animatsiya uslubi asosida 1080×1920 Full HD video ishlab chiqarish.",
};

export default function CreateVideoPage() {
  return (
    <Suspense fallback={<CardSkeleton lines={10} />}>
      <StudioContent />
    </Suspense>
  );
}

async function StudioContent() {
  const currentUser = await getCurrentUser();
  const niche = currentUser?.channel?.niche || "Foydali Ma'lumotlar";

  return <VideoCreatorStudio defaultNiche={niche} />;
}

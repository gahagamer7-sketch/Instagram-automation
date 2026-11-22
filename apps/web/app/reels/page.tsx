import { Clapperboard } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function ReelsPage() {
  return (
    <PagePlaceholder
      icon={Clapperboard}
      title="Reels kutubxonasi"
      description="Barcha tayyorlangan videolar: 9:16 maket, holat, caption va ko'rsatkichlar."
      planned={[
        "videos jadvalidan grid ko'rinishi (9:16 kartalar)",
        "video preview, caption va hashtag tahriri",
        "QA hisoboti va qayta generatsiya qilish",
      ]}
    />
  );
}

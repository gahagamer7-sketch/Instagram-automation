import { Workflow } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function PipelinePage() {
  return (
    <PagePlaceholder
      icon={Workflow}
      title="Jonli pipeline"
      description="Har Reels'ning hozirgi bosqichi, animatsiyali progress va oxirgi loglar."
      planned={[
        "jobs jadvalidan navbatdagi ishlarni real vaqtda ko'rsatish",
        "bosqichlar bo'yicha animatsiyali progress (Framer Motion)",
        "xato bo'lgan job'ni qayta ishga tushirish tugmasi",
      ]}
    />
  );
}

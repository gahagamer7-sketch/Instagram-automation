import { CalendarDays } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function CalendarPage() {
  return (
    <PagePlaceholder
      icon={CalendarDays}
      title="Kontent kalendar"
      description="30 kunlik Reels rejasi, joylash soatlari va drag-and-drop bilan qayta tartiblash."
      planned={[
        "oy ko'rinishidagi kalendar, har kuni 1 Reels",
        "drag-and-drop bilan sanani o'zgartirish",
        "joylash soatlarini statistika asosida tanlash (UTC+5)",
      ]}
    />
  );
}

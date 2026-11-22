import { ChartColumn } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function AnalyticsPage() {
  return (
    <PagePlaceholder
      icon={ChartColumn}
      title="Statistika"
      description="Ko'rishlar, reach, saqlashlar, ulashishlar va haftalik hisobot."
      planned={[
        "Instagram Insights'dan 24 va 72 soatlik snapshotlar",
        "Recharts grafiklari: 7 kunlik dinamika, eng yaxshi Reels",
        "haftalik Telegram hisoboti va tavsiyalar",
      ]}
    />
  );
}

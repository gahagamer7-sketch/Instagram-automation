import { ListChecks } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function LogsPage() {
  return (
    <PagePlaceholder
      icon={ListChecks}
      title="Navbat va loglar"
      description="jobs jadvali, urinishlar, xatolar va audit loglari."
      planned={[
        "job navbati: holat, urinishlar soni, keyingi urinish vaqti",
        "xato matni va stack trace bilan batafsil ko'rinish",
        "audit log: kim, nima, qachon",
      ]}
    />
  );
}

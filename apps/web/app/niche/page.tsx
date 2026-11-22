import { Compass } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function NichePage() {
  return (
    <PagePlaceholder
      icon={Compass}
      title="Nisha tahlili"
      description="15–20 nomzod nisha, 5 mezonli ballash va 14 kunlik sinov natijalari."
      planned={[
        "Google Trends (UZ) va YouTube mostPopular signallarini yig'ish",
        "LLM bilan nomzodlar va 5 mezonli ballash",
        "14 kunlik sinov jadvali va g'olibni aniqlash",
      ]}
    />
  );
}

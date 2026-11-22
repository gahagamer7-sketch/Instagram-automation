import { Palette } from "lucide-react";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function BrandPage() {
  return (
    <PagePlaceholder
      icon={Palette}
      title="Brend studiyasi"
      description="Nom, bio, avatar va muqova varianti — bir marta yuklab olib akkauntga qo'yiladi."
      planned={[
        "10 nom varianti va bio generatori (150 belgigacha)",
        "avatar (1080x1080) va muqova (1080x1920) shablonlari",
        "Brand Kit: palitra, shrift, intro/outro",
      ]}
    />
  );
}

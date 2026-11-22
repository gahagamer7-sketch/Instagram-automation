import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { SettingsNav } from "@/components/settings/settings-nav";
import { ProviderCard } from "@/components/settings/provider-card";
import { listCredentials, type CredentialView } from "@/lib/credentials";
import { PROVIDERS } from "@/lib/providers";

export const metadata = {
  title: "Sozlamalar — AutoChannel",
};

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Sozlamalar"
        description="API kalitlar, xarajat limitlari va tizim ruxsatlari. Kalitlar serverda AES-256-GCM bilan shifrlanadi, brauzerga qaytarilmaydi va loglarga yozilmaydi."
      />

      <SettingsNav />

      <div className="mb-6 flex items-start gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
        <p>
          Kalitni kiritgandan keyin &quot;Ulanishni tekshirish&quot; tugmasini bosing — tizim
          haqiqiy so&apos;rov yuborib, javobni tekshiradi.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 lg:grid-cols-2">
            <CardSkeleton lines={4} />
            <CardSkeleton lines={4} />
            <CardSkeleton lines={3} />
          </div>
        }
      >
        <ProvidersSection />
      </Suspense>
    </>
  );
}

async function ProvidersSection() {
  let credentials: CredentialView[] = [];
  let dbError: string | null = null;

  try {
    credentials = await listCredentials();
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  }

  if (dbError) {
    return (
      <Alert tone="danger">
        Baza bilan aloqa yo&apos;q: {dbError.split("\n")[0]}. Kalitlarni saqlash uchun
        DATABASE_URL to&apos;g&apos;ri sozlanganini tekshiring.
      </Alert>
    );
  }

  const byProvider = new Map(credentials.map((c) => [c.provider, c]));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {PROVIDERS.map((meta) => (
        <ProviderCard key={meta.id} meta={meta} credential={byProvider.get(meta.id)} />
      ))}
    </div>
  );
}
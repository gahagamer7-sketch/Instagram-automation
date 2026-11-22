"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { saveKeyAction } from "@/app/settings/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function KeyForm({
  provider,
  keyLabel,
  configured,
}: {
  provider: string;
  keyLabel: string;
  configured: boolean;
}) {
  const [state, action, pending] = useActionState(saveKeyAction, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="provider" value={provider} />

      <Field
        id={`apiKey-${provider}`}
        label={keyLabel}
        hint="Kalit serverda AES-256-GCM bilan shifrlanadi; brauzerga faqat oxirgi 4 belgi qaytadi."
      >
        <Input
          id={`apiKey-${provider}`}
          name="apiKey"
          type="password"
          autoComplete="off"
          spellCheck={false}
          required
          minLength={8}
          placeholder={configured ? "Yangi kalit bilan almashtirish" : "Kalitni shu yerga qo'ying"}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id={`daily-${provider}`}
          label="Kunlik xarajat limiti"
          hint="Ixtiyoriy, AQSh dollari"
        >
          <Input
            id={`daily-${provider}`}
            name="dailyLimit"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
          />
        </Field>
        <Field
          id={`monthly-${provider}`}
          label="Oylik xarajat limiti"
          hint="Ixtiyoriy, AQSh dollari"
        >
          <Input
            id={`monthly-${provider}`}
            name="monthlyLimit"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant={configured ? "secondary" : "gradient"} disabled={pending}>
          <Save className="h-4 w-4" aria-hidden />
          {pending ? "Saqlanmoqda..." : configured ? "Kalitni almashtirish" : "Kalitni saqlash"}
        </Button>
      </div>

      {state && <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>}
    </form>
  );
}

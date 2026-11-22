"use client";

import { useActionState } from "react";
import { LoaderCircle, Plug } from "lucide-react";
import { testKeyAction } from "@/app/settings/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function TestButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(testKeyAction, null);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Plug className="h-4 w-4" aria-hidden />
        )}
        {pending ? "Tekshirilmoqda..." : "Ulanishni tekshirish"}
      </Button>
      {state && <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>}
    </form>
  );
}

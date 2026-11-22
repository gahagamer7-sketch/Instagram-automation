"use client";

import { useActionState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { activateSkillAction } from "@/app/settings/skill/actions";
import { Button } from "@/components/ui/button";

export function VersionActivateButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(activateSkillAction, null);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" variant="ghost" disabled={pending}>
        {pending ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Check className="h-3.5 w-3.5" aria-hidden />
        )}
        {pending ? "..." : "Faollashtirish"}
      </Button>
      {state && !state.ok && (
        <span className="text-xs text-danger" role="alert">
          {state.message}
        </span>
      )}
    </form>
  );
}

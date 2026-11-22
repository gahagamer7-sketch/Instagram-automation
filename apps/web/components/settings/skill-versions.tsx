import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { SkillVersionView } from "@/lib/skills";
import { VersionActivateButton } from "./version-activate-button";

export function SkillVersions({ versions }: { versions: SkillVersionView[] }) {
  return (
    <Card>
      <CardHeader
        title="Versiyalar tarixi"
        description="Har saqlash yangi versiya yaratadi — eskilari o'chmaydi."
        action={<History className="h-4 w-4 text-muted" aria-hidden />}
      />

      {versions.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Hali versiya yo&apos;q. Matnni yozib, saqlang.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {versions.map((version) => (
            <li
              key={version.id}
              className="rounded-xl border border-border bg-surface-2 px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  v{version.version}
                  {version.isActive && <Badge tone="success">Faol</Badge>}
                </span>
                <span className="nums text-xs text-muted">
                  {version.chars} belgi
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-muted" title={version.head}>
                {version.head || "—"}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="nums text-xs text-muted">
                  {formatDateTime(version.createdAt)}
                </span>
                {!version.isActive && <VersionActivateButton id={version.id} />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

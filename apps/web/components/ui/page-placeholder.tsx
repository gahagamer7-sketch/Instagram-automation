import type { ComponentType } from "react";
import { Badge } from "./badge";
import { PageHeader } from "./card";
import { EmptyState } from "./empty-state";

/** Hali ulanmagan sahifalar uchun izchil "keyingi bosqich" ko'rinishi. */
export function PagePlaceholder({
  title,
  description,
  icon,
  planned,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  planned: string[];
}) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={<Badge tone="warning">Keyingi bosqich</Badge>}
      />

      <EmptyState
        icon={icon}
        title="Bu bo'lim hali ulanmagan"
        description="Skelet tayyor: sahifa, navigatsiya va dizayn tizimi ishlaydi. Ma'lumot manbai keyingi sprintda qo'shiladi."
      />

      <div className="card mt-4 p-5">
        <h2 className="text-base font-semibold">Rejadagi ishlar</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {planned.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

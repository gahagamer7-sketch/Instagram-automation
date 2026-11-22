import { getCurrentUser } from "@/lib/session";

export async function UserBadge() {
  const current = await getCurrentUser();
  const user = current?.user;
  if (!user) return null;

  return (
    <div className="hidden sm:flex items-center gap-2 border-l border-border pl-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
        {user.name
          ? user.name.charAt(0).toUpperCase()
          : user.email
            ? user.email.charAt(0).toUpperCase()
            : "U"}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-semibold text-text max-w-[120px] truncate">
          {user.name || user.email}
        </span>
        <span className="text-[10px] text-muted leading-tight">
          {user.role === "admin" ? "Admin" : "Foydalanuvchi"}
        </span>
      </div>
    </div>
  );
}

export async function SidebarUserCard() {
  const current = await getCurrentUser();
  const user = current?.user;
  if (!user) return null;

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 p-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
        {user.name
          ? user.name.charAt(0).toUpperCase()
          : user.email
            ? user.email.charAt(0).toUpperCase()
            : "U"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-text">
          {user.name || user.email}
        </p>
        <p className="truncate text-[10px] text-muted">
          {user.role === "admin" ? "Administrator" : "Foydalanuvchi"}
        </p>
      </div>
    </div>
  );
}


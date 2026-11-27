import Link from "next/link";
import { KeyRound, Sparkles } from "lucide-react";
import { Badge, StatusDot } from "@/components/ui/badge";
import { getSystemSnapshot } from "@/lib/system";
import { getCurrentUser } from "@/lib/session";

/**
 * Topbar'dagi foydalanuvchining AI Studiya tayyorlik holati.
 */
export async function SystemStatus() {
  const currentUser = await getCurrentUser();
  const snapshot = await getSystemSnapshot(currentUser?.user?.id);

  if (!snapshot.ok) {
    return (
      <div className="flex items-center gap-2">
        <Badge tone="danger" className="max-w-56 truncate">
          <StatusDot tone="danger" />
          <span className="truncate" title={snapshot.error}>
            Baza ulanmagan
          </span>
        </Badge>
      </div>
    );
  }

  const aiReady = snapshot.connectedProviders.includes("gemini");

  return (
    <div className="flex items-center gap-2">
      <Badge tone={aiReady ? "success" : "warning"} className="max-w-56 truncate">
        <StatusDot tone={aiReady ? "success" : "warning"} pulse={aiReady} />
        <span className="truncate">
          {aiReady ? "AI Studiya tayyor" : "API kalit kerak"}
        </span>
      </Badge>

      {!aiReady ? (
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition"
        >
          <KeyRound className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Kalit kiritish</span>
        </Link>
      ) : (
        <Link
          href="/reels/create"
          className="inline-flex items-center gap-1.5 rounded-xl gradient-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:brightness-110 transition"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Video yaratish</span>
        </Link>
      )}
    </div>
  );
}

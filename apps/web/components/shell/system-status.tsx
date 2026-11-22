import { Pause, Play } from "lucide-react";
import { toggleSystem } from "@/app/actions/system";
import { Badge, StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSystemSnapshot } from "@/lib/system";

/**
 * Tizim holati + "To'xtatish" tugmasi (TZ 4.5, 4.12).
 * Baza javob bermasa ham panel yiqilmaydi — holat "ulanmagan" bo'lib qoladi.
 */
export async function SystemStatus() {
  const snapshot = await getSystemSnapshot();

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
  const running = !snapshot.paused && aiReady;

  return (
    <div className="flex items-center gap-2">
      <Badge
        tone={snapshot.paused ? "danger" : running ? "success" : "warning"}
        className="max-w-56 truncate"
      >
        <StatusDot
          tone={snapshot.paused ? "danger" : running ? "success" : "warning"}
          pulse={running}
        />
        <span className="truncate">
          {snapshot.paused
            ? "To'xtatilgan"
            : running
              ? "Ishlayapti"
              : "Sozlash kerak"}
        </span>
      </Badge>

      <form action={toggleSystem}>
        <Button
          type="submit"
          size="sm"
          variant={snapshot.paused ? "primary" : "danger"}
          title={
            snapshot.paused
              ? "Tizimni qayta ishga tushirish"
              : "Tizimni darhol to'xtatish"
          }
        >
          {snapshot.paused ? (
            <>
              <Play className="h-4 w-4" aria-hidden />
              Davom ettirish
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" aria-hidden />
              To&apos;xtatish
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

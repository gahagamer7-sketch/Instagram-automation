"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  RefreshCw,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Loader2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, StatusDot } from "@/components/ui/badge";
import { InstagramConnectModal } from "@/components/onboarding/instagram-connect-modal";
import { disconnectInstagramAction } from "@/app/onboarding/actions";
import { formatDateTime } from "@/lib/format";

export interface SerializedChannel {
  id: string;
  name: string;
  handle: string | null;
  igUserId: string | null;
  profilePictureUrl?: string | null;
  accountType?: string | null;
  status: string;
  createdAt: string;
}

interface ConnectedAccountsCardProps {
  channels: SerializedChannel[];
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function ConnectedAccountsCard({ channels }: ConnectedAccountsCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reconnectingChannel, setReconnectingChannel] = useState<SerializedChannel | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "danger"; message: string } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const connectedChannels = channels.filter(
    (c) => Boolean(c.igUserId || c.handle) && c.status === "active",
  );

  const handleDisconnect = async (channelId: string, handle?: string | null) => {
    if (!confirm(`Haqiqatan ham @${handle || "akkaunt"}ni uzmoqchimisiz?`)) {
      return;
    }

    setDisconnectingId(channelId);
    setFeedback(null);
    try {
      const res = await disconnectInstagramAction(channelId);
      if (res.ok) {
        setFeedback({
          tone: "success",
          message: `@${handle || "Akkaunt"} muvaffaqiyatli uzildi.`,
        });
        startTransition(() => {
          router.refresh();
        });
      } else {
        setFeedback({
          tone: "danger",
          message: res.message || "Akkauntni uzishda xatolik yuz berdi.",
        });
      }
    } catch (err) {
      setFeedback({
        tone: "danger",
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleConnectSuccess = (data: { handle: string }) => {
    setIsModalOpen(false);
    setReconnectingChannel(null);
    setFeedback({
      tone: "success",
      message: `Instagram akkaunti (@${data.handle}) muvaffaqiyatli ulandi!`,
    });
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-md p-2.5">
            <InstagramIcon className="w-full h-full text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-text">
                Ulangan Instagram akkauntlari
              </h2>
              <Badge tone="primary">
                {connectedChannels.length} {connectedChannels.length === 1 ? "akkaunt" : "akkauntlar"}
              </Badge>
            </div>
            <p className="text-xs text-muted mt-0.5">
              OpusClip uslubidagi ko&apos;p akkauntli ijtimoiy tarmoq integratsiyasi (Meta Graph API)
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="gradient"
          size="sm"
          onClick={() => {
            setReconnectingChannel(null);
            setIsModalOpen(true);
          }}
          className="gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Connect Instagram</span>
        </Button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`mt-4 rounded-xl p-3 text-xs flex items-center justify-between gap-2 ${
            feedback.tone === "success"
              ? "border border-success/30 bg-success/10 text-success"
              : "border border-danger/30 bg-danger/10 text-danger"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-80"
          >
            Yopish
          </button>
        </div>
      )}

      {/* Account List or Empty State */}
      <div className="mt-5 space-y-3">
        {connectedChannels.length > 0 ? (
          connectedChannels.map((channel) => (
            <div
              key={channel.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface-2 hover:border-pink-500/30 transition group"
            >
              {/* Account Meta */}
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  {channel.profilePictureUrl ? (
                    <Image
                      src={channel.profilePictureUrl}
                      alt={channel.handle || "Instagram"}
                      width={48}
                      height={48}
                      unoptimized
                      className="rounded-full object-cover ring-2 ring-pink-500/30"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold text-base shadow-inner">
                      {channel.handle?.charAt(0).toUpperCase() || "I"}
                    </div>
                  )}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 block h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-surface-2"
                    title="Faol va ulangan"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text text-sm">
                      @{channel.handle || "instagram_user"}
                    </span>
                    <Badge tone="success">
                      <StatusDot tone="success" />
                      Active
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span>
                      {channel.accountType || "Professional (Creator / Business)"}
                    </span>
                    <span className="text-muted/40">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Ulangan: {formatDateTime(channel.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setReconnectingChannel(channel);
                    setIsModalOpen(true);
                  }}
                  className="h-8 text-xs gap-1.5"
                  title="Tokenni yangilash yoki qayta avtorizatsiya"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-muted group-hover:text-text transition" />
                  <span>Qayta ulash</span>
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={disconnectingId === channel.id}
                  onClick={() => handleDisconnect(channel.id, channel.handle)}
                  className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
                  title="Ushbu akkauntni uzish"
                >
                  {disconnectingId === channel.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                  <span>Uzish</span>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface-2/40 p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-lg shadow-pink-500/15 p-3">
              <InstagramIcon className="w-full h-full text-white" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="font-semibold text-text text-sm">
                Hech qanday Instagram akkaunti ulanmagan
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                OpusClip kabi Reels avtomatik nashr qilish va kontent rejalashtirish uchun rasmiy Meta OAuth orqali Professional (Creator yoki Business) Instagram akkauntingizni ulang.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="gradient"
                onClick={() => {
                  setReconnectingChannel(null);
                  setIsModalOpen(true);
                }}
                className="gap-2 text-xs font-semibold"
              >
                <InstagramIcon className="h-4 w-4" />
                <span>Connect Instagram</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Security note footer */}
      <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Meta Graph API v21.0 & AES-256 shifrlash bilan himoyalangan</span>
        </div>
        <span className="text-[11px] text-muted">
          Har bir foydalanuvchi bir nechta professional akkauntlarni biriktirishi mumkin
        </span>
      </div>

      {/* OpusClip-Style Dedicated Branded Modal */}
      <InstagramConnectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setReconnectingChannel(null);
        }}
        onSuccess={handleConnectSuccess}
        connectedAccount={
          reconnectingChannel
            ? {
                handle: reconnectingChannel.handle || undefined,
                igUserId: reconnectingChannel.igUserId || undefined,
                profilePictureUrl: reconnectingChannel.profilePictureUrl || undefined,
                accountType: reconnectingChannel.accountType || undefined,
              }
            : null
        }
      />
    </div>
  );
}

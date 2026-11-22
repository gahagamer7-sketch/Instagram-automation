"use client";

import Link from "next/link";
import {
  TrendingUp,
  Eye,
  Bookmark,
  Share2,
  Users,
  Clock,
  Sparkles,
  DollarSign,
  Trophy,
  Calendar,
  ArrowUpRight,
  Lightbulb,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { formatNumber, formatUsd } from "@/lib/format";

export interface AnalyticsSummary {
  totalPlays: number;
  totalReach: number;
  totalSaves: number;
  totalShares: number;
  avgWatchTimeSec: number;
  followersGained: number;
  totalCostUsd: number;
}

export interface DailyDataPoint {
  date: string;
  plays: number;
  reach: number;
  saves: number;
}

export interface TopReelItem {
  id: string;
  topic: string;
  plays: number;
  saves: number;
  shares: number;
  reach: number;
  publishedAt: string;
}

export interface AnalyticsViewProps {
  summary: AnalyticsSummary;
  dailyPoints: DailyDataPoint[];
  topReels: TopReelItem[];
  channelNiche: string;
}

export function AnalyticsView({
  summary,
  dailyPoints,
  topReels,
  channelNiche,
}: AnalyticsViewProps) {
  const [metricTab, setMetricTab] = useState<"plays" | "reach" | "saves">("plays");

  const maxVal = Math.max(1, ...dailyPoints.map((d) => d[metricTab]));

  const metrics = [
    {
      title: "Jami Ko'rishlar (Plays)",
      value: formatNumber(summary.totalPlays),
      hint: "Oxirgi 7 kun davomida",
      icon: Eye,
      color: "text-primary",
    },
    {
      title: "Qamrov (Reach)",
      value: formatNumber(summary.totalReach),
      hint: "Noyob hisoblar soni",
      icon: TrendingUp,
      color: "text-accent-indigo",
    },
    {
      title: "Saqlash va Ulashishlar",
      value: formatNumber(summary.totalSaves + summary.totalShares),
      hint: `${formatNumber(summary.totalSaves)} saqlash • ${formatNumber(summary.totalShares)} ulashish`,
      icon: Bookmark,
      color: "text-accent-cyan",
    },
    {
      title: "Yangi Obunachilar",
      value: `+${formatNumber(summary.followersGained)}`,
      hint: "Reels orqali kelgan",
      icon: Users,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Asosiy Metrikalar Kartalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.title} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted">{m.title}</span>
                <Icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <div className="nums text-2xl font-bold text-text mt-2">{m.value}</div>
              <p className="text-[11px] text-muted mt-1">{m.hint}</p>
            </Card>
          );
        })}
      </div>

      {/* 2. 7 Kunlik Dinamika Grafigi */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-text text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Kontent Dinamikasi (7 kunlik)
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Instagram Insights ma'lumotlari asosidagi kunlik ko'rsatkichlar.
            </p>
          </div>

          <div className="flex rounded-xl border border-border bg-surface-2 p-1 gap-1">
            {[
              { id: "plays", label: "Ko'rishlar" },
              { id: "reach", label: "Qamrov" },
              { id: "saves", label: "Saqlashlar" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMetricTab(tab.id as any)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  metricTab === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-48 pt-6 flex items-end justify-between gap-2 border-b border-border pb-4">
          {dailyPoints.map((point) => {
            const val = point[metricTab];
            const heightPercent = Math.max(8, Math.round((val / maxVal) * 100));

            return (
              <div key={point.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="nums text-[10px] text-muted font-medium opacity-0 group-hover:opacity-100 transition">
                  {val}
                </span>
                <div className="w-full max-w-[42px] bg-surface-2 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                  <div
                    className="w-full gradient-brand rounded-t-xl transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted truncate">{point.date}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Eng Yaxshi Reels & AI Haftalik Tavsiyalar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Reels */}
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-warning" />
              Eng Yuqori Natijali Reels Videolar
            </h3>
            <Link href="/reels" className="text-xs font-medium text-primary hover:underline">
              Barcha videolar →
            </Link>
          </div>

          {topReels.length > 0 ? (
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface">
              {topReels.map((reel, idx) => (
                <div
                  key={reel.id}
                  className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-surface-2/40 transition"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span
                      className={`nums font-bold text-sm ${
                        idx === 0 ? "text-warning" : idx === 1 ? "text-text" : "text-muted"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-text text-sm truncate">{reel.topic}</p>
                      <p className="text-[11px] text-muted mt-0.5">
                        Joylangan: {reel.publishedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="nums text-xs font-semibold text-text block">
                        {formatNumber(reel.plays)}
                      </span>
                      <span className="text-[10px] text-muted block">ko'rish</span>
                    </div>

                    <div className="text-right">
                      <span className="nums text-xs font-semibold text-accent-cyan block">
                        {formatNumber(reel.saves)}
                      </span>
                      <span className="text-[10px] text-muted block">saqlash</span>
                    </div>

                    <Badge tone="success" className="gap-0.5 text-xs">
                      <ArrowUpRight className="h-3 w-3" />
                      Viral
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted py-6 text-center">
              Hozircha tahlil qilish uchun joylangan videolar yetarli emas.
            </p>
          )}
        </Card>

        {/* AI Haftalik Xulosa & Tavsiyalar */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg gradient-brand text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-text text-sm">AI Haftalik Tavsiyalari</h3>
              <p className="text-[11px] text-muted">Feedback Loop (TZ 4.7)</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-border bg-surface-2 space-y-1">
              <span className="font-semibold text-primary block flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5" />
                Eng samarali Hook turi:
              </span>
              <p className="text-text">
                "Buni bilmasdan..." va "Har kuni 2 daqiqa..." kabi intizom va faktli hooklar ko'proq saqlanmoqda.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-surface-2 space-y-1">
              <span className="font-semibold text-accent-cyan block flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Optimal Reels uzunligi:
              </span>
              <p className="text-text">
                <strong>25–35 soniya</strong> oralig'idagi videolarda o'rtacha ko'rish vaqti (avg watch time) 82% ni tashkil etdi.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-surface-2 space-y-1">
              <span className="font-semibold text-success block flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joylash soati xulosasi:
              </span>
              <p className="text-text">
                Toshkent vaqti bilan soat <strong>19:00</strong> auditoriya faolligi cho'qqisiga to'g'ri kelmoqda.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/calendar"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-strong transition shadow-sm"
            >
              Keyingi haftani rejalashtirish
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}


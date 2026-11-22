"use client";

import Link from "next/link";
import {
  Sparkles,
  Download,
  Check,
  Calendar,
  Layers,
  Palette,
  Volume2,
  Type,
  Hash,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { generateBrandAction, saveBrandKitAction } from "@/app/brand/actions";
import { type BrandKitData, generateAvatarSvg, generateCoverSvg } from "@/lib/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

interface BrandStudioProps {
  initialBrand: BrandKitData;
  activeNiche: string;
  hasChannel: boolean;
}

export function BrandStudio({
  initialBrand,
  activeNiche,
  hasChannel,
}: BrandStudioProps) {
  const [brand, setBrand] = useState<BrandKitData>(initialBrand);
  const [nicheInput, setNicheInput] = useState<string>(activeNiche);
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState<number>(0);
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const handleGenerate = () => {
    setMessage(null);
    startGenerating(async () => {
      const res = await generateBrandAction(nicheInput);
      if (res.ok && res.data) {
        setBrand(res.data);
        setSelectedAvatarIdx(0);
        setMessage({ tone: "success", text: res.message });
      } else {
        setMessage({ tone: "danger", text: res.message || "Xatolik yuz berdi" });
      }
    });
  };

  const handleSave = () => {
    setMessage(null);
    startSaving(async () => {
      const selectedSvg = brand.avatars[selectedAvatarIdx] || brand.avatars[0];
      const res = await saveBrandKitAction(brand, selectedSvg);
      if (res.ok) {
        setMessage({ tone: "success", text: res.message });
      } else {
        setMessage({ tone: "danger", text: res.message });
      }
    });
  };

  const handleSelectName = (name: string) => {
    const updated = {
      ...brand,
      chosenName: name,
      avatars: [1, 2, 3, 4].map((v) => generateAvatarSvg(v, name, brand.colors)),
      coverTemplate: generateCoverSvg(name, brand.slogan, brand.colors),
    };
    setBrand(updated);
  };

  const downloadSvg = (svgContent: string, fileName: string) => {
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="mb-4">
          <Alert tone={message.tone}>{message.text}</Alert>
        </div>
      )}

      {/* 1. Nisha va Generatsiya boshqaruvi */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[240px]">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
              Brend nishasi
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
                placeholder="Nishani kiriting (masalan: Foydali Odatlar, IT & Gadjetlar)"
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none"
              />
              <Button
                variant="gradient"
                disabled={isGenerating || !nicheInput.trim()}
                onClick={handleGenerate}
                className="shrink-0"
              >
                {isGenerating ? (
                  <Clock className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden />
                )}
                {isGenerating ? "Generatsiya..." : "AI bilan qayta yaratish"}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              disabled={isSaving}
              onClick={handleSave}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSaving ? "Saqlanmoqda..." : "Brendni saqlash va qo'llash"}
            </Button>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-sm font-semibold text-text hover:border-primary/50 hover:text-primary transition"
            >
              <Calendar className="h-4 w-4 text-primary" />
              Kalendarga o'tish
            </Link>
          </div>
        </div>
      </Card>

      {/* 2. Nom variantlari (10 nom) */}
      <Card className="p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-text text-base flex items-center gap-2">
            <Type className="h-4 w-4 text-primary" />
            10 Nom varianti
          </h3>
          <p className="text-xs text-muted mt-0.5">
            O'zingizga yoqqan nom ustiga bosing — avatar va muqovalar avtomatik moslashadi.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {brand.nameOptions.map((name, i) => {
            const isChosen = brand.chosenName === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => handleSelectName(name)}
                className={`group flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  isChosen
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "border border-border bg-surface text-text hover:border-primary/40 hover:bg-surface-2"
                }`}
              >
                <span className={`nums text-xs ${isChosen ? "text-white/80" : "text-muted"}`}>
                  #{i + 1}
                </span>
                <span>{name}</span>
                {isChosen && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">
            Tanlangan rasmiy nom
          </label>
          <input
            type="text"
            value={brand.chosenName}
            onChange={(e) => handleSelectName(e.target.value)}
            className="w-full max-w-md rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-text focus:border-primary focus:outline-none"
          />
        </div>
      </Card>

      {/* 3. Bio va Slogan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text text-sm flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Slogan (Shior)
            </h3>
          </div>
          <input
            type="text"
            value={brand.slogan}
            onChange={(e) => {
              const updated = {
                ...brand,
                slogan: e.target.value,
                coverTemplate: generateCoverSvg(brand.chosenName, e.target.value, brand.colors),
              };
              setBrand(updated);
            }}
            placeholder="Kanal shiorini yozing..."
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
          />
          <p className="text-xs text-muted">
            Videolar intro/outro va muqovalarida ishlatiladi.
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Instagram Bio
            </h3>
            <span
              className={`nums text-xs font-semibold ${
                brand.bio.length > 150 ? "text-danger" : "text-muted"
              }`}
            >
              {brand.bio.length} / 150
            </span>
          </div>
          <textarea
            rows={3}
            value={brand.bio}
            onChange={(e) => setBrand({ ...brand, bio: e.target.value })}
            placeholder="Instagram profilingiz bio qismi..."
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none resize-none"
          />
          <p className="text-xs text-muted">
            Onboarding paytida nusxa olib Instagram akkauntga joylashtiriladi.
          </p>
        </Card>
      </div>

      {/* 4. Vektorli Avatarlar (4 variant — 1080x1080) */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-text text-base flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              4 Vektorli Avatar varianti (1080x1080)
            </h3>
            <p className="text-xs text-muted mt-0.5">
              SVG formatida tayyorlangan — istalgan o'lchamda tiniq ko'rinadi va bepul yuklab olinadi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {brand.avatars.map((svg, idx) => {
            const isSelected = selectedAvatarIdx === idx;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center rounded-2xl border p-4 transition ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-2 ring-primary/40"
                    : "border-border bg-surface hover:border-border-hover"
                }`}
              >
                <div
                  className="w-full aspect-square max-w-[200px] rounded-2xl overflow-hidden shadow-inner border border-border/50 mb-3"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />

                <div className="w-full flex items-center justify-between mt-auto gap-2">
                  <Button
                    size="sm"
                    variant={isSelected ? "primary" : "secondary"}
                    onClick={() => setSelectedAvatarIdx(idx)}
                    className="flex-1 text-xs"
                  >
                    {isSelected ? "Tanlangan" : "Tanlash"}
                  </Button>
                  <button
                    type="button"
                    title="SVG yuklab olish"
                    onClick={() => downloadSvg(svg, `avatar-${idx + 1}.svg`)}
                    className="p-2 rounded-xl border border-border bg-surface-2 text-muted hover:text-primary hover:border-primary/50 transition"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 5. Reels Muqova Shabloni va Ovoz */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 md:col-span-1 space-y-4">
          <div>
            <h3 className="font-semibold text-text text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Reels Muqova shabloni (9:16)
            </h3>
            <p className="text-xs text-muted mt-0.5">
              1080x1920 o'lchamli qolip.
            </p>
          </div>

          <div
            className="w-full aspect-[9/16] rounded-xl overflow-hidden shadow border border-border"
            dangerouslySetInnerHTML={{ __html: brand.coverTemplate }}
          />

          <Button
            size="sm"
            variant="secondary"
            className="w-full gap-2"
            onClick={() => downloadSvg(brand.coverTemplate, "cover-template.svg")}
          >
            <Download className="h-4 w-4" />
            Muqovani yuklab olish (.svg)
          </Button>
        </Card>

        <Card className="p-5 md:col-span-2 space-y-6">
          {/* Kalit so'zlar va hashtaglar */}
          <div>
            <h3 className="font-semibold text-text text-sm flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-primary" />
              Kalit so'zlar va hashtaglar
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {brand.keywords.map((kw, i) => (
                <Badge key={i} tone="primary">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>

          {/* Ovoz sozlamasi */}
          <div>
            <h3 className="font-semibold text-text text-sm flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-primary" />
              Ovoz sozlamasi (Gemini TTS)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "gemini-uz-natural-male", title: "O'zbekcha (Tabiiy Erkak)", desc: "Dinamik va ishonchli ohang" },
                { id: "gemini-uz-natural-female", title: "O'zbekcha (Tabiiy Ayol)", desc: "Muloyim va aniq diksiya" },
              ].map((voice) => (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => setBrand({ ...brand, voiceId: voice.id })}
                  className={`text-left p-3.5 rounded-xl border transition ${
                    brand.voiceId === voice.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-surface hover:border-primary/40"
                  }`}
                >
                  <div className="font-medium text-text text-sm">{voice.title}</div>
                  <div className="text-xs text-muted mt-0.5">{voice.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Kit Ranglar Palitrasi */}
          <div>
            <h3 className="font-semibold text-text text-sm flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-primary" />
              Brand Kit Palitrasi
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Primary", color: brand.colors.primary },
                { label: "Indigo Accent", color: brand.colors.accentIndigo },
                { label: "Cyan Accent", color: brand.colors.accentCyan },
                { label: "Dark Surface", color: brand.colors.surface },
              ].map((swatch) => (
                <div
                  key={swatch.label}
                  className="p-2.5 rounded-xl border border-border bg-surface flex items-center gap-2.5"
                >
                  <div
                    className="w-7 h-7 rounded-lg border border-border shrink-0 shadow-sm"
                    style={{ backgroundColor: swatch.color }}
                  />
                  <div className="min-w-0">
                    <div className="text-[11px] text-muted truncate">{swatch.label}</div>
                    <div className="nums text-xs font-semibold text-text">{swatch.color}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


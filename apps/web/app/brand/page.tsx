import { Suspense } from "react";
import { PageHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { prisma } from "@autochannel/db";
import { getCurrentUser } from "@/lib/session";
import { BrandStudio } from "@/components/brand/brand-studio";
import {
  parseBrandKitResponse,
  DEFAULT_BRAND_COLORS,
  generateAvatarSvg,
  generateCoverSvg,
  type BrandColors,
} from "@/lib/brand";

export const metadata = {
  title: "Brend studiyasi — AutoChannel",
};

interface BrandPageProps {
  searchParams: Promise<{ niche?: string }>;
}

export default function BrandPage({ searchParams }: BrandPageProps) {
  return (
    <>
      <PageHeader
        title="Brend studiyasi"
        description="Nom, bio, avatar va muqova varianti — bir marta tayyorlanib akkauntga qo'yiladi (TZ 4.1)."
      />

      <Suspense fallback={<CardSkeleton lines={6} />}>
        <BrandContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function BrandContent({ searchParams }: BrandPageProps) {
  const params = await searchParams;
  const currentUser = await getCurrentUser();
  const channel = currentUser?.channel
    ? await prisma.channel.findUnique({
        where: { id: currentUser.channel.id },
        include: { brandKit: true },
      })
    : await prisma.channel.findFirst({
        include: { brandKit: true },
      });

  const activeNiche = params.niche || channel?.niche || "Foydali Odatlar";

  let initialBrand;
  if (channel?.brandKit) {
    const bk = channel.brandKit;
    const colors = ((bk.colors as unknown) as BrandColors) || DEFAULT_BRAND_COLORS;
    const chosenName = bk.chosenName || channel.name;
    const slogan = bk.slogan || "Har kuni yangi bilim";
    initialBrand = {
      nameOptions: Array.isArray(bk.nameOptions)
        ? (bk.nameOptions as string[])
        : [chosenName],
      chosenName,
      slogan,
      bio: bk.bio || "",
      keywords: bk.keywords || [],
      colors,
      font: bk.font || "Inter",
      voiceId: bk.voiceId || "gemini-uz-natural-male",
      avatars: bk.avatarUrl
        ? [bk.avatarUrl, ...[2, 3, 4].map((v) => generateAvatarSvg(v, chosenName, colors))]
        : [1, 2, 3, 4].map((v) => generateAvatarSvg(v, chosenName, colors)),
      coverTemplate: bk.coverTemplateUrl || generateCoverSvg(chosenName, slogan, colors),
    };
  } else {
    initialBrand = parseBrandKitResponse("", activeNiche);
  }

  return (
    <BrandStudio
      initialBrand={initialBrand}
      activeNiche={activeNiche}
      hasChannel={Boolean(channel)}
    />
  );
}

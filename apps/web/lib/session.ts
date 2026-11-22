import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma, type User, type Channel } from "@autochannel/db";
import { SESSION_COOKIE, verifySessionToken, type UserSession } from "./auth";

/**
 * HTTP cookie'dan joriy foydalanuvchi sessiyasini o'qiydi va tekshiradi.
 */
export async function getCurrentSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export type CurrentUserWithChannel = {
  user: User | { id: string; email: string; name: string | null; role: "user" | "admin" };
  channel: Channel | null;
  channels: Channel[];
};

/**
 * Sessiya egasi bo'lgan foydalanuvchi va uning kanalini bazadan yuklaydi.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUserWithChannel | null> => {
  const session = await getCurrentSession();
  if (!session) return null;

  try {
    // Admin legacy sessiya (ADMIN_PASSWORD orqali kirilganda)
    if (session.userId === "admin") {
      const allChannels = await prisma.channel.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      return {
        user: {
          id: "admin",
          email: session.email,
          name: session.name || "Administrator",
          role: "admin",
        },
        channel: allChannels[0] ?? null,
        channels: allChannels,
      };
    }

    // Oddiy ro'yxatdan o'tgan foydalanuvchi
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        channels: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) return null;

    return {
      user,
      channel: user.channels[0] ?? null,
      channels: user.channels,
    };
  } catch (err) {
    console.error("getCurrentUser xatosi:", err);
    return null;
  }
});

/**
 * Sahifa yoki server action uchun avtorizatsiyani talab qiladi, aks holda /login sahifasiga yo'naltiradi.
 */
export async function requireAuth(): Promise<CurrentUserWithChannel> {
  const data = await getCurrentUser();
  if (!data) {
    redirect("/login");
  }
  return data;
}


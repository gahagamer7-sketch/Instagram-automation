"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@autochannel/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SEC,
  createSessionToken,
  hashPassword,
} from "@/lib/auth";

export async function registerAction(
  prevState: { ok: boolean; message?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message?: string }> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || name.length < 2) {
    return { ok: false, message: "Iltimos, ism va familiyangizni to'liq kiriting (kamida 2 ta belgi)." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Iltimos, to'g'ri elektron pochta manzilini kiriting." };
  }

  if (!password || password.length < 6) {
    return { ok: false, message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." };
  }

  if (password !== confirmPassword) {
    return { ok: false, message: "Kiritilgan parollar bir-biriga mos kelmadi." };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return {
        ok: false,
        message: "Ushbu elektron pochta orqali allaqachon ro'yxatdan o'tilgan. Iltimos, tizimga kiring.",
      };
    }

    const passwordHash = await hashPassword(password);

    // Foydalanuvchi va uning shaxsiy kanalini bazada yaratamiz
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "user",
        channels: {
          create: {
            name: `${name} kanali`,
            platform: "instagram",
            status: "setup",
          },
        },
      },
    });

    // Yangi foydalanuvchi uchun sessiya yaratamiz
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SEC,
    });
  } catch (err) {
    console.error("Ro'yxatdan o'tish xatosi:", err);
    return {
      ok: false,
      message: "Ro'yxatdan o'tishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
    };
  }

  redirect("/reels/create");
}


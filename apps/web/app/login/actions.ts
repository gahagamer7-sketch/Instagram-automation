"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@autochannel/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SEC,
  createSessionToken,
  verifyPassword,
} from "@/lib/auth";

export async function loginAction(
  prevState: { ok: boolean; message?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message?: string }> {
  const emailOrUser = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const rawFrom = (formData.get("from") as string) || "/dashboard";
  const target = !rawFrom || rawFrom === "/" ? "/dashboard" : rawFrom;

  if (!password) {
    return { ok: false, message: "Iltimos, parolingizni kiriting." };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  try {
    // 1. Agar email kiritilgan bo'lsa, bazadan foydalanuvchini qidiramiz
    if (emailOrUser && emailOrUser.includes("@")) {
      const user = await prisma.user.findUnique({
        where: { email: emailOrUser.toLowerCase() },
      });

      if (user) {
        const isMatch = await verifyPassword(password, user.passwordHash);
        if (isMatch) {
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

          redirect(target);
        }
      }
    }

    // 2. Admin yoki ishlab chiquvchi uchun tezkor kirish (ADMIN_PASSWORD orqali)
    if (adminPassword && password === adminPassword) {
      const token = await createSessionToken({
        userId: "admin",
        email: emailOrUser || "admin@autochannel.local",
        name: "Administrator",
        role: "admin",
      });

      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SEC,
      });

      redirect(target);
    }

    // 3. Agar foydalanuvchi topilmasa yoki parol xato bo'lsa
    return {
      ok: false,
      message: "Elektron pochta yoki parol noto'g'ri. Iltimos qaytadan tekshirib ko'ring.",
    };
  } catch (err) {
    // Next.js redirect xatosini to'xtatmasdan o'tkazamiz
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Login xatosi:", err);
    return {
      ok: false,
      message: "Tizimga kirishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.",
    };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

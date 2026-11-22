"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE_SEC, createSessionToken } from "@/lib/auth";

export async function loginAction(
  prevState: { ok: boolean; message?: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message?: string }> {
  const password = formData.get("password") as string;
  const from = (formData.get("from") as string) || "/";

  const adminPassword = process.env.ADMIN_PASSWORD;

  // Agar ADMIN_PASSWORD belgilanmagan bo'lsa, to'g'ridan-to'g'ri o'tkaziladi
  if (!adminPassword) {
    redirect(from);
  }

  if (!password || password !== adminPassword) {
    return { ok: false, message: "Parol noto'g'ri. Iltimos qaytadan tekshirib ko'ring." };
  }

  const token = await createSessionToken(adminPassword);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });

  redirect(from);
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}


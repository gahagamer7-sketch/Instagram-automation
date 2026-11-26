import { NextResponse } from "next/server";
import { listCredentials, saveCredential } from "@/lib/credentials";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "Avtorizatsiyadan o'tilmagan" },
        { status: 401 },
      );
    }
    return NextResponse.json({ credentials: await listCredentials() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Xato" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { error: "Avtorizatsiyadan o'tilmagan" },
        { status: 401 },
      );
    }
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Faqat administratorlar tizim API kalitlarini o'zgartirishi mumkin" },
        { status: 403 },
      );
    }
    const body = (await request.json()) as {
      provider?: string;
      apiKey?: string;
      dailyLimit?: number;
      monthlyLimit?: number;
    };
    if (!body.provider || !body.apiKey) {
      return NextResponse.json(
        { error: "provider va apiKey majburiy" },
        { status: 400 },
      );
    }
    const cred = await saveCredential(body.provider, body.apiKey, {
      daily: body.dailyLimit,
      monthly: body.monthlyLimit,
    });
    return NextResponse.json({ credential: cred }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Xato" },
      { status: 500 },
    );
  }
}

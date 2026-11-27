import { NextResponse } from "next/server";
import { testCredential } from "@/lib/credentials";
import { getCurrentUser } from "@/lib/session";

// Next 16: params — Promise
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Avtorizatsiyadan o'tilmagan" },
      { status: 401 },
    );
  }
  const { id } = await params;
  try {
    return NextResponse.json(await testCredential(id, session.user.id));
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Xato" },
      { status: 500 },
    );
  }
}

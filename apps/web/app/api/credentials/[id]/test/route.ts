import { NextResponse } from "next/server";
import { testCredential } from "@/lib/credentials";

// Next 16: params — Promise
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    return NextResponse.json(await testCredential(id));
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Xato" },
      { status: 500 },
    );
  }
}

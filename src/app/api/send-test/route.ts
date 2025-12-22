// src/app/api/send-test/route.ts
import { NextResponse } from "next/server";

/**
 * Non-MVP: Twilio send-test route disabled.
 * This route intentionally does not import twilio or any send function.
 */
export async function GET() {
  return NextResponse.json(
    { ok: false, message: "send-test API disabled in MVP." },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "send-test API disabled in MVP." },
    { status: 410 }
  );
}

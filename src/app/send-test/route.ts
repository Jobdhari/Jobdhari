// src/app/api/send-test/route.ts
import { NextResponse } from "next/server";

/**
 * Non-MVP: Twilio test API disabled.
 * Keeps production build stable without installing twilio.
 */
export async function GET() {
  return NextResponse.json(
    { ok: false, message: "send-test API disabled in MVP build." },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "send-test API disabled in MVP build." },
    { status: 410 }
  );
}

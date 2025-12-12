import { NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/twilio"; // ✅ use @ alias path (not relative src)

export async function GET() {
  try {
    // ✅ replace with your WhatsApp-enabled number (include country code)
    const myNumber = "+919030452252";

    // ✅ simple success message for testing
    await sendWhatsApp(
      myNumber,
      "👋 Hello Krishna — Jobdhari WhatsApp integration test successful! 🚀"
    );

    return NextResponse.json({
      success: true,
      message: "WhatsApp sent successfully!",
    });
  } catch (error) {
    console.error("❌ Error sending WhatsApp:", error);

    // ✅ narrow the type safely (no `any`)
    const errMsg =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    );
  }
}

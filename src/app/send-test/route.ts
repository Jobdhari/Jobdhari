import { sendWhatsApp } from "@/lib/twilio";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const myNumber = "+919030452252"; // replace with your WhatsApp number

    await sendWhatsApp(
      myNumber,
      "Hello Krishna 👋 — Jobdhari WhatsApp integration test successful!"
    );

    return NextResponse.json({
      success: true,
      message: "WhatsApp sent successfully!",
    });
  } catch (error: any) {
    console.error("Error sending WhatsApp:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

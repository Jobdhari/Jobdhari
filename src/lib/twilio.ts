import twilio from "twilio";

// ✅ Create Twilio client using environment variables
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

/**
 * Sends a WhatsApp message using the Twilio API.
 * @param to Recipient's WhatsApp number (e.g., "+919876543210")
 * @param message The message text to send
 */
export async function sendWhatsApp(to: string, message: string): Promise<void> {
  try {
    const response = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
      body: message,
    });

    console.log(`✅ WhatsApp message sent successfully. SID: ${response.sid}`);
  } catch (error) {
    const errMsg =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("❌ Error sending WhatsApp:", errMsg);
    throw new Error(errMsg); // rethrow for API route to catch
  }
}

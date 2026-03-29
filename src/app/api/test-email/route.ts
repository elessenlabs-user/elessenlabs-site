import { NextResponse } from "next/server";
import { sendAdminNotification } from "../../../lib/email/sendEmail";

export async function GET() {
  await sendAdminNotification({
    name: "Tanya Test",
    productUrl: "https://elessenlabs.com",
  });

  return NextResponse.json({ ok: true, message: "Test email sent." });
}
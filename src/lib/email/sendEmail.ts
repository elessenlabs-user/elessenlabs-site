import { Resend } from "resend";

export async function sendAdminNotification({
  name,
  productUrl,
}: {
  name: string;
  productUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing");
    return;
  }

  try {
    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: "Elessen <hello@elessenlabs.com>",
      to: "hello@elessenlabs.com",
      subject: "New Audit Request Submitted",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Audit Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Product URL:</strong> ${productUrl}</p>
        </div>
      `,
    });

    console.log("RESEND SUCCESS:", result);
  } catch (err) {
    console.error("EMAIL ERROR:", err);
  }
}
import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing");
    return null;
  }

  return new Resend(apiKey);
}

export async function sendAdminNotification({
  name,
  productUrl,
}: {
  name: string;
  productUrl: string;
}) {
  const resend = getResendClient();
  if (!resend) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const result = await resend.emails.send({
      from: "Elessen <hello@elessenlabs.com>",
      to: "hello@elessenlabs.com",
      subject: "New Audit Request Submitted",
     html: `
  <div style="max-width: 520px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
    
    <div style="margin-bottom: 24px; text-align: center;">
  <img 
    src="${siteUrl}/logo.png" 
    alt="Elessen Labs" 
    style="height: 80px; display: block; margin: 0 auto;" 
  />
</div>
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

export async function sendAuditPaymentConfirmation({
  email,
  name,
  productUrl,
  auditId,
}: {
  email: string;
  name: string;
  productUrl: string;
  auditId: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const auditUrl = `${siteUrl}/audit/result/${auditId}`;

  try {
    const result = await resend.emails.send({
      from: "Elessen <hello@elessenlabs.com>",
      to: email,
      cc: "hello@elessenlabs.com",
      subject: "Payment received — your Elessen audit is now in review",
     html: `
  <div ...
    
  <div style="margin-bottom: 24px; text-align: center;">
    <img 
      src="${siteUrl}/logo.png" 
      alt="Elessen Labs" 
      style="height: 80px; display: block; margin: 0 auto;" 
    />
</div>

    <h2>Payment received</h2>

          <p>Hi ${name},</p>

          <p>
            Thank you — we’ve received your payment for the Elessen Audit Engine.
          </p>

          <p>
            Your audit is now in review by an Elessen product audit expert to help ensure the final output is accurate,
            useful, and in strong shape before delivery.
          </p>

          <p>
            Delivery can take up to <strong>24 hours</strong>, although it is often completed sooner.
          </p>

          <p>
            Your audit link:
            <br />
            <a href="${auditUrl}" target="_blank" rel="noopener noreferrer">${auditUrl}</a>
          </p>

          <p>
            <strong>Product submitted:</strong> ${productUrl}
          </p>

          <p>
            We’ll email you again as soon as your reviewed audit is ready.
          </p>

          <p style="margin-top: 24px;">
            Elessen Labs
          </p>
        </div>
      `,
    });

    console.log("PAYMENT CONFIRMATION EMAIL SENT:", result);
  } catch (err) {
    console.error("PAYMENT CONFIRMATION EMAIL ERROR:", err);
  }
}
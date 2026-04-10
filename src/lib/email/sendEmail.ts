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
      to: ["hello@elessenlabs.com", "tanya@elessenlabs.com"],
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
        <div style="max-width: 520px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
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
            Your audit is now in review by an Elessen product audit expert.
          </p>

          <p>
            Delivery can take up to <strong>24 hours</strong>, although it is often sooner.
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

export async function sendInviteAuditAdminNotification({
  name,
  email,
  productUrl,
  auditId,
}: {
  name: string;
  email: string;
  productUrl: string;
  auditId: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const reviewUrl = `${siteUrl}/admin/reviews`;

  try {
    const result = await resend.emails.send({
      from: "Elessen <hello@elessenlabs.com>",
      to: ["hello@elessenlabs.com", "tanya@elessenlabs.com"],
      subject: "New Invite Audit Submitted",
      html: `
        <div style="max-width: 520px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="margin-bottom: 24px; text-align: center;">
            <img 
              src="${siteUrl}/logo.png" 
              alt="Elessen Labs" 
              style="height: 80px; display: block; margin: 0 auto;" 
            />
          </div>

          <h2>New Invite Audit Submitted</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Product URL:</strong> ${productUrl}</p>
          <p><strong>Audit ID:</strong> ${auditId}</p>

          <p>
            Review queue:
            <br />
            <a href="${reviewUrl}" target="_blank" rel="noopener noreferrer">${reviewUrl}</a>
          </p>
        </div>
      `,
    });

    console.log("INVITE ADMIN EMAIL SENT:", result);
  } catch (err) {
    console.error("INVITE ADMIN EMAIL ERROR:", err);
  }
}

export async function sendInviteAuditConfirmation({
  email,
  name,
  productUrl,
}: {
  email: string;
  name: string;
  productUrl: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const result = await resend.emails.send({
      from: "Elessen <hello@elessenlabs.com>",
      to: email,
      cc: "hello@elessenlabs.com",
      subject: "Thank you for trying the Elessen Audit Engine",
      html: `
        <div style="max-width: 520px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <div style="margin-bottom: 24px; text-align: center;">
            <img 
              src="${siteUrl}/logo.png" 
              alt="Elessen Labs" 
              style="height: 80px; display: block; margin: 0 auto;" 
            />
          </div>

          <p>Hello ${name},</p>

          <p>Thank you for taking the time to try out the Elessen Audit Engine.</p>

          <p>
            We’re now reviewing your report to help ensure it is validated before it is shared.
          </p>

          <p>
            You should receive it within <strong>24 hours</strong>, though it often takes less time depending on the URL submitted.
          </p>

          <p><strong>Product submitted:</strong> ${productUrl}</p>

          <p>We’ll send your report as soon as it’s ready.</p>

          <p style="margin-top: 24px;">
            Tanya Emma
            <br />
            <strong>Founder, Elessen Labs</strong>
          </p>
        </div>
      `,
    });

    console.log("INVITE USER CONFIRMATION EMAIL SENT:", result);
  } catch (err) {
    console.error("INVITE USER CONFIRMATION EMAIL ERROR:", err);
  }
}
export async function sendInviteAuditDelivery({
  email,
  name,
  auditId,
}: {
  email: string;
  name?: string | null;
  auditId: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const auditUrl = `${siteUrl}/audit/result/${auditId}`;
  const pdfUrl = `${siteUrl}/api/audit/pdf?id=${auditId}`;
  const feedbackUrl = `${siteUrl}/audit/feedback?id=${auditId}`;

  try {
    const result = await resend.emails.send({
      from: "Elessen <hello@elessenlabs.com>",
      to: email,
      cc: "hello@elessenlabs.com",
      subject: "Your Elessen Audit Report is Ready",
      html: `
        <div style="max-width: 520px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          
          <div style="margin-bottom: 24px; text-align: center;">
            <img 
              src="${siteUrl}/logo.png" 
              alt="Elessen Labs" 
              style="height: 80px; display: block; margin: 0 auto;" 
            />
          </div>

          <p>Hello ${name || "there"},</p>

          <p>Your audit has been reviewed and is ready.</p>

          <p>
            <a href="${auditUrl}" target="_blank" rel="noopener noreferrer">View Report</a>
            <br/>
            <a href="${pdfUrl}" target="_blank" rel="noopener noreferrer">Download PDF</a>
            <br/>
            <a href="${feedbackUrl}" target="_blank" rel="noopener noreferrer">Submit Feedback</a>
          </p>

          <p>
            Thank you again for trying the Elessen Audit Engine. We’d really value your feedback — good or bad.
          </p>

          <p>
            Tanya Emma<br/>
            <b>Founder, Elessen Labs</b>
          </p>
        </div>
      `,
    });

    console.log("INVITE AUDIT DELIVERY EMAIL SENT:", result);
  } catch (err) {
    console.error("INVITE AUDIT DELIVERY EMAIL ERROR:", err);
  }
}
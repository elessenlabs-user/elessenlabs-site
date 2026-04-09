import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing");
    return null;
  }

  return new Resend(apiKey);
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
            <a href="${auditUrl}" target="_blank">${auditUrl}</a>
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
// ✅ INVITE — ADMIN NOTIFICATION
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

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    await resend.emails.send({
      from: "Elessen <hello@elessenlabs.com>",
      to: ["hello@elessenlabs.com", "tanya@elessenlabs.com"],
      subject: "New Invite Audit Submission",
      html: `
        <div style="max-width:520px;margin:0 auto;font-family:Arial;">
          <h2>New Invite Audit</h2>

          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Product:</strong> ${productUrl}</p>

          <p>
            <a href="${siteUrl}/admin/reviews">
              Open Review Dashboard
            </a>
          </p>

          <p><strong>Audit ID:</strong> ${auditId}</p>
        </div>
      `,
    });

    console.log("INVITE ADMIN EMAIL SENT:", auditId);
  } catch (err) {
    console.error("INVITE ADMIN EMAIL ERROR:", err);
  }
}

// ✅ INVITE — USER CONFIRMATION
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

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    await resend.emails.send({
      from: "Elessen <hello@elessenlabs.com>",
      to: email,
      subject: "Your Elessen Audit is being prepared",
      html: `
        <div style="max-width:520px;margin:0 auto;font-family:Arial;line-height:1.6;">
          
          <div style="text-align:center;margin-bottom:20px;">
            <img src="${siteUrl}/logo.png" style="height:80px;" />
          </div>

          <p>Hey ${name || "there"},</p>

          <p>
            Thank you for trying the <strong>Elessen Audit Engine</strong>.
          </p>

          <p>
            Your report is currently being reviewed to ensure it is accurate,
            actionable, and high quality before delivery.
          </p>

          <p>
            You will receive your audit within <strong>24 hours</strong>,
            although it is often delivered much sooner depending on the product.
          </p>

          <p>
            <strong>Product submitted:</strong><br/>
            ${productUrl}
          </p>

          <p>
            Keep an eye out for an email from
            <strong>hello@elessenlabs.com</strong>.
          </p>

          <p style="margin-top:24px;">
            Tanya Emma<br/>
            <b>Founder, Elessen Labs</b>
          </p>
        </div>
      `,
    });

    console.log("INVITE USER EMAIL SENT:", email);
  } catch (err) {
    console.error("INVITE USER EMAIL ERROR:", err);
  }
}
import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing");
    return null;
  }

  return new Resend(apiKey);
}

export async function sendAuditEmail({
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

  try {
    const result = await resend.emails.send({
      from: "Elessen <hello@elessenlabs.com>",
      to: email,
      cc: "hello@elessenlabs.com",
      subject: "Your Elessen Audit Report is Ready 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          
          <p>Hi ${name || "there"},</p>

          <p>Your Elessen Audit Report is ready.</p>

          <p>
            <a href="${auditUrl}" target="_blank">${auditUrl}</a>
          </p>

          <br/>

          <p>
            I personally reviewed how this system structures audits — 
            and I’d be happy to walk you through the findings with you.
          </p>

          <p>
            Book a <strong>free 15-minute session</strong> here:
            <br/>
            <a href="https://calendly.com/elessenlabs/product_clarity_call">
              https://calendly.com/elessenlabs/product_clarity_call
            </a>
          </p>

          <p><strong>This offer expires in 30 days.</strong></p>

          <br/>

          <p>
            Tanya Emma Elessen<br/>
            Founder, Elessen Labs
          </p>

          <img src="${siteUrl}/api/email/open?id=${auditId}" width="1" height="1" style="display:none;" />

        </div>
      `,
    });

    console.log("AUDIT DELIVERY EMAIL SENT:", result);
  } catch (err) {
    console.error("AUDIT DELIVERY EMAIL ERROR:", err);
  }
}
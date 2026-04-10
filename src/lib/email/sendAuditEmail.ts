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
  auditPdfUrl,
}: {
  email: string;
  name?: string | null;
  auditId: string;
  auditPdfUrl?: string | null;
}) {
  const resend = getResendClient();
  if (!resend) return;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const auditUrl = `${siteUrl}/audit/result/${auditId}`;
  const pdfUrl = auditPdfUrl || "";
  const feedbackUrl = `${siteUrl}/audit/feedback?id=${auditId}`;

  try {
    const result = await resend.emails.send({
      from: "Elessen <hello@elessenlabs.com>",
      to: email,
      cc: "hello@elessenlabs.com",
      subject: "Your Elessen Audit Report is Ready 🚀",
      attachments: pdfUrl
  ? [
      {
        path: pdfUrl,
        filename: `elessen-audit-${auditId}.pdf`,
      },
    ]
  : [],
     html: `
  <div style="max-width: 520px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
    
    <div style="margin-bottom: 24px; text-align: center;">
  <img 
    src="${siteUrl}/logo.png" 
    alt="Elessen Labs" 
    style="height: 80px; display: block; margin: 0 auto;" 
  />
</div>
          
<p>Hi ${name || "there"},</p>

<p>Your Elessen Audit Report is ready.</p>

<p>
  <a href="${auditUrl}" target="_blank" rel="noopener noreferrer">View Report</a>
</p>

<p>
  Your PDF report is attached to this email for easy review and sharing.
</p>

<p>
  If you have a moment, we’d really value your feedback — it helps us refine and elevate the Audit Engine with every report we deliver.
  <br/>
  <a href="${feedbackUrl}" target="_blank" rel="noopener noreferrer">Share your feedback</a>
</p>

<p>
  I personally reviewed how this system structures audits — and I’d be happy to walk you through the findings with you.
</p>

<p>
  Book a <strong>free 15-minute session</strong> here:
  <br/>
  <a href="https://calendly.com/elessenlabs/product_clarity_call">
    https://calendly.com/elessenlabs/product_clarity_call
  </a>
</p>

<p><strong>This offer expires in 30 days.</strong></p>

<p>
Tanya Emma <br/>
<b>Founder, Elessen Labs</b>
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
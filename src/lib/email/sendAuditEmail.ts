import nodemailer from "nodemailer";

export async function sendAuditEmail({
  email,
  name,
  auditId,
}: {
  email: string;
  name?: string;
  auditId: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const reportUrl = `https://www.elessenlabs.com/audit/result/${auditId}`;
  const feedbackUrl = `https://www.elessenlabs.com/feedback/${auditId}`;

  const html = `
  <div style="font-family: Arial, sans-serif; background:#f7f7f7; padding:40px 20px;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; padding:32px; border-radius:16px;">

      <!-- Logo -->
      <div style="text-align:center; margin-bottom:24px;">
        <img src="https://www.elessenlabs.com/logo.png" style="height:36px;" />
      </div>

      <!-- Title -->
      <h2 style="text-align:center; margin-bottom:16px;">
        Your Audit Report is Ready
      </h2>

      <!-- Greeting -->
      <p style="text-align:center; color:#555; line-height:1.6;">
        Hello ${name || "there"},<br/><br/>
        Your product audit has been completed and is ready for review.
      </p>

      <!-- CTA: View Report -->
      <div style="text-align:center; margin:32px 0 16px;">
  <a href="${reportUrl}" 
    style="
      background:#FF7A00;
      color:#000;
      padding:16px 30px;
      border-radius:12px;
      text-decoration:none;
      font-weight:600;
      display:inline-block;
      font-size:15px;
      box-shadow: 0 6px 16px rgba(255,122,0,0.25);
    ">
    View Your Report
  </a>
</div>

<p style="font-size:13px; color:#666; text-align:center; margin-bottom:12px;">
  We’d really appreciate your feedback — it directly helps us improve the Audit Engine.
</p>

      <!-- CTA: Feedback -->
      <div style="text-align:center; margin:0 0 32px;">
  <a href="${feedbackUrl}" 
    style="
      background:#DFF5E3;
      color:#000;
      padding:14px 26px;
      border-radius:12px;
      text-decoration:none;
      font-weight:600;
      display:inline-block;
      font-size:14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    ">
    Share Feedback
  </a>
</div>

      <!-- Supporting text -->
      <p style="font-size:13px; color:#777; text-align:center; line-height:1.6;">
        Your feedback helps us refine and improve the Elessen Audit Engine with every report we deliver.
      </p>

      <!-- Signature -->
      <div style="margin-top:30px; text-align:center; font-size:14px;">
        <strong>Tanya Emma</strong><br/>
        Founder, Elessen Labs
      </div>

    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"Elessen" <hello@elessenlabs.com>`,
    to: email,
    subject: "Your Elessen Audit Report is Ready",
    html,
  });
}
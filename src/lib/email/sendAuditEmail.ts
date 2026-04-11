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
      <div style="text-align:center; margin:30px 0;">
        <a href="${reportUrl}" 
          style="
            background:#FF7A00;
            color:#fff;
            padding:14px 28px;
            border-radius:10px;
            text-decoration:none;
            font-weight:bold;
            display:inline-block;
          ">
          View Your Report
        </a>
      </div>

      <!-- CTA: Feedback -->
      <div style="text-align:center; margin:10px 0 30px;">
        <a href="${feedbackUrl}" 
          style="
            background:#000;
            color:#fff;
            padding:12px 24px;
            border-radius:10px;
            text-decoration:none;
            font-weight:bold;
            display:inline-block;
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
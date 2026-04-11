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
<div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background:#F7F7F7; padding:40px 16px;">

  <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:24px; padding:40px 32px; box-shadow:0 20px 60px rgba(0,0,0,0.06); border:1px solid rgba(255,122,0,0.08);">

    <!-- Logo -->
    <div style="text-align:center; margin-bottom:26px;">
      <img src="https://www.elessenlabs.com/logo.png" style="height:34px;" />
    </div>

    <!-- Pill Label -->
    <div style="text-align:center; margin-bottom:18px;">
      <span style="
        display:inline-block;
        font-size:11px;
        letter-spacing:0.18em;
        color:#FF7A00;
        border:1px solid rgba(255,122,0,0.25);
        padding:6px 14px;
        border-radius:999px;
        background:#FFF7F1;
        font-weight:600;
      ">
        ELESSEN AUDIT ENGINE™
      </span>
    </div>

    <!-- Title -->
    <h1 style="font-size:24px; text-align:center; margin:0 0 12px 0; color:#111; font-weight:600;">
      Your Audit Report is Ready
    </h1>

    <!-- Intro -->
    <p style="text-align:center; font-size:15px; color:#555; line-height:1.7; margin-bottom:28px;">
      Hello ${name || "there"},<br/><br/>
      Your product audit has been completed and is ready for review.
    </p>

    <!-- Primary CTA -->
    <div style="text-align:center; margin-bottom:18px;">
      <a href="${reportUrl}" 
        style="
          background:#FF7A00;
          color:#000;
          padding:16px 30px;
          border-radius:14px;
          text-decoration:none;
          font-weight:600;
          display:inline-block;
          font-size:15px;
          box-shadow:0 10px 24px rgba(255,122,0,0.25);
        ">
        View Your Report
      </a>
    </div>

    <!-- Feedback Copy -->
    <p style="text-align:center; font-size:13px; color:#666; margin:18px 0 10px;">
      We’d really value your feedback — it helps us improve every report we deliver.
    </p>

    <!-- Secondary CTA -->
    <div style="text-align:center; margin-bottom:30px;">
      <a href="${feedbackUrl}" 
        style="
          background:#E6F6EA;
          color:#000;
          padding:13px 26px;
          border-radius:14px;
          text-decoration:none;
          font-weight:600;
          display:inline-block;
          font-size:14px;
          border:1px solid rgba(0,0,0,0.06);
        ">
        Share Feedback
      </a>
    </div>

    <!-- Divider -->
    <div style="height:1px; background:#EFEFEF; margin:28px 0;"></div>

    <!-- Footer -->
    <div style="text-align:center; font-size:13px; color:#888; line-height:1.6;">
      <div style="margin-bottom:6px;">Tanya Emma</div>
      <div style="font-weight:600; color:#222;">Founder, Elessen Labs</div>
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
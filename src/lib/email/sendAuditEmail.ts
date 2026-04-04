import nodemailer from "nodemailer";

type SendAuditEmailInput = {
  email: string;
  name?: string | null;
  auditId: string;
};

export async function sendAuditEmail({
  email,
  name,
  auditId,
}: SendAuditEmailInput) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const auditLink = `https://elessenlabs.com/audit/result/${auditId}`;

  await transporter.sendMail({
    from: `"Tanya from Elessen Labs" <hello@elessenlabs.com>`,
    to: email,
    subject: "Your Elessen Audit Report is Ready",
    html: `
      <p>Hi ${name || "there"},</p>

      <p>Your Elessen Audit Report is ready.</p>

      <p><a href="${auditLink}">View your audit</a></p>

      <br/>

      <p>
        I personally reviewed the output structure behind this system,
        and I’d be happy to walk you through the findings.
      </p>

      <p>
        You can book a <strong>free 15-minute call</strong> here:
        <br/>
        <a href="https://calendly.com/elessenlabs/product_clarity_call">
          Book your session
        </a>
      </p>

      <p><strong>This offer expires in 30 days.</strong></p>

      <br/>

      <p>– Tanya Emma Elessen<br/>Founder, Elessen Labs</p>
    `,
  });
}
import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing");
    return null;
  }

  return new Resend(apiKey);
}

function baseTemplate(content: string, siteUrl: string) {
  return `
  <div style="background:#f6f7f9; padding:40px 16px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width:560px; margin:0 auto;">
      
      <!-- Container -->
      <div style="background:#ffffff; border-radius:20px; padding:32px 28px; box-shadow:0 10px 30px rgba(0,0,0,0.06);">

        <!-- Logo -->
        <div style="text-align:center; margin-bottom:24px;">
          <img src="${siteUrl}/logo.png" style="height:34px;" />
        </div>

        ${content}

      </div>

      <!-- Footer -->
      <div style="text-align:center; font-size:12px; color:#888; margin-top:16px;">
        © ${new Date().getFullYear()} Elessen Labs
      </div>

    </div>
  </div>
  `;
}

/* ============================= */
/* ADMIN NOTIFICATION */
/* ============================= */

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

  const content = `
    <h2 style="text-align:center; margin-bottom:16px;">New Audit Request</h2>

    <p style="color:#444; text-align:center;">
      <strong>${name}</strong> submitted a new audit request.
    </p>

    <p style="text-align:center; font-size:13px; color:#777;">
      ${productUrl}
    </p>
  `;

  await resend.emails.send({
    from: "Elessen <hello@elessenlabs.com>",
    to: ["hello@elessenlabs.com", "tanya@elessenlabs.com"],
    subject: "New Audit Request Submitted",
    html: baseTemplate(content, siteUrl),
  });
}

/* ============================= */
/* PAYMENT CONFIRMATION */
/* ============================= */

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

  const content = `
    <h2 style="text-align:center; margin-bottom:12px;">Payment received</h2>

    <p style="text-align:center; color:#555; line-height:1.6;">
      Hi ${name},<br/><br/>
      Your audit is now in review.
    </p>

    <div style="text-align:center; margin:28px 0;">
      <a href="${auditUrl}" style="
        background:#FF7A00;
        color:#000;
        padding:14px 28px;
        border-radius:12px;
        text-decoration:none;
        font-weight:600;
        display:inline-block;
      ">
        View Your Audit
      </a>
    </div>

    <p style="text-align:center; font-size:13px; color:#777;">
      Product: ${productUrl}
    </p>
  `;

  await resend.emails.send({
    from: "Elessen <hello@elessenlabs.com>",
    to: email,
    subject: "Payment received — your audit is in review",
    html: baseTemplate(content, siteUrl),
  });
}

/* ============================= */
/* INVITE ADMIN */
/* ============================= */

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

  const content = `
    <h2 style="text-align:center;">New Invite Audit</h2>

    <p style="text-align:center; color:#555;">
      ${name} (${email})
    </p>

    <p style="text-align:center; font-size:13px; color:#777;">
      ${productUrl}
    </p>

    <div style="text-align:center; margin:24px 0;">
      <a href="${reviewUrl}" style="
        background:#000;
        color:#fff;
        padding:12px 24px;
        border-radius:10px;
        text-decoration:none;
        font-weight:600;
      ">
        Review Queue
      </a>
    </div>
  `;

  await resend.emails.send({
    from: "Elessen <hello@elessenlabs.com>",
    to: ["hello@elessenlabs.com", "tanya@elessenlabs.com"],
    subject: "New Invite Audit Submitted",
    html: baseTemplate(content, siteUrl),
  });
}

/* ============================= */
/* INVITE USER CONFIRMATION */
/* ============================= */

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

  const content = `
    <h2 style="text-align:center;">Audit in progress</h2>

    <p style="text-align:center; color:#555; line-height:1.6;">
      Hi ${name},<br/><br/>
      Your audit is being reviewed and will be delivered shortly.
    </p>

    <p style="text-align:center; font-size:13px; color:#777;">
      ${productUrl}
    </p>
  `;

  await resend.emails.send({
    from: "Elessen <hello@elessenlabs.com>",
    to: email,
    subject: "Your audit is in progress",
    html: baseTemplate(content, siteUrl),
  });
}

/* ============================= */
/* INVITE DELIVERY (UPDATED) */
/* ============================= */

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const auditUrl = `${siteUrl}/audit/result/${auditId}`;
  const feedbackUrl = `${siteUrl}/feedback/${auditId}`;

  const content = `
    <h2 style="text-align:center; margin-bottom:12px;">
      Your Audit Report is Ready
    </h2>

    <p style="text-align:center; color:#555; line-height:1.6;">
      Hello ${name || "there"},<br/><br/>
      Your audit has been reviewed and is ready.
    </p>

    <!-- CTA Report -->
    <div style="text-align:center; margin:30px 0 12px;">
      <a href="${auditUrl}" style="
        background:#FF7A00;
        color:#000;
        padding:16px 30px;
        border-radius:12px;
        text-decoration:none;
        font-weight:600;
        display:inline-block;
        box-shadow:0 6px 16px rgba(255,122,0,0.25);
      ">
        View Your Report
      </a>
    </div>

    <p style="text-align:center; font-size:13px; color:#666;">
      We’d really value your feedback — it helps us improve every report.
    </p>

    <!-- CTA Feedback -->
    <div style="text-align:center; margin:12px 0 28px;">
      <a href="${feedbackUrl}" style="
        background:#DFF5E3;
        color:#000;
        padding:14px 26px;
        border-radius:12px;
        text-decoration:none;
        font-weight:600;
        display:inline-block;
      ">
        Share Feedback
      </a>
    </div>

    <div style="text-align:center; font-size:14px;">
      <strong>Tanya Emma</strong><br/>
      <span style="color:#777;">Founder, Elessen Labs</span>
    </div>
  `;

  await resend.emails.send({
    from: "Elessen <hello@elessenlabs.com>",
    to: email,
    cc: "hello@elessenlabs.com",
    subject: "Your Elessen Audit Report is Ready",
    html: baseTemplate(content, siteUrl),
  });
}
export async function sendStartFlowRecommendationEmail({
  email,
  name,
  recommendationTitle,
  recommendationSubtitle,
  recommendationWhy,
  recommendationNext,
  bookingUrl,
}: {
  email: string;
  name?: string;
  recommendationTitle: string;
  recommendationSubtitle: string;
  recommendationWhy: string[];
  recommendationNext: string[];
  bookingUrl: string;
}) {
  const resend = getResendClient();
  if (!resend) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const content = `
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
        PRODUCT CLARITY RECOMMENDATION
      </span>
    </div>

    <h2 style="text-align:center; margin-bottom:12px; font-size:28px; color:#111;">
      ${recommendationTitle}
    </h2>

    <p style="text-align:center; color:#555; line-height:1.7; font-size:15px; margin:0 0 24px;">
      Hi ${name || "there"},<br/><br/>
      Here’s the recommendation based on what you shared.
    </p>

    <div style="
      background:#FAFAFA;
      border:1px solid rgba(0,0,0,0.06);
      border-radius:16px;
      padding:18px;
      margin-bottom:22px;
    ">
      <div style="font-size:15px; color:#222; line-height:1.7;">
        ${recommendationSubtitle}
      </div>
    </div>

    <div style="margin-bottom:22px;">
      <div style="font-weight:600; color:#111; margin-bottom:10px;">Why this fits</div>
      <ul style="padding-left:18px; margin:0; color:#555; line-height:1.8; font-size:14px;">
        ${recommendationWhy.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>

    <div style="margin-bottom:28px;">
      <div style="font-weight:600; color:#111; margin-bottom:10px;">What happens next</div>
      <ul style="padding-left:18px; margin:0; color:#555; line-height:1.8; font-size:14px;">
        ${recommendationNext.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>

    <div style="text-align:center; margin:30px 0 12px;">
      <a href="${bookingUrl}" style="
        background:#FF7A00;
        color:#000;
        padding:16px 30px;
        border-radius:12px;
        text-decoration:none;
        font-weight:600;
        display:inline-block;
        box-shadow:0 6px 16px rgba(255,122,0,0.25);
      ">
        Book Product Clarity Call
      </a>
    </div>

    <p style="text-align:center; font-size:13px; color:#777; line-height:1.6; margin-top:16px;">
      Save this email and come back to it anytime. Your recommendation and booking link will be here when you're ready.
    </p>

    <div style="height:1px; background:#EFEFEF; margin:28px 0;"></div>

    <div style="text-align:center; font-size:13px; color:#888; line-height:1.6;">
      <div style="margin-bottom:6px;">Tanya Emma</div>
      <div style="font-weight:600; color:#222;">Founder, Elessen Labs</div>
    </div>
  `;

  await resend.emails.send({
    from: "Elessen Labs <hello@elessenlabs.com>",
    to: email,
    subject: `Your recommendation: ${recommendationTitle}`,
    html: baseTemplate(content, siteUrl),
  });
}
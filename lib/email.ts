import "server-only";

/**
 * Transactional email via Resend's HTTP API (no SDK needed). Configure with:
 *   RESEND_API_KEY   - API key from resend.com
 *   EMAIL_FROM       - a verified sender, e.g. "product x <hello@yourdomain.com>"
 * Without them, emails are skipped (and logged in development) so the app still works.
 */
export type Email = { to: string; subject: string; html: string; text: string };

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(email: Email): Promise<boolean> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email skipped - RESEND_API_KEY/EMAIL_FROM not set] to=${email.to} subject="${email.subject}"`);
    }
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, ...email }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("sendEmail failed:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (error) {
    // Email is best-effort: never let a provider outage break enrollment or progress.
    console.error("sendEmail error:", error instanceof Error ? error.message : error);
    return false;
  }
}

/** Escape user-provided text before placing it in HTML. */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f5fb;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f1222">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td>
<p style="margin:0 0 20px;font-size:18px;font-weight:800;letter-spacing:-0.02em">product x</p>
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.25">${escapeHtml(title)}</h1>
${bodyHtml}
</td></tr></table>
<p style="margin:16px 0 0;font-size:12px;color:#6b7280">You're receiving this because of activity on product x.</p>
</td></tr></table></body></html>`;
}

const p = (html: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151">${html}</p>`;
const button = (href: string, label: string) =>
  `<p style="margin:22px 0 4px"><a href="${escapeHtml(href)}" style="display:inline-block;background:#5b5bf0;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${escapeHtml(label)}</a></p>`;

export function resourceReceiptEmail(to: string, name: string, courseTitle: string | null, coursesUrl: string): Email {
  const topic = courseTitle ? `for ${courseTitle}` : "you asked about";
  return {
    to,
    subject: courseTitle ? `Your resources for ${courseTitle}` : "We got your request",
    html: layout(
      `Thanks, ${name.split(" ")[0]}!`,
      p(`We've received your request for the course materials ${escapeHtml(topic)}. A member of the team will follow up with them shortly.`) +
        p("In the meantime, you can start learning right away — every course is free to enroll in.") +
        button(coursesUrl, "Browse courses")
    ),
    text: `Thanks, ${name}! We've received your request for the course materials ${topic}. We'll follow up shortly.\n\nBrowse courses: ${coursesUrl}`,
  };
}

export function adminNewRequestEmail(to: string, name: string, email: string, courseTitle: string | null, adminUrl: string): Email {
  return {
    to,
    subject: `New resource request from ${name}`,
    html: layout(
      "New resource request",
      p(`<strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) asked for resources${courseTitle ? ` for <strong>${escapeHtml(courseTitle)}</strong>` : ""}.`) +
        button(adminUrl, "Open the inbox")
    ),
    text: `${name} <${email}> asked for resources${courseTitle ? ` for ${courseTitle}` : ""}.\n\nInbox: ${adminUrl}`,
  };
}

export function certificateEmail(to: string, name: string, courseTitle: string, certificateUrl: string): Email {
  return {
    to,
    subject: `You completed ${courseTitle} — here's your certificate`,
    html: layout(
      "Congratulations, you did it!",
      p(`${escapeHtml(name)}, you've finished every lesson in <strong>${escapeHtml(courseTitle)}</strong>. Your certificate is ready to view, print, and share.`) +
        button(certificateUrl, "View your certificate")
    ),
    text: `Congratulations ${name}! You completed ${courseTitle}.\n\nYour certificate: ${certificateUrl}`,
  };
}

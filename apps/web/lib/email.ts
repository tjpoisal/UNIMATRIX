/**
 * Email utility — uses Resend API.
 * Set RESEND_API_KEY in your .env.local to send real emails.
 * In development without the key, emails are logged to the console instead.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'Unimatrix <noreply@unimatrix.app>';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  // Dev fallback — log to console if no API key is set
  if (!RESEND_API_KEY) {
    console.log('\n📧 [EMAIL — dev mode, no RESEND_API_KEY set]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html}\n`);
    return { success: true, dev: true };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return res.json();
}

export function passwordResetEmail(resetUrl: string, email: string) {
  return {
    subject: 'Reset your Unimatrix password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0A0F1C; color:#F1F5F9; padding:40px 20px; min-height:100vh;">
        <div style="max-width:480px; margin:0 auto; background:#111827; border:1px solid #334155; border-radius:16px; padding:40px;">
          <h1 style="font-size:24px; font-weight:700; margin:0 0 8px; color:#F1F5F9;">Reset your password</h1>
          <p style="color:#94A3B8; margin:0 0 32px; font-size:14px;">One memory. Every AI. Any device.</p>

          <p style="color:#CBD5E1; margin:0 0 24px;">
            We received a request to reset the password for <strong style="color:#F1F5F9;">${email}</strong>.
            Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
          </p>

          <a href="${resetUrl}" style="display:inline-block; background:#00F5FF; color:#0A0F1C; font-weight:700; font-size:15px; padding:12px 28px; border-radius:8px; text-decoration:none; margin-bottom:24px;">
            Reset password
          </a>

          <p style="color:#64748B; font-size:13px; margin:24px 0 0;">
            If you didn't request this, you can safely ignore this email — your password won't change.
          </p>

          <hr style="border:none; border-top:1px solid #334155; margin:24px 0;" />

          <p style="color:#475569; font-size:12px; margin:0;">
            Or copy and paste this link into your browser:<br />
            <span style="color:#00F5FF; word-break:break-all;">${resetUrl}</span>
          </p>
        </div>
      </div>
    `,
  };
}

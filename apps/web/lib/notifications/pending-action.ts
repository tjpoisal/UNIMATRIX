/**
 * Notifications for Pending Actions (HITL)
 * Supports Resend (email) and Slack webhooks.
 */

// Resend client loaded dynamically only if API key present (avoids require + optional dep issues in CI/lint/typecheck)
let resend: any = null;

interface PendingActionNotification {
  id: string;
  roomId: string;
  agentName: string;
  toolName: string;
  requestedBy?: string;
  organizationName?: string;
}

export async function notifyPendingActionCreated(action: PendingActionNotification) {
  const subject = `[Unimatrix HITL] Approval needed for ${action.agentName} → ${action.toolName}`;

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px;">
      <h2>Human-in-the-Loop Approval Required</h2>
      <p><strong>Agent:</strong> ${action.agentName}</p>
      <p><strong>Tool:</strong> ${action.toolName}</p>
      <p><strong>Requested by:</strong> ${action.requestedBy || 'unknown'}</p>
      <p><strong>Room:</strong> ${action.roomId}</p>
      
      <p style="margin: 24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://deployunimatrix.com'}/pending-actions/${action.id}" 
           style="background:#00F5FF;color:#0A0F1C;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
          Review & Approve
        </a>
      </p>
      
      <small>This action will be blocked until approved.</small>
    </div>
  `;

  // Email via Resend (if configured) - dynamic import to avoid static require/any in lint/typecheck
  if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
    try {
      const { Resend } = await import('resend');
      const client = new Resend(process.env.RESEND_API_KEY);
      await client.emails.send({
        from: process.env.EMAIL_FROM,
        to: process.env.HITL_NOTIFICATION_EMAIL || 'alerts@deployunimatrix.com',
        subject,
        html,
      });
    } catch (_e) {
      console.error('[notifications] Resend failed:', _e);
    }
  }

  // Slack webhook (if configured)
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: subject,
          attachments: [
            {
              color: '#00F5FF',
              fields: [
                { title: 'Agent', value: action.agentName, short: true },
                { title: 'Tool', value: action.toolName, short: true },
                { title: 'Room', value: action.roomId, short: true },
              ],
              actions: [
                {
                  type: 'button',
                  text: 'Review Action',
                  url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/pending-actions/${action.id}`,
                },
              ],
            },
          ],
        }),
      });
    } catch (_e) {
      console.error('[notifications] Slack webhook failed:', _e);
    }
  }
}

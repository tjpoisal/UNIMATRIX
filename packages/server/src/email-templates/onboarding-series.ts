/**
 * Email Onboarding Series
 * Automated emails to guide users through adoption
 */

export const onboardingEmails = {
  // Day 0: Welcome
  welcome: {
    subject: 'Welcome to Unimatrix — Your AI remembers everything now',
    preheader: 'Set up your encrypted memory vault in 5 minutes',
    template: 'welcome',
    html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1030; color: #f1f5f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; border-radius: 12px; padding: 40px; border: 1px solid rgba(255, 122, 0, 0.2);">

    <h1 style="font-size: 28px; margin: 0 0 16px 0;">🏛️ Welcome to Your Memory Palace</h1>

    <p style="color: #94a3b8; margin: 0 0 24px 0; line-height: 1.6;">
      You just took a massive step toward AI continuity. Your memories are now encrypted and stored—accessible from ChatGPT, Claude, Gemini, or anywhere.
    </p>

    <div style="background: #1f2937; border-left: 4px solid #ff7a00; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #94a3b8; font-size: 13px;">
        <strong>Next step (< 5 min):</strong> Verify your encryption password is saved somewhere safe. You can't reset it.
      </p>
    </div>

    <p style="color: #94a3b8; margin: 24px 0; line-height: 1.6;">
      <strong>What you can do right now:</strong>
    </p>
    <ul style="color: #94a3b8; margin: 0 0 24px 0; padding-left: 20px; line-height: 1.8;">
      <li>Save your first memory from this conversation</li>
      <li>Install the browser extension to save from ChatGPT/Gemini</li>
      <li>Configure Claude Desktop for MCP access</li>
    </ul>

    <a href="https://deployunimatrix.com/dashboard" style="display: inline-block; background: #ff7a00; color: #0e1030; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 24px 0;">
      Go to Dashboard →
    </a>

    <p style="color: #64748b; font-size: 12px; margin: 24px 0 0 0;">
      Questions? <a href="https://deployunimatrix.com/help" style="color: #ff7a00; text-decoration: none;">View help center</a>
    </p>
  </div>
</div>
    `,
  },

  // Day 1: Encryption Setup
  encryptionSetup: {
    subject: 'Your encryption password is the key to your memory palace',
    preheader: "Make sure you've saved it somewhere safe",
    template: 'encryption-setup',
    html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1030; color: #f1f5f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; border-radius: 12px; padding: 40px; border: 1px solid rgba(255, 122, 0, 0.2);">

    <h1 style="font-size: 28px; margin: 0 0 16px 0;">🔐 Protect Your Encryption Password</h1>

    <p style="color: #94a3b8; margin: 0 0 24px 0; line-height: 1.6;">
      Your encryption password is critical. It's NOT your account password—it's what encrypts every single memory.
    </p>

    <div style="background: #ff7a00; color: #0e1030; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: bold;">
        ⚠️ If you lose it, we can't recover it. Memories will be permanently encrypted.
      </p>
    </div>

    <p style="color: #94a3b8; margin: 24px 0; line-height: 1.6;">
      <strong>What to do RIGHT NOW:</strong>
    </p>
    <ol style="color: #94a3b8; margin: 0 0 24px 0; padding-left: 20px; line-height: 1.8;">
      <li>Open your password manager (1Password, Bitwarden, etc.)</li>
      <li>Create a new entry for "Unimatrix Encryption Password"</li>
      <li>Paste your encryption password there</li>
      <li>Save it in multiple places if paranoid (you should be)</li>
    </ol>

    <a href="https://deployunimatrix.com/help" style="display: inline-block; background: #ff7a00; color: #0e1030; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 24px 0;">
      Password manager recommendation →
    </a>

    <p style="color: #64748b; font-size: 12px; margin: 24px 0 0 0;">
      Still have your password? Mark this email as done and move on to Day 3.
    </p>
  </div>
</div>
    `,
  },

  // Day 3: First Memory
  firstMemory: {
    subject: 'Time to save your first memory',
    preheader: 'Take 2 minutes to capture something important',
    template: 'first-memory',
    html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1030; color: #f1f5f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; border-radius: 12px; padding: 40px; border: 1px solid rgba(255, 122, 0, 0.2);">

    <h1 style="font-size: 28px; margin: 0 0 16px 0;">💾 Save Your First Memory</h1>

    <p style="color: #94a3b8; margin: 0 0 24px 0; line-height: 1.6;">
      The best time to save a memory is RIGHT AFTER you learn something. Don't wait.
    </p>

    <div style="background: #1f2937; border-left: 4px solid #ff7a00; padding: 16px; margin: 24px 0; border-radius: 4px;">
      <p style="margin: 0; color: #94a3b8; font-size: 13px;">
        <strong>Examples of memories:</strong><br/>
        "Python: list comprehension is 3x faster than loops"<br/>
        "React: useCallback prevents re-renders on memoized children"<br/>
        "Conversation with Claude: why AI agents fail without memory"
      </p>
    </div>

    <p style="color: #94a3b8; margin: 24px 0 0 0;">
      <a href="https://deployunimatrix.com/dashboard" style="color: #ff7a00; text-decoration: none;">Go to dashboard →</a> and click "New Memory"
    </p>
  </div>
</div>
    `,
  },

  // Day 5: Browser Extension
  browserExtension: {
    subject: 'Save from ChatGPT, Claude, or Gemini instantly',
    preheader: 'Install the Unimatrix extension in 30 seconds',
    template: 'browser-extension',
    html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1030; color: #f1f5f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; border-radius: 12px; padding: 40px; border: 1px solid rgba(255, 122, 0, 0.2);">

    <h1 style="font-size: 28px; margin: 0 0 16px 0;">🌐 Install the Browser Extension</h1>

    <p style="color: #94a3b8; margin: 0 0 24px 0; line-height: 1.6;">
      This is where the magic happens. While chatting in ChatGPT or Claude, a button appears. One click = memory saved, encrypted, and backed up.
    </p>

    <div style="background: #1f2937; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
      <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 13px;">
        <strong>Supported platforms:</strong>
      </p>
      <p style="margin: 0; color: #ff7a00; font-size: 14px; font-weight: bold;">
        ChatGPT • Claude • Gemini • Perplexity • Grok
      </p>
    </div>

    <a href="https://chrome.google.com/webstore" style="display: inline-block; background: #ff7a00; color: #0e1030; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 24px 0;">
      Add to Chrome →
    </a>

    <p style="color: #64748b; font-size: 12px; margin: 24px 0 0 0;">
      Takes 30 seconds. You'll see the "💾 Save to Unimatrix" button on every LLM site after.
    </p>
  </div>
</div>
    `,
  },

  // Day 7: MCP Setup
  mcpSetup: {
    subject: 'Connect to Claude Desktop (recall memories in real-time)',
    preheader: 'Configure Unimatrix in 5 minutes',
    template: 'mcp-setup',
    html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1030; color: #f1f5f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; border-radius: 12px; padding: 40px; border: 1px solid rgba(255, 122, 0, 0.2);">

    <h1 style="font-size: 28px; margin: 0 0 16px 0;">🤖 Connect to Claude Desktop</h1>

    <p style="color: #94a3b8; margin: 0 0 24px 0; line-height: 1.6;">
      This is the final piece. Now Claude can RECALL your memories directly in conversations.
    </p>

    <p style="color: #94a3b8; margin: 24px 0; line-height: 1.6;">
      <strong>What this enables:</strong>
    </p>
    <ul style="color: #94a3b8; margin: 0 0 24px 0; padding-left: 20px; line-height: 1.8;">
      <li>@unimatrix recall "python recursion"</li>
      <li>@unimatrix remember "JavaScript async/await explained"</li>
      <li>Full conversation history across all LLMs</li>
    </ul>

    <a href="https://deployunimatrix.com/setup/claude-desktop" style="display: inline-block; background: #ff7a00; color: #0e1030; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 24px 0;">
      Get Configuration →
    </a>

    <p style="color: #64748b; font-size: 12px; margin: 24px 0 0 0;">
      You're officially part of the future of AI memory. Welcome to the palace. 🏛️
    </p>
  </div>
</div>
    `,
  },

  // Day 14: Re-engagement (inactive users)
  reengagement: {
    subject: 'You have a week of memories waiting',
    preheader: "Check out what you've been saving",
    template: 're-engagement',
    html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0e1030; color: #f1f5f9; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; border-radius: 12px; padding: 40px; border: 1px solid rgba(255, 122, 0, 0.2);">

    <h1 style="font-size: 28px; margin: 0 0 16px 0;">📚 Your Memories Are Waiting</h1>

    <p style="color: #94a3b8; margin: 0 0 24px 0; line-height: 1.6;">
      We noticed you haven't checked your palace in a while. You might be surprised how useful it's become.
    </p>

    <a href="https://deployunimatrix.com/dashboard" style="display: inline-block; background: #ff7a00; color: #0e1030; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 24px 0;">
      View Dashboard →
    </a>

    <p style="color: #64748b; font-size: 12px; margin: 24px 0 0 0;">
      Is something broken? <a href="https://deployunimatrix.com/help" style="color: #ff7a00; text-decoration: none;">Let us know →</a>
    </p>
  </div>
</div>
    `,
  },
};

/**
 * Email trigger logic
 * Call this on signup to schedule all onboarding emails
 */
export async function scheduleOnboardingEmails(userId: string, email: string) {
  const schedule = [
    { delay: 0, type: 'welcome' },
    { delay: 86400, type: 'encryptionSetup' }, // Day 1
    { delay: 259200, type: 'firstMemory' }, // Day 3
    { delay: 432000, type: 'browserExtension' }, // Day 5
    { delay: 604800, type: 'mcpSetup' }, // Day 7
    { delay: 1209600, type: 'reengagement' }, // Day 14
  ];

  for (const item of schedule) {
    // Queue email for scheduled delivery
    // Implementation depends on your email provider (Resend, SendGrid, etc.)
    console.log(`Schedule ${item.type} email for ${email} in ${item.delay}s`);
  }
}

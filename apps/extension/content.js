/**
 * content.js — Unimatrix Extension Content Script
 *
 * Injected into: ChatGPT, Claude web, Gemini, Copilot, Grok, Perplexity
 *
 * What it does:
 * 1. Adds a floating "Save to Unimatrix" button on every supported LLM page
 * 2. DOM observers that detect new AI responses finishing (per-site)
 * 3. Auto-capture: extracts the full conversation when the button is clicked
 * 4. Optional: injects a system-prompt reminder when a new chat is detected
 * 5. Responds to EXTRACT_CONVERSATION messages from the background worker
 */

(function () {
  'use strict';

  // Prevent double-injection
  if (window.__unimatrix_injected) return;
  window.__unimatrix_injected = true;

  // ── Site detection ─────────────────────────────────────────────────────────

  const SITE = (() => {
    const h = location.hostname;
    if (h.includes('chat.openai.com') || h.includes('chatgpt.com')) return 'chatgpt';
    if (h.includes('claude.ai'))         return 'claude';
    if (h.includes('gemini.google'))     return 'gemini';
    if (h.includes('copilot.microsoft')) return 'copilot';
    if (h.includes('x.com') && location.pathname.startsWith('/grok')) return 'grok';
    if (h.includes('grok.x.ai'))         return 'grok';
    if (h.includes('perplexity.ai'))     return 'perplexity';
    if (h.includes('huggingface.co'))    return 'huggingface';
    return 'unknown';
  })();

  // ── Per-site DOM selectors ─────────────────────────────────────────────────

  const SELECTORS = {
    chatgpt: {
      messages:       '[data-message-author-role]',
      assistantRole:  'assistant',
      userRole:       'user',
      roleAttr:       'data-message-author-role',
      textContent:    '.markdown, .text-base',
      newChatBtn:     'a[href="/"], nav a[href="/"]',
    },
    claude: {
      messages:       '[data-testid="human-turn"], [data-testid="ai-turn"]',
      assistantAttr:  'data-testid',
      assistantVal:   'ai-turn',
      userVal:        'human-turn',
      textContent:    '.font-claude-message, p',
    },
    gemini: {
      messages:       'message-content, model-response, user-query',
      textContent:    '.response-content, p, .query-text',
    },
    copilot: {
      messages:       '[data-testid="message"]',
      textContent:    '.ac-textBlock, p',
    },
    grok: {
      messages:       '[class*="message"], [class*="Message"]',
      textContent:    'p, [class*="content"]',
    },
    perplexity: {
      messages:       '[data-testid="answer"], .prose, [class*="answer"]',
      textContent:    'p, li',
    },
    huggingface: {
      messages:       '.message, .chat-message',
      textContent:    'p, .message-content',
    },
    unknown: {
      messages:       '.message, .chat-message, [class*="message"]',
      textContent:    'p',
    },
  };

  const sel = SELECTORS[SITE] || SELECTORS.unknown;

  // ── Conversation extraction ────────────────────────────────────────────────

  function extractConversation() {
    const messages = [];
    const els = document.querySelectorAll(sel.messages);

    if (SITE === 'chatgpt') {
      els.forEach(el => {
        const role = el.getAttribute('data-message-author-role');
        const textEl = el.querySelector('.markdown, .prose, [class*="prose"]') || el;
        const text = textEl.innerText?.trim();
        if (text && role) messages.push({ role, content: text });
      });
    } else if (SITE === 'claude') {
      els.forEach(el => {
        const testId = el.getAttribute('data-testid') || '';
        const role = testId.includes('human') ? 'user' : 'assistant';
        const text = el.innerText?.trim();
        if (text) messages.push({ role, content: text });
      });
    } else if (SITE === 'gemini') {
      // Gemini alternates: user queries and model responses
      document.querySelectorAll('user-query').forEach(el => {
        const text = el.innerText?.trim();
        if (text) messages.push({ role: 'user', content: text });
      });
      document.querySelectorAll('model-response, message-content').forEach(el => {
        const text = el.innerText?.trim();
        if (text) messages.push({ role: 'assistant', content: text });
      });
    } else if (SITE === 'perplexity') {
      // Perplexity: questions in inputs, answers in prose blocks
      const answers = document.querySelectorAll('.prose, [class*="answer"], [data-testid="answer"]');
      answers.forEach((el, i) => {
        const text = el.innerText?.trim();
        if (text) messages.push({ role: 'assistant', content: text });
      });
    } else {
      // Generic fallback
      els.forEach(el => {
        const text = el.innerText?.trim();
        if (text) messages.push({ role: 'assistant', content: text });
      });
    }

    if (messages.length === 0) {
      // Last-resort: grab all visible text from the main content area
      const main = document.querySelector('main') || document.body;
      const fallback = main.innerText?.trim().slice(0, 4000);
      if (fallback) messages.push({ role: 'assistant', content: fallback });
    }

    return messages;
  }

  function formatConversationForStorage(messages) {
    if (!messages.length) return '';
    return messages
      .map(m => `**${m.role === 'user' ? 'User' : 'AI'}:** ${m.content}`)
      .join('\n\n---\n\n');
  }

  function getPageTitle() {
    return document.title?.replace(' - ChatGPT', '').replace(' - Claude', '').trim() || SITE;
  }

  // ── Floating Save Button ───────────────────────────────────────────────────

  let saveBtn = null;
  let toastEl = null;

  function createSaveButton() {
    if (saveBtn) return;

    saveBtn = document.createElement('button');
    saveBtn.id = '__unimatrix_save_btn';
    saveBtn.setAttribute('aria-label', 'Save to Unimatrix Memory');
    saveBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      Save to Memory
    `;

    Object.assign(saveBtn.style, {
      position:        'fixed',
      bottom:          '24px',
      right:           '24px',
      zIndex:          '2147483647',
      display:         'flex',
      alignItems:      'center',
      gap:             '7px',
      padding:         '10px 16px',
      background:      '#ff7a00',
      color:           '#0e1030',
      border:          'none',
      borderRadius:    '10px',
      fontSize:        '13px',
      fontWeight:      '700',
      fontFamily:      '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      cursor:          'pointer',
      boxShadow:       '0 4px 20px rgba(255,122,0,0.4)',
      transition:      'all 0.15s ease',
      letterSpacing:   '0.01em',
      userSelect:      'none',
    });

    saveBtn.addEventListener('mouseenter', () => {
      saveBtn.style.background    = '#e86d00';
      saveBtn.style.transform     = 'translateY(-2px)';
      saveBtn.style.boxShadow     = '0 6px 24px rgba(255,122,0,0.5)';
    });
    saveBtn.addEventListener('mouseleave', () => {
      saveBtn.style.background    = '#ff7a00';
      saveBtn.style.transform     = 'none';
      saveBtn.style.boxShadow     = '0 4px 20px rgba(255,122,0,0.4)';
    });

    saveBtn.addEventListener('click', handleSaveClick);
    document.body.appendChild(saveBtn);
  }

  function showToast(message, type = 'success') {
    if (toastEl) toastEl.remove();
    toastEl = document.createElement('div');
    toastEl.innerText = message;
    const colors = {
      success: { bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)',  text: '#22c55e' },
      error:   { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   text: '#ef4444' },
      info:    { bg: 'rgba(255,122,0,0.15)',   border: 'rgba(255,122,0,0.4)',   text: '#ff7a00' },
    };
    const c = colors[type] || colors.info;
    Object.assign(toastEl.style, {
      position:     'fixed',
      bottom:       '76px',
      right:        '24px',
      zIndex:       '2147483647',
      padding:      '10px 16px',
      background:   c.bg,
      border:       `1px solid ${c.border}`,
      borderRadius: '8px',
      color:        c.text,
      fontSize:     '13px',
      fontWeight:   '600',
      fontFamily:   '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      boxShadow:    '0 2px 12px rgba(0,0,0,0.3)',
      maxWidth:     '280px',
      lineHeight:   '1.4',
      backdropFilter: 'blur(8px)',
    });
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl?.remove(), 3500);
  }

  async function handleSaveClick() {
    const originalHTML = saveBtn.innerHTML;
    saveBtn.innerHTML = `
      <span style="display:inline-block;width:12px;height:12px;border:2px solid rgba(14,16,48,0.3);border-top-color:#0e1030;border-radius:50%;animation:umx-spin 0.7s linear infinite"></span>
      Saving…
    `;
    saveBtn.disabled = true;

    // Inject keyframes once
    if (!document.getElementById('__umx_styles')) {
      const style = document.createElement('style');
      style.id = '__umx_styles';
      style.textContent = `@keyframes umx-spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }

    const messages = extractConversation();
    if (!messages.length) {
      showToast('No conversation found on this page.', 'error');
      saveBtn.innerHTML = originalHTML;
      saveBtn.disabled = false;
      return;
    }

    const content = formatConversationForStorage(messages);
    const title   = getPageTitle();
    const summary = messages[messages.length - 1]?.content?.slice(0, 120) || title;

    const result = await new Promise(resolve =>
      chrome.runtime.sendMessage({
        type:    'STORE_MEMORY',
        payload: {
          content:   `# ${title}\n\n${content}`,
          palaceName: 'Web Captures',
          location:   SITE.charAt(0).toUpperCase() + SITE.slice(1),
          tags:       [SITE, 'conversation', 'web-capture'],
          sourceLlm: SITE,
        },
      }, resolve)
    );

    saveBtn.innerHTML = originalHTML;
    saveBtn.disabled = false;

    if (result?.success) {
      showToast('Saved to Unimatrix memory ✓', 'success');
    } else {
      const err = result?.error || 'Unknown error';
      if (err.includes('authenticated') || err.includes('API key')) {
        showToast('Set your API key in the extension settings first.', 'error');
      } else {
        showToast(`Failed: ${err}`, 'error');
      }
    }
  }

  // ── Auto-capture on response completion ───────────────────────────────────
  // Watches for new AI responses finishing, shows a subtle "save?" nudge

  let lastMessageCount = 0;
  let autoSaveDebounce = null;

  function checkForNewMessages() {
    const messages = extractConversation();
    if (messages.length > lastMessageCount && messages.length > 0) {
      lastMessageCount = messages.length;
      // Only nudge on assistant messages
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'assistant' && lastMsg.content.length > 100) {
        clearTimeout(autoSaveDebounce);
        autoSaveDebounce = setTimeout(async () => {
          const cfg = await new Promise(r =>
            chrome.runtime.sendMessage({ type: 'GET_CONFIG' }, r)
          );
          if (cfg?.data?.autoCapture) {
            handleSaveClick();
          }
        }, 1500);
      }
    }
  }

  // ── Message listener (from background/popup) ──────────────────────────────

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'EXTRACT_CONVERSATION') {
      const messages = extractConversation();
      const content  = formatConversationForStorage(messages);
      sendResponse({
        messages,
        content,
        title:   getPageTitle(),
        site:    SITE,
        url:     location.href,
      });
      return true;
    }
    if (msg.type === 'PING') {
      sendResponse({ alive: true, site: SITE });
      return true;
    }
  });

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    createSaveButton();

    // MutationObserver to detect new messages
    const observer = new MutationObserver(() => {
      checkForNewMessages();
    });

    const target = document.querySelector('main') ||
                   document.querySelector('[role="main"]') ||
                   document.body;

    observer.observe(target, {
      childList: true,
      subtree:   true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init on SPA navigation (ChatGPT, Gemini use pushState)
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      lastMessageCount = 0;
      // Re-attach button if removed
      if (!document.getElementById('__unimatrix_save_btn')) {
        saveBtn = null;
        createSaveButton();
      }
    }
  }).observe(document, { subtree: true, childList: true });

})();

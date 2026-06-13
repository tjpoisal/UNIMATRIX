/**
 * background.js — Unimatrix Extension Service Worker
 *
 * Handles:
 * - Auth state management (API key storage)
 * - All Unimatrix API calls (store, search, list palaces)
 * - Message routing from content scripts and popup
 * - Badge status updates
 */

const UNIMATRIX_API = 'https://deployunimatrix.com';

// ── Storage helpers ──────────────────────────────────────────────────────────

async function getConfig() {
  return new Promise(resolve => {
    chrome.storage.local.get(['apiKey', 'apiUrl', 'defaultPalaceId', 'autoCapture', 'userId'], resolve);
  });
}

async function setConfig(data) {
  return new Promise(resolve => chrome.storage.local.set(data, resolve));
}

// ── Badge ────────────────────────────────────────────────────────────────────

function setBadge(text, color) {
  chrome.action.setBadgeText({ text: text || '' });
  if (color) chrome.action.setBadgeBackgroundColor({ color });
}

function flashBadge(text, color, durationMs = 2000) {
  setBadge(text, color);
  setTimeout(() => setBadge('', '#ff7a00'), durationMs);
}

// ── API calls ────────────────────────────────────────────────────────────────

async function apiRequest(path, method = 'GET', body = null) {
  const cfg = await getConfig();
  const apiKey = cfg.apiKey;
  const baseUrl = (cfg.apiUrl || UNIMATRIX_API).replace(/\/$/, '');

  if (!apiKey) return { error: 'Not authenticated. Set your API key in settings.' };

  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res  = await fetch(`${baseUrl}${path}`, opts);
    const json = await res.json();
    if (!res.ok) return { error: json.error || json.message || `HTTP ${res.status}` };
    return { data: json };
  } catch (err) {
    return { error: err.message };
  }
}

async function storeMemory({ content, palaceName, location, tags, sourceLlm }) {
  // 1. Find or use default palace
  const cfg = await getConfig();
  let palaceId = cfg.defaultPalaceId;

  if (!palaceId) {
    const palacesRes = await apiRequest('/api/spaces');
    if (palacesRes.error) return palacesRes;
    const palaces = Array.isArray(palacesRes.data) ? palacesRes.data : [];
    const targetName = palaceName || 'Web Captures';
    let palace = palaces.find(p => p.name === targetName);

    if (!palace) {
      // Create it
      const createRes = await apiRequest('/api/spaces', 'POST', {
        name: targetName,
        description: `Memories captured from web LLMs via the Unimatrix browser extension.`,
      });
      if (createRes.error) return createRes;
      palace = createRes.data;
    }
    palaceId = palace.id;
  }

  // 2. Store the memory
  const payload = {
    spaceId:   palaceId,
    content,
    tags:      tags || (sourceLlm ? [`source:${sourceLlm}`, 'web-capture'] : ['web-capture']),
    sourceLlm: sourceLlm || 'browser-extension',
  };
  if (location) payload.location = location;

  const res = await apiRequest('/api/memories', 'POST', payload);
  if (res.error) return res;

  flashBadge('✓', '#22c55e');
  return { data: res.data, success: true };
}

async function searchMemories(query, limit = 5) {
  const res = await apiRequest(`/api/memories/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  return res;
}

async function listPalaces() {
  return apiRequest('/api/spaces');
}

async function getRecentMemories(limit = 10) {
  return apiRequest(`/api/memories?limit=${limit}&sort=createdAt:desc`);
}

async function verifyApiKey(apiKey, apiUrl) {
  const baseUrl = (apiUrl || UNIMATRIX_API).replace(/\/$/, '');
  try {
    const res = await fetch(`${baseUrl}/api/me`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const user = await res.json();
      return { success: true, user };
    }
    return { success: false, error: 'Invalid API key' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg.type) {

      case 'STORE_MEMORY': {
        const result = await storeMemory(msg.payload);
        sendResponse(result);
        break;
      }

      case 'SEARCH_MEMORIES': {
        const result = await searchMemories(msg.query, msg.limit);
        sendResponse(result);
        break;
      }

      case 'LIST_PALACES': {
        const result = await listPalaces();
        sendResponse(result);
        break;
      }

      case 'GET_RECENT': {
        const result = await getRecentMemories(msg.limit || 10);
        sendResponse(result);
        break;
      }

      case 'VERIFY_KEY': {
        const result = await verifyApiKey(msg.apiKey, msg.apiUrl);
        if (result.success) {
          await setConfig({
            apiKey:  msg.apiKey,
            apiUrl:  msg.apiUrl || UNIMATRIX_API,
            userId:  result.user?.id,
          });
          setBadge('', '#ff7a00');
        }
        sendResponse(result);
        break;
      }

      case 'GET_CONFIG': {
        const cfg = await getConfig();
        sendResponse({ data: cfg });
        break;
      }

      case 'SAVE_CONFIG': {
        await setConfig(msg.config);
        sendResponse({ success: true });
        break;
      }

      case 'SIGN_OUT': {
        await chrome.storage.local.clear();
        setBadge('', '#ff7a00');
        sendResponse({ success: true });
        break;
      }

      case 'CAPTURE_PAGE_CONVERSATION': {
        // Triggered by popup "auto-capture" — asks content script to extract
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) { sendResponse({ error: 'No active tab' }); break; }
        try {
          const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_CONVERSATION' });
          sendResponse(response);
        } catch {
          sendResponse({ error: 'Could not reach page. Try refreshing.' });
        }
        break;
      }

      default:
        sendResponse({ error: `Unknown message type: ${msg.type}` });
    }
  })();
  return true; // Keep message channel open for async
});

// ── Context menu ─────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id:       'unimatrix-save-selection',
    title:    'Save to Unimatrix Memory',
    contexts: ['selection'],
  });
  chrome.contextMenus.create({
    id:       'unimatrix-search',
    title:    'Search Unimatrix for "%s"',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'unimatrix-save-selection') {
    const result = await storeMemory({
      content:   info.selectionText,
      tags:      ['context-menu', 'selection'],
      sourceLlm: detectLlmFromUrl(tab?.url),
    });
    if (result.success) {
      flashBadge('✓', '#22c55e', 2500);
    }
  }
  if (info.menuItemId === 'unimatrix-search') {
    const encoded = encodeURIComponent(info.selectionText);
    chrome.tabs.create({ url: `${UNIMATRIX_API}/dashboard?search=${encoded}` });
  }
});

function detectLlmFromUrl(url = '') {
  if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
  if (url.includes('claude.ai'))      return 'claude';
  if (url.includes('gemini.google'))  return 'gemini';
  if (url.includes('copilot.microsoft')) return 'copilot';
  if (url.includes('x.com/grok') || url.includes('grok.x.ai')) return 'grok';
  if (url.includes('perplexity.ai'))  return 'perplexity';
  if (url.includes('huggingface.co')) return 'huggingface';
  return 'web';
}

// Initial badge clear on load
setBadge('', '#ff7a00');

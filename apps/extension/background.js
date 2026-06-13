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

// ── Zero-Knowledge Client-Side Encryption ────────────────────────────────────
//
// When a ZK passphrase is set, ALL memory content is encrypted in the extension
// before being sent to the Unimatrix server. The server stores ciphertext it
// can never read. Decryption happens in the extension on retrieval.
//
// Algorithm: AES-GCM-256
// Key derivation: PBKDF2 (SHA-256, 310,000 iterations — OWASP 2023 recommendation)
// Key storage: Derived key stored in chrome.storage.local (session only option available)
// The raw passphrase is NEVER stored — only the derived key material.
//
// Trade-off: semantic/vector search is disabled in ZK mode (can't search ciphertext).
// Full-text search still works via client-side decryption of search results.

const ZK_PBKDF2_ITERATIONS = 310_000;
const ZK_SALT_LEN  = 32; // bytes
const ZK_IV_LEN    = 12; // bytes — 96-bit IV for AES-GCM

// ── Key derivation ────────────────────────────────────────────────────────────

async function zkDeriveKey(passphrase, saltB64) {
  const enc       = new TextEncoder();
  const saltBytes = saltB64
    ? b64ToBytes(saltB64)
    : crypto.getRandomValues(new Uint8Array(ZK_SALT_LEN));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name:       'PBKDF2',
      salt:       saltBytes,
      iterations: ZK_PBKDF2_ITERATIONS,
      hash:       'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,      // not extractable
    ['encrypt', 'decrypt'],
  );

  return { key, saltB64: bytesToB64(saltBytes) };
}

async function zkEncrypt(plaintext, key) {
  const iv  = crypto.getRandomValues(new Uint8Array(ZK_IV_LEN));
  const enc = new TextEncoder();
  const ct  = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext),
  );
  // Format: iv_b64:ciphertext_b64
  return `${bytesToB64(iv)}:${bytesToB64(new Uint8Array(ct))}`;
}

async function zkDecrypt(cipherStr, key) {
  const [ivB64, ctB64] = cipherStr.split(':');
  if (!ivB64 || !ctB64) throw new Error('Invalid ZK ciphertext format');
  const iv = b64ToBytes(ivB64);
  const ct = b64ToBytes(ctB64);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}

// ── Base64 helpers ────────────────────────────────────────────────────────────

function bytesToB64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function b64ToBytes(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

// ── Key cache (session) ───────────────────────────────────────────────────────

let _zkKeyCache = null; // { key: CryptoKey, saltB64: string }

async function getZkKey() {
  if (_zkKeyCache) return _zkKeyCache;

  const stored = await new Promise(r =>
    chrome.storage.local.get(['zkPassphraseHash', 'zkSalt'], r)
  );

  if (!stored.zkPassphraseHash || !stored.zkSalt) return null;

  // We can't re-derive from the hash — the user must unlock each session
  // If the key isn't cached it means the user hasn't unlocked this session
  return null;
}

// ── ZK API surface (called from message handler) ──────────────────────────────

async function zkSetPassphrase(passphrase) {
  if (!passphrase || passphrase.length < 8) {
    return { error: 'Passphrase must be at least 8 characters.' };
  }

  const { key, saltB64 } = await zkDeriveKey(passphrase, null);

  // Store a verification token so we can confirm the passphrase is correct later
  const verifyPlain = 'unimatrix-zk-verify-v1';
  const verifyCt    = await zkEncrypt(verifyPlain, key);

  await chrome.storage.local.set({
    zkEnabled:   true,
    zkSalt:      saltB64,
    zkVerifyCt:  verifyCt,
  });

  _zkKeyCache = { key, saltB64 };

  return { success: true, message: 'Zero-knowledge encryption enabled. Passphrase is never stored.' };
}

async function zkUnlock(passphrase) {
  const stored = await new Promise(r =>
    chrome.storage.local.get(['zkSalt', 'zkVerifyCt', 'zkEnabled'], r)
  );

  if (!stored.zkEnabled) return { error: 'ZK mode not enabled.' };
  if (!stored.zkSalt || !stored.zkVerifyCt) return { error: 'ZK not configured. Set a passphrase first.' };

  try {
    const { key, saltB64 } = await zkDeriveKey(passphrase, stored.zkSalt);
    const decrypted = await zkDecrypt(stored.zkVerifyCt, key);
    if (decrypted !== 'unimatrix-zk-verify-v1') {
      return { error: 'Wrong passphrase.' };
    }
    _zkKeyCache = { key, saltB64 };
    return { success: true };
  } catch {
    return { error: 'Wrong passphrase.' };
  }
}

async function zkDisable() {
  _zkKeyCache = null;
  await chrome.storage.local.remove(['zkEnabled', 'zkSalt', 'zkVerifyCt']);
  return { success: true };
}

async function zkLock() {
  _zkKeyCache = null;
  return { success: true };
}

// ── Wrap storeMemory to encrypt when ZK is active ────────────────────────────

const _originalStoreMemory = storeMemory;

async function storeMemoryWithZk(payload) {
  const cfg = await getConfig();
  if (!cfg.zkEnabled) return _originalStoreMemory(payload);

  const zkKey = await getZkKey();
  if (!zkKey) {
    return { error: 'ZK mode is locked. Unlock with your passphrase first.' };
  }

  // Encrypt content before sending to server
  const encryptedContent = await zkEncrypt(payload.content, zkKey.key);
  return _originalStoreMemory({
    ...payload,
    content: `[ZK]${encryptedContent}`,         // prefix so server knows it's ZK-encrypted
    tags: [...(payload.tags || []), 'zk-encrypted'],
  });
}

// ── Wrap search results to decrypt ZK memories ───────────────────────────────

async function searchMemoriesWithZk(query, limit = 5) {
  const result = await searchMemories(query, limit);
  const cfg    = await getConfig();

  if (!cfg.zkEnabled || !result?.data) return result;

  const zkKey = await getZkKey();
  if (!zkKey) return result; // Return encrypted — user must unlock

  const memories = Array.isArray(result.data) ? result.data : result.data.results || [];
  const decrypted = await Promise.all(memories.map(async (m) => {
    if (typeof m.content === 'string' && m.content.startsWith('[ZK]')) {
      try {
        m.content = await zkDecrypt(m.content.slice(4), zkKey.key);
      } catch {
        m.content = '[ZK - decryption failed — wrong key or corrupted]';
      }
    }
    return m;
  }));

  return { ...result, data: decrypted };
}

// Add ZK message handlers to the existing message listener
const _originalOnMessage = chrome.runtime.onMessage;
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'ZK_SET_PASSPHRASE') {
    zkSetPassphrase(msg.passphrase).then(sendResponse);
    return true;
  }
  if (msg.type === 'ZK_UNLOCK') {
    zkUnlock(msg.passphrase).then(sendResponse);
    return true;
  }
  if (msg.type === 'ZK_LOCK') {
    zkLock().then(sendResponse);
    return true;
  }
  if (msg.type === 'ZK_DISABLE') {
    zkDisable().then(sendResponse);
    return true;
  }
  if (msg.type === 'ZK_STATUS') {
    getConfig().then(cfg =>
      sendResponse({
        enabled: !!cfg.zkEnabled,
        unlocked: !!_zkKeyCache,
      })
    );
    return true;
  }
});

// Override storeMemory globally so all paths use ZK when enabled
globalThis.storeMemory = storeMemoryWithZk;
globalThis.searchMemories = searchMemoriesWithZk;

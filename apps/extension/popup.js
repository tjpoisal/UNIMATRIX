/**
 * popup.js — Extension popup UI logic
 */

const $ = id => document.getElementById(id);

async function msg(type, extra = {}) {
  return new Promise(resolve =>
    chrome.runtime.sendMessage({ type, ...extra }, resolve)
  );
}

async function init() {
  const cfg = await msg('GET_CONFIG');
  const { apiKey } = cfg?.data || {};

  if (!apiKey) {
    $('loginSection').style.display = 'block';
    $('mainContent').style.display  = 'none';
    $('authStatus').className = 'status error active';
    $('authStatus').textContent = 'Not connected. Add your API key in settings.';
  } else {
    $('loginSection').style.display = 'none';
    $('mainContent').style.display  = 'block';
    $('authStatus').className = 'status active';
    $('authStatus').textContent = '✓ Connected to Unimatrix';
    loadRecentMemories();
  }
}

async function loadRecentMemories() {
  const result = await msg('GET_RECENT', { limit: 5 });
  const memories = result?.data;
  if (!Array.isArray(memories) || !memories.length) return;

  $('memoryList').style.display = 'block';
  const container = $('recentMemories');
  container.innerHTML = '';
  memories.slice(0, 5).forEach(m => {
    const item = document.createElement('div');
    item.className = 'memory-item';
    const preview = (m.content || '').slice(0, 80).replace(/\*\*/g, '').replace(/\n/g, ' ');
    const time    = m.createdAt
      ? new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : '';
    item.innerHTML = `
      <div style="font-size:12px;line-height:1.4;margin-bottom:3px;">${preview}…</div>
      <div class="time">${time}</div>
    `;
    container.appendChild(item);
  });
}

// Save button
$('saveBtn').addEventListener('click', async () => {
  const content = $('memoryContent').value.trim();
  if (!content) {
    showStatus('Paste something to remember first.', 'error');
    return;
  }

  $('saveBtnText').textContent = 'Saving…';
  $('saveBtn').disabled = true;

  const context = $('memoryContext').value.trim();
  const importance = $('memoryImportance').value;

  const result = await msg('STORE_MEMORY', {
    payload: {
      content,
      palaceName: context || 'Web Captures',
      tags: [importance, 'manual', 'popup'].filter(Boolean),
    },
  });

  $('saveBtnText').textContent = 'Save Memory';
  $('saveBtn').disabled = false;

  if (result?.success) {
    $('memoryContent').value = '';
    $('memoryContext').value = '';
    showStatus('Memory saved ✓', 'success');
    loadRecentMemories();
  } else {
    showStatus(result?.error || 'Failed to save.', 'error');
  }
});

// Auto-capture button
$('captureBtn').addEventListener('click', async () => {
  $('captureBtn').textContent = 'Capturing…';
  $('captureBtn').disabled = true;

  const result = await msg('CAPTURE_PAGE_CONVERSATION');

  $('captureBtn').textContent = 'Auto-Capture';
  $('captureBtn').disabled = false;

  if (result?.content) {
    $('memoryContent').value = result.content.slice(0, 3000);
    $('memoryContext').value = result.site
      ? result.site.charAt(0).toUpperCase() + result.site.slice(1)
      : '';
    showStatus(`Captured from ${result.site || 'page'} — review and save.`, 'info');
  } else {
    showStatus(result?.error || 'No conversation found on this page.', 'error');
  }
});

// Login
$('loginBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
  window.close();
});
$('signupBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://deployunimatrix.com/auth/register' });
  window.close();
});

// Settings
$('settingsLink').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
  window.close();
});

function showStatus(text, type = 'info') {
  const el = $('authStatus');
  el.textContent = text;
  el.className = `status active ${type === 'error' ? 'error' : ''}`;
  if (type !== 'error') setTimeout(() => { el.className = 'status'; }, 3000);
}

init();

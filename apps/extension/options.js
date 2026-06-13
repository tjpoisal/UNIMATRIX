/**
 * options.js — Extension settings page logic
 */

const $ = id => document.getElementById(id);

async function msg(type, extra = {}) {
  return new Promise(resolve =>
    chrome.runtime.sendMessage({ type, ...extra }, resolve)
  );
}

function showStatus(text, type = 'success') {
  const el = $('status');
  el.textContent = text;
  el.className   = `status show ${type}`;
  setTimeout(() => { el.className = 'status'; }, 4000);
}

async function init() {
  const cfg = await msg('GET_CONFIG');
  const { apiKey, apiUrl, autoCapture } = cfg?.data || {};

  if (apiKey) {
    $('apiKeyInput').value    = apiKey;
    $('loginSection').style.display  = 'none';
    $('authSection').style.display   = 'block';
    if ($('autoCaptureToggle')) $('autoCaptureToggle').checked = !!autoCapture;
  }
  if (apiUrl && $('apiUrlInput')) {
    $('apiUrlInput').value = apiUrl;
  }
}

// Sign In — verify API key
$('signInBtn').addEventListener('click', async () => {
  const apiKey = $('apiKeyInput')?.value?.trim();
  const apiUrl = $('apiUrlInput')?.value?.trim();

  if (!apiKey) {
    showStatus('Enter your Unimatrix API key first.', 'error');
    return;
  }

  $('signInBtn').disabled    = true;
  $('signInBtn').textContent = 'Verifying…';

  const result = await msg('VERIFY_KEY', { apiKey, apiUrl: apiUrl || undefined });

  $('signInBtn').disabled    = false;
  $('signInBtn').textContent = 'Save & Connect';

  if (result?.success) {
    showStatus('Connected to Unimatrix ✓', 'success');
    $('loginSection').style.display = 'none';
    $('authSection').style.display  = 'block';
  } else {
    showStatus(result?.error || 'Could not verify key. Check it and try again.', 'error');
  }
});

// Open dashboard to get API key
$('getDashboardKeyBtn')?.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://deployunimatrix.com/dashboard/settings/api-keys' });
});

// Create account
$('createAccountBtn')?.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://deployunimatrix.com/auth/register' });
});

// Sign out
$('logoutBtn')?.addEventListener('click', async () => {
  await msg('SIGN_OUT');
  $('loginSection').style.display = 'block';
  $('authSection').style.display  = 'none';
  if ($('apiKeyInput')) $('apiKeyInput').value = '';
  showStatus('Signed out.', 'success');
});

// Clear data
$('deleteDataBtn')?.addEventListener('click', async () => {
  if (!confirm('Clear all local Unimatrix data? This only affects the extension — your memories on Unimatrix are unaffected.')) return;
  await msg('SIGN_OUT');
  $('loginSection').style.display = 'block';
  $('authSection').style.display  = 'none';
  if ($('apiKeyInput')) $('apiKeyInput').value = '';
  showStatus('Local data cleared.', 'success');
});

// Auto-capture toggle
$('autoCaptureToggle')?.addEventListener('change', async (e) => {
  await msg('SAVE_CONFIG', { config: { autoCapture: e.target.checked } });
  showStatus(e.target.checked ? 'Auto-capture enabled.' : 'Auto-capture disabled.', 'success');
});

init();

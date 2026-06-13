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

// Intercept memory toggle
$('interceptMemoryToggle')?.addEventListener('change', async (e) => {
  await msg('SAVE_CONFIG', { config: { interceptMemory: e.target.checked } });
  showStatus(
    e.target.checked
      ? 'Native LLM memory intercepted — saves will redirect to Unimatrix.'
      : 'Native LLM memory interception disabled.',
    'success'
  );
});

// ── Zero-Knowledge Encryption ─────────────────────────────────────────────

async function refreshZkUi() {
  const status = await new Promise(r =>
    chrome.runtime.sendMessage({ type: 'ZK_STATUS' }, r)
  );
  const cfg = await msg('GET_CONFIG');

  if (status?.enabled) {
    $('zkLockedSection').style.display  = 'none';
    $('zkEnabledSection').style.display = 'block';
    $('zkPassphraseLabel').textContent  = status.unlocked
      ? 'ZK Passphrase (unlocked ✅)'
      : 'ZK Passphrase (locked 🔒)';
    // Show unlock button if locked
    if (!status.unlocked) {
      $('zkUnlockBtn').style.display  = 'inline-flex';
      $('zkEnableBtn').style.display  = 'none';
      $('zkLockedSection').style.display = 'block';
      $('zkEnabledSection').style.display = 'none';
    }
  } else {
    $('zkLockedSection').style.display  = 'block';
    $('zkEnabledSection').style.display = 'none';
    $('zkUnlockBtn').style.display      = 'none';
    $('zkEnableBtn').style.display      = 'inline-flex';
  }

  if ($('interceptMemoryToggle')) {
    $('interceptMemoryToggle').checked = !!cfg?.data?.interceptMemory;
  }
}

$('zkEnableBtn')?.addEventListener('click', async () => {
  const passphrase = $('zkPassphraseInput')?.value?.trim();
  if (!passphrase) { showStatus('Enter a passphrase first.', 'error'); return; }

  $('zkEnableBtn').disabled    = true;
  $('zkEnableBtn').textContent = 'Encrypting…';

  const result = await new Promise(r =>
    chrome.runtime.sendMessage({ type: 'ZK_SET_PASSPHRASE', passphrase }, r)
  );

  $('zkEnableBtn').disabled    = false;
  $('zkEnableBtn').textContent = 'Enable ZK Encryption';

  if (result?.success) {
    $('zkPassphraseInput').value = '';
    showStatus('ZK encryption enabled. Passphrase not stored. Do not lose it.', 'success');
    await refreshZkUi();
  } else {
    showStatus(result?.error || 'Failed to enable ZK.', 'error');
  }
});

$('zkUnlockBtn')?.addEventListener('click', async () => {
  const passphrase = $('zkPassphraseInput')?.value?.trim();
  if (!passphrase) { showStatus('Enter your ZK passphrase.', 'error'); return; }

  const result = await new Promise(r =>
    chrome.runtime.sendMessage({ type: 'ZK_UNLOCK', passphrase }, r)
  );
  $('zkPassphraseInput').value = '';

  if (result?.success) {
    showStatus('ZK unlocked. Memories will be decrypted in this session.', 'success');
    await refreshZkUi();
  } else {
    showStatus(result?.error || 'Wrong passphrase.', 'error');
  }
});

$('zkLockBtn')?.addEventListener('click', async () => {
  await new Promise(r => chrome.runtime.sendMessage({ type: 'ZK_LOCK' }, r));
  showStatus('ZK locked. Memories will not be decrypted until you unlock.', 'success');
  await refreshZkUi();
});

$('zkDisableBtn')?.addEventListener('click', async () => {
  if (!confirm('Disable ZK encryption? Future memories will be stored unencrypted. Existing ZK memories will remain encrypted on the server.')) return;
  await new Promise(r => chrome.runtime.sendMessage({ type: 'ZK_DISABLE' }, r));
  showStatus('ZK encryption disabled.', 'success');
  await refreshZkUi();
});

init();
refreshZkUi();

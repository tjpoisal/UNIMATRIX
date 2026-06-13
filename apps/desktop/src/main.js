/**
 * Unimatrix Desktop — main.js
 *
 * Architecture:
 *   - Runs as a BACKGROUND TRAY APP — no window required, starts on login
 *   - System tray icon shows memory sync status (green pulse = active)
 *   - Embeds a local MCP proxy on localhost:8765 that forwards to the
 *     configured Unimatrix server (cloud or self-hosted)
 *   - Auto-configures Claude Desktop, Cursor, Windsurf, and any MCP client
 *   - Opens the main window on tray click or when triggered via IPC
 *   - Auto-start: registers itself on macOS (launchd plist), Windows (registry),
 *     Linux (XDG autostart .desktop file)
 */

const {
  app, BrowserWindow, Menu, Tray, shell, nativeTheme, ipcMain,
  dialog, Notification, nativeImage,
} = require('electron');
const { autoUpdater } = require('electron-updater');
const http           = require('http');
const https          = require('https');
const path           = require('path');
const fs             = require('fs');
const os             = require('os');
const { execSync }   = require('child_process');

// ── Constants ────────────────────────────────────────────────────────────────
const APP_URL          = 'https://deployunimatrix.com';
const MCP_PROXY_PORT   = 8765;       // localhost port for the embedded MCP proxy
const PRODUCT_NAME     = 'Unimatrix';
const CONFIG_DIR       = path.join(os.homedir(), '.config', 'unimatrix');
const CONFIG_FILE      = path.join(CONFIG_DIR, 'config.json');

nativeTheme.themeSource = 'dark';

// ── Config helpers ────────────────────────────────────────────────────────────
function readConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch { return {}; }
}

function writeConfig(data) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const current = readConfig();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ ...current, ...data }, null, 2), 'utf8');
}

// ── Global state ─────────────────────────────────────────────────────────────
let mainWindow   = null;
let tray         = null;
let proxyServer  = null;
let memorySyncInterval = null;
let isQuitting   = false;

// ── Main window ───────────────────────────────────────────────────────────────
function createWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#0A0F1C',
    icon: path.join(__dirname, '..', 'assets',
      process.platform === 'darwin' ? 'icon.icns' : 'icon.png'),
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(APP_URL);
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Hide to tray instead of quitting on close
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  return mainWindow;
}

// ── Tray icon & context menu ──────────────────────────────────────────────────
function getTrayIconPath(status = 'idle') {
  // Use the same png but in production would swap for status variants
  // status: 'idle' | 'syncing' | 'error'
  const base = path.join(__dirname, '..', 'assets', 'icon.png');
  return base; // In v2 ship icon-idle.png, icon-syncing.png, icon-error.png
}

function buildTrayMenu(syncStatus = 'Idle') {
  return Menu.buildFromTemplate([
    {
      label: `Unimatrix — ${syncStatus}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Open Unimatrix',
      click: () => createWindow(),
    },
    {
      label: `MCP Proxy: localhost:${MCP_PROXY_PORT}`,
      enabled: false,
    },
    {
      label: `OpenAI Proxy: localhost:${OPENAI_PROXY_PORT}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Sync Now',
      click: () => triggerSync(),
    },
    {
      label: 'Configure Claude Desktop',
      click: async () => {
        const cfg = readConfig();
        await configureClaudeDesktop({
          apiKey: cfg.mcpApiKey || '',
          apiUrl: cfg.mcpApiUrl || APP_URL,
        });
        showNotification('Claude Desktop configured', 'Restart Claude Desktop to activate Unimatrix memory.');
      },
    },
    {
      label: 'Start on Login',
      type: 'checkbox',
      checked: isAutoStartEnabled(),
      click: (item) => {
        if (item.checked) enableAutoStart();
        else disableAutoStart();
      },
    },
    { type: 'separator' },
    {
      label: 'Check for Updates',
      click: () => autoUpdater.checkForUpdatesAndNotify(),
    },
    { type: 'separator' },
    {
      label: 'Quit Unimatrix',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);
}

function createTray() {
  const icon = nativeImage.createFromPath(getTrayIconPath('idle'));
  // Resize to 16×16 for tray (macOS template icons work best at 22×22)
  const trayIcon = process.platform === 'darwin'
    ? icon.resize({ width: 22, height: 22 })
    : icon.resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setToolTip('Unimatrix — AI Memory');
  tray.setContextMenu(buildTrayMenu());

  tray.on('click', () => {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      createWindow();
    }
  });

  tray.on('double-click', () => createWindow());
}

function updateTrayStatus(status, label) {
  if (!tray) return;
  tray.setContextMenu(buildTrayMenu(label ?? status));
}

// ── Local MCP Proxy ───────────────────────────────────────────────────────────
// Listens on localhost:8765, forwards all MCP traffic to the configured server.
// This allows any local LLM tool to connect with: http://localhost:8765/mcp
// No API key needed in the tool config — the proxy injects it from the local config.
function startMcpProxy() {
  const cfg = readConfig();
  const upstreamBase = (cfg.mcpApiUrl || APP_URL).replace(/\/$/, '');
  const apiKey       = cfg.mcpApiKey || '';

  proxyServer = http.createServer((req, res) => {
    const upstreamUrl = `${upstreamBase}${req.url}`;
    const isHttps = upstreamUrl.startsWith('https://');
    const transport = isHttps ? https : http;

    const urlObj = new URL(upstreamUrl);
    const options = {
      hostname: urlObj.hostname,
      port:     urlObj.port || (isHttps ? 443 : 80),
      path:     urlObj.pathname + urlObj.search,
      method:   req.method,
      headers: {
        ...req.headers,
        host:               urlObj.hostname,
        'x-unimatrix-key':  apiKey,  // inject auth
        // Remove hop-by-hop headers
        connection:         'close',
        'transfer-encoding': undefined,
      },
    };

    // Remove undefined headers
    Object.keys(options.headers).forEach(
      (k) => options.headers[k] === undefined && delete options.headers[k]
    );

    const proxyReq = transport.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        ...proxyRes.headers,
        'access-control-allow-origin': '*',  // allow local LLM tools
      });
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error('[MCP Proxy] upstream error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502);
        res.end(JSON.stringify({ error: 'Upstream unavailable', detail: err.message }));
      }
    });

    req.pipe(proxyReq);
  });

  proxyServer.listen(MCP_PROXY_PORT, '127.0.0.1', () => {
    console.log(`[MCP Proxy] Listening on localhost:${MCP_PROXY_PORT} → ${upstreamBase}`);
  });

  proxyServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[MCP Proxy] Port ${MCP_PROXY_PORT} in use — proxy disabled`);
    } else {
      console.error('[MCP Proxy] Server error:', err);
    }
  });
}

// ── Background memory sync ────────────────────────────────────────────────────
// Polls the MCP server every 30s to keep the local health check alive
// and push any pending offline memories (future: local queue).
function triggerSync() {
  const cfg = readConfig();
  if (!cfg.mcpApiKey) return;

  updateTrayStatus('syncing', 'Syncing…');
  const upstreamBase = (cfg.mcpApiUrl || APP_URL).replace(/\/$/, '');
  const healthUrl    = `${upstreamBase}/health`;
  const isHttps      = healthUrl.startsWith('https://');
  const transport    = isHttps ? https : http;

  const req = transport.get(healthUrl, { timeout: 5000 }, (res) => {
    let body = '';
    res.on('data', (d) => (body += d));
    res.on('end', () => {
      try {
        const json = JSON.parse(body);
        if (json.status === 'ok') {
          updateTrayStatus('ok', 'Connected ✓');
          setTimeout(() => updateTrayStatus('idle', 'Idle'), 3000);
        } else {
          updateTrayStatus('error', 'Server issue');
        }
      } catch {
        updateTrayStatus('idle', 'Idle');
      }
    });
  });
  req.on('error', () => updateTrayStatus('error', 'Offline'));
  req.on('timeout', () => { req.destroy(); updateTrayStatus('error', 'Timeout'); });
}

function startBackgroundSync() {
  triggerSync();
  memorySyncInterval = setInterval(triggerSync, 30_000);
}

// ── Auto-start (Login item) ───────────────────────────────────────────────────
function isAutoStartEnabled() {
  const p = process.platform;
  if (p === 'darwin' || p === 'win32') {
    try {
      return app.getLoginItemSettings().openAtLogin;
    } catch { return false; }
  }
  // Linux: check XDG autostart file
  const xdgFile = getLinuxAutostartPath();
  return fs.existsSync(xdgFile);
}

function enableAutoStart() {
  const p = process.platform;
  if (p === 'darwin' || p === 'win32') {
    app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true });
    return;
  }
  // Linux: write XDG .desktop file
  const desktopEntry = `[Desktop Entry]
Type=Application
Name=Unimatrix
Comment=AI Memory Background Service
Exec=${process.execPath} --hidden
Icon=unimatrix
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
StartupNotify=false
`;
  const p2 = getLinuxAutostartPath();
  fs.mkdirSync(path.dirname(p2), { recursive: true });
  fs.writeFileSync(p2, desktopEntry, 'utf8');
}

function disableAutoStart() {
  const p = process.platform;
  if (p === 'darwin' || p === 'win32') {
    app.setLoginItemSettings({ openAtLogin: false });
    return;
  }
  const f = getLinuxAutostartPath();
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

function getLinuxAutostartPath() {
  return path.join(
    process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'),
    'autostart',
    'unimatrix.desktop',
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────
function showNotification(title, body) {
  if (Notification.isSupported()) {
    new Notification({ title, body, silent: false }).show();
  }
}

// ── Claude Desktop config helper ─────────────────────────────────────────────
function getClaudeDesktopConfigPath() {
  const home = os.homedir();
  if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
  }
  return path.join(home, '.config', 'Claude', 'claude_desktop_config.json');
}

function getMcpClientConfigs() {
  const home = os.homedir();
  return {
    claude: getClaudeDesktopConfigPath(),
    cursor: process.platform === 'darwin'
      ? path.join(home, 'Library', 'Application Support', 'Cursor', 'User', 'settings.json')
      : process.platform === 'win32'
        ? path.join(process.env.APPDATA || '', 'Cursor', 'User', 'settings.json')
        : path.join(home, '.config', 'Cursor', 'User', 'settings.json'),
    windsurf: process.platform === 'darwin'
      ? path.join(home, 'Library', 'Application Support', 'Windsurf', 'User', 'settings.json')
      : process.platform === 'win32'
        ? path.join(process.env.APPDATA || '', 'Windsurf', 'User', 'settings.json')
        : path.join(home, '.config', 'Windsurf', 'User', 'settings.json'),
  };
}

async function configureClaudeDesktop({ apiKey, apiUrl }) {
  const configPath = getClaudeDesktopConfigPath();
  // Point to the LOCAL proxy — no API key needed in Claude's config
  // The proxy handles auth injection.
  const unimatrixEntry = {
    command: 'npx',
    args: ['-y', '@unimatrix/mcp-client'],
    env: {
      UNIMATRIX_MCP_URL:  `http://localhost:${MCP_PROXY_PORT}/mcp`,
      UNIMATRIX_API_KEY:  apiKey,
      UNIMATRIX_API_URL:  apiUrl || APP_URL,
    },
  };

  try {
    let config = {};
    if (fs.existsSync(configPath)) {
      try { config = JSON.parse(fs.readFileSync(configPath, 'utf8') || '{}'); } catch {}
    } else {
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }
    config.mcpServers              = config.mcpServers || {};
    config.mcpServers.unimatrix    = unimatrixEntry;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    writeConfig({ mcpApiKey: apiKey, mcpApiUrl: apiUrl || APP_URL });
    return { success: true, path: configPath };
  } catch (err) {
    return { success: false, error: err.message, path: configPath };
  }
}

// ── IPC handlers ──────────────────────────────────────────────────────────────
ipcMain.handle('configure-claude-desktop', async (_e, payload) => configureClaudeDesktop(payload));

ipcMain.handle('get-client-config-status', async () => {
  const clients = getMcpClientConfigs();
  const out = { platform: process.platform, proxyPort: MCP_PROXY_PORT, clients: {} };
  for (const [name, cfgPath] of Object.entries(clients)) {
    let status = 'not-found';
    if (fs.existsSync(cfgPath)) {
      try {
        const raw = fs.readFileSync(cfgPath, 'utf8');
        const cfg = JSON.parse(raw || '{}');
        const servers = cfg.mcpServers || cfg['mcp.servers'] || {};
        status = servers.unimatrix ? 'configured' : 'exists';
      } catch { status = 'exists'; }
    }
    out.clients[name] = { path: cfgPath, status };
  }
  out.autoStartEnabled = isAutoStartEnabled();
  return out;
});

ipcMain.handle('set-autostart', async (_e, { enabled }) => {
  if (enabled) enableAutoStart(); else disableAutoStart();
  return { success: true, enabled: isAutoStartEnabled() };
});

ipcMain.handle('write-selfhost-env', async (_e, keys) => {
  const targetDir = path.join(os.homedir(), 'unimatrix-selfhost');
  fs.mkdirSync(targetDir, { recursive: true });
  const envContent = `# Unimatrix self-host env — generated by desktop installer

DATABASE_URL=${keys.databaseUrl || 'postgresql://unimatrix:unimatrix@localhost:5432/unimatrix'}

ANTHROPIC_API_KEY=${keys.anthropicKey || ''}
OPENAI_API_KEY=${keys.openaiKey || ''}
GOOGLE_API_KEY=${keys.googleKey || ''}
GROQ_API_KEY=${keys.groqKey || ''}
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=mistral
LIBRARIAN_MODEL=unimatrix-librarian

MASTER_ENCRYPTION_KEY=${keys.masterKey || 'generate-with-openssl-rand-hex-32'}
UNIMATRIX_API_KEY=${keys.unimatrixApiKey || 'create-in-dashboard'}
UNIMATRIX_API_URL=${keys.apiUrl || `http://localhost:${MCP_PROXY_PORT}`}

NODE_ENV=production
MCP_PROXY_PORT=${MCP_PROXY_PORT}
`;
  const envPath = path.join(targetDir, '.env.unimatrix');
  fs.writeFileSync(envPath, envContent, 'utf8');
  return { success: true, path: envPath };
});

ipcMain.handle('show-item-in-folder', async (_e, p) => {
  shell.showItemInFolder(p);
  return { success: true };
});

ipcMain.handle('get-mcp-proxy-status', () => ({
  port:    MCP_PROXY_PORT,
  running: proxyServer !== null && proxyServer.listening,
  url:     `http://localhost:${MCP_PROXY_PORT}/mcp`,
}));

ipcMain.handle('trigger-sync', () => { triggerSync(); return { success: true }; });

ipcMain.handle('save-config', async (_e, data) => {
  writeConfig(data);
  // Restart proxy if API URL changed
  if (data.mcpApiUrl && proxyServer) {
    proxyServer.close(() => startMcpProxy());
  }
  return { success: true };
});

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  // macOS: don't show in Dock when running as background agent
  if (process.platform === 'darwin' && process.argv.includes('--hidden')) {
    app.dock.hide();
  }

  buildMenu();
  createTray();
  startMcpProxy();
  startOpenAIProxy();
  startBackgroundSync();

  // Only open window if not started hidden (e.g., from login item)
  if (!process.argv.includes('--hidden')) {
    createWindow();
  }

  autoUpdater.checkForUpdatesAndNotify();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Do NOT quit — stay alive in the tray
  if (process.platform !== 'darwin') {
    // On non-mac, still keep alive via tray
    // isQuitting gate prevents quit on window close
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  if (memorySyncInterval)   clearInterval(memorySyncInterval);
  if (proxyServer)          proxyServer.close();
  if (openaiProxyServer)    openaiProxyServer.close();
});

autoUpdater.on('update-downloaded', () => {
  showNotification('Unimatrix update ready', 'Restart to install the latest version.');
});

// ── App menu ──────────────────────────────────────────────────────────────────
function buildMenu() {
  const isMac     = process.platform === 'darwin';
  const template  = [
    ...(isMac ? [{ label: app.name, submenu: [
      { role: 'about' }, { type: 'separator' }, { role: 'services' },
      { type: 'separator' }, { role: 'hide' }, { role: 'hideOthers' },
      { role: 'unhide' }, { type: 'separator' }, { role: 'quit' },
    ]}] : []),
    { label: 'Edit', submenu: [
      { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
      { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
    ]},
    { label: 'View', submenu: [
      { role: 'reload' }, { role: 'forceReload' }, { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
      { type: 'separator' }, { role: 'togglefullscreen' },
    ]},
    { label: 'Window', submenu: [
      { role: 'minimize' }, { role: 'zoom' },
      ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : [{ role: 'close' }]),
    ]},
    { label: 'Help', submenu: [
      { label: 'deployunimatrix.com', click: () => shell.openExternal(APP_URL) },
      { label: 'MCP Proxy Status', click: () => {
        dialog.showMessageBox({ type: 'info', title: 'MCP Proxy',
          message: `Local MCP proxy running on localhost:${MCP_PROXY_PORT}`,
          detail: `Configure any MCP client to connect to:\nhttp://localhost:${MCP_PROXY_PORT}/mcp\n\nThe proxy injects your API key automatically.`,
        });
      }},
      { label: 'Check for Updates', click: () => autoUpdater.checkForUpdatesAndNotify() },
    ]},
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── OpenAI-Compatible API Proxy (port 8766) ───────────────────────────────────
//
// Listens on localhost:8766 as an OpenAI-compatible endpoint.
// Users set their tool's baseURL to http://localhost:8766/v1 instead of
// https://api.openai.com/v1 — all requests pass through unchanged EXCEPT:
//
// On streamed responses, the proxy scans each SSE chunk for tool_calls whose
// function name starts with "unimatrix_". When found it:
//   1. Executes the tool call against the Unimatrix MCP server
//   2. Injects the result back as a tool message in the stream
//   3. Forwards all other chunks unmodified
//
// This means ANY LLM client (LM Studio, Continue.dev, custom scripts, Cursor
// in OpenAI-compat mode) gets automatic Unimatrix memory with zero config
// beyond pointing at localhost:8766.

const OPENAI_PROXY_PORT = 8766;
let openaiProxyServer = null;

// Tool schemas injected into every /v1/chat/completions request
const UNIMATRIX_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'unimatrix_store_memory',
      description: 'Store an important memory, fact, decision, or insight into the Unimatrix persistent memory system. Call this whenever you learn something worth remembering across sessions.',
      parameters: {
        type: 'object',
        properties: {
          content:     { type: 'string', description: 'The memory content to store.' },
          palace_name: { type: 'string', description: 'Memory Palace name (workspace). Defaults to "General" if omitted.' },
          location:    { type: 'string', description: 'Location within the palace (e.g., "Work", "Personal"). Optional.' },
          tags:        { type: 'array', items: { type: 'string' }, description: 'Tags for categorisation. Optional.' },
        },
        required: ['content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'unimatrix_search_memories',
      description: 'Search the Unimatrix memory system for relevant past context. Call this at the start of a session or when you need to recall previous information.',
      parameters: {
        type: 'object',
        properties: {
          query:  { type: 'string', description: 'Natural-language search query.' },
          limit:  { type: 'number', description: 'Max results to return. Default 5.' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'unimatrix_list_palaces',
      description: 'List all Memory Palaces (workspaces) in Unimatrix. Use at session start to understand available memory namespaces.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

// Execute a unimatrix tool call against the local MCP proxy
async function executeUnimatrixTool(toolName, toolArgs, apiKey) {
  const upstreamBase = (readConfig().mcpApiUrl || APP_URL).replace(/\/$/, '');

  if (toolName === 'unimatrix_store_memory') {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: 'unimatrix_store_memory',
        arguments: toolArgs,
      },
    });
    return new Promise((resolve) => {
      const isHttps = upstreamBase.startsWith('https://');
      const transport = isHttps ? https : http;
      const urlObj = new URL(`${upstreamBase}/mcp`);
      const req = transport.request({
        hostname: urlObj.hostname,
        port:     urlObj.port || (isHttps ? 443 : 80),
        path:     urlObj.pathname,
        method:   'POST',
        headers: {
          'Content-Type':    'application/json',
          'Content-Length':  Buffer.byteLength(body),
          'x-unimatrix-key': apiKey,
        },
      }, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ success: true, result: json.result });
          } catch {
            resolve({ success: false, error: 'Parse error' });
          }
        });
      });
      req.on('error', (e) => resolve({ success: false, error: e.message }));
      req.write(body);
      req.end();
    });
  }

  if (toolName === 'unimatrix_search_memories') {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: 'unimatrix_search_memories',
        arguments: toolArgs,
      },
    });
    return new Promise((resolve) => {
      const isHttps = upstreamBase.startsWith('https://');
      const transport = isHttps ? https : http;
      const urlObj = new URL(`${upstreamBase}/mcp`);
      const req = transport.request({
        hostname: urlObj.hostname,
        port:     urlObj.port || (isHttps ? 443 : 80),
        path:     urlObj.pathname,
        method:   'POST',
        headers: {
          'Content-Type':    'application/json',
          'Content-Length':  Buffer.byteLength(body),
          'x-unimatrix-key': apiKey,
        },
      }, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ success: true, result: json.result });
          } catch {
            resolve({ success: false, error: 'Parse error' });
          }
        });
      });
      req.on('error', (e) => resolve({ success: false, error: e.message }));
      req.write(body);
      req.end();
    });
  }

  if (toolName === 'unimatrix_list_palaces') {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name: 'unimatrix_list_palaces', arguments: {} },
    });
    return new Promise((resolve) => {
      const isHttps = upstreamBase.startsWith('https://');
      const transport = isHttps ? https : http;
      const urlObj = new URL(`${upstreamBase}/mcp`);
      const req = transport.request({
        hostname: urlObj.hostname,
        port:     urlObj.port || (isHttps ? 443 : 80),
        path:     urlObj.pathname,
        method:   'POST',
        headers: {
          'Content-Type':    'application/json',
          'Content-Length':  Buffer.byteLength(body),
          'x-unimatrix-key': apiKey,
        },
      }, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ success: true, result: json.result });
          } catch {
            resolve({ success: false, error: 'Parse error' });
          }
        });
      });
      req.on('error', (e) => resolve({ success: false, error: e.message }));
      req.write(body);
      req.end();
    });
  }

  return { success: false, error: `Unknown tool: ${toolName}` };
}

function startOpenAIProxy() {
  const cfg    = readConfig();
  const apiKey = cfg.mcpApiKey || '';

  // Determine real OpenAI upstream (or whatever the user's actual provider is)
  // Default: api.openai.com. Users can override via config.openaiUpstream.
  const openaiUpstream = cfg.openaiUpstream || 'https://api.openai.com';

  openaiProxyServer = http.createServer((req, res) => {
    // CORS preflight for tools like LM Studio that check first
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end();
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      // Only intercept chat completions — pass everything else straight through
      if (req.url !== '/v1/chat/completions' || req.method !== 'POST') {
        // Passthrough
        return proxyPassthrough(req, res, body, openaiUpstream);
      }

      let parsed;
      try { parsed = JSON.parse(body); } catch {
        res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' })); return;
      }

      // Inject Unimatrix tools into the request (merge with any existing tools)
      const existingTools = parsed.tools || [];
      const existingNames = new Set(existingTools.map(t => t?.function?.name));
      const injected = UNIMATRIX_TOOLS.filter(t => !existingNames.has(t.function.name));
      parsed.tools = [...existingTools, ...injected];

      // Also inject a system message if one doesn't already mention unimatrix
      const messages = parsed.messages || [];
      const hasUnimatrixInstruction = messages.some(
        m => m.role === 'system' && m.content?.includes('unimatrix')
      );
      if (!hasUnimatrixInstruction) {
        const systemIdx = messages.findIndex(m => m.role === 'system');
        const unimatrixInstruction = '\n\n[Unimatrix Memory Active]\nAt the start of each conversation call unimatrix_list_palaces then unimatrix_search_memories with the user\'s first message to load relevant context. When you learn something important call unimatrix_store_memory to persist it. This gives you persistent memory across all sessions and tools.';
        if (systemIdx >= 0) {
          messages[systemIdx] = {
            ...messages[systemIdx],
            content: (messages[systemIdx].content || '') + unimatrixInstruction,
          };
        } else {
          messages.unshift({ role: 'system', content: unimatrixInstruction.trim() });
        }
        parsed.messages = messages;
      }

      const newBody = JSON.stringify(parsed);

      // Forward to real OpenAI (or configured upstream)
      const isStreaming = parsed.stream === true;
      const upstreamIsHttps = openaiUpstream.startsWith('https://');
      const transport = upstreamIsHttps ? https : http;
      const urlObj = new URL(openaiUpstream + req.url);

      const upstreamHeaders = {
        ...req.headers,
        host:             urlObj.hostname,
        'content-length': Buffer.byteLength(newBody).toString(),
        connection:       'close',
      };
      delete upstreamHeaders['transfer-encoding'];

      const upstreamReq = transport.request({
        hostname: urlObj.hostname,
        port:     urlObj.port || (upstreamIsHttps ? 443 : 80),
        path:     urlObj.pathname + urlObj.search,
        method:   'POST',
        headers:  upstreamHeaders,
      }, (upstreamRes) => {
        if (!isStreaming) {
          // Non-streaming: buffer, intercept tool calls, forward
          let respBody = '';
          upstreamRes.on('data', d => { respBody += d; });
          upstreamRes.on('end', async () => {
            try {
              const respJson = JSON.parse(respBody);
              const choice   = respJson.choices?.[0];
              const toolCalls = choice?.message?.tool_calls || [];
              const unimatrixCalls = toolCalls.filter(tc =>
                tc?.function?.name?.startsWith('unimatrix_')
              );

              if (unimatrixCalls.length > 0) {
                // Execute all unimatrix tool calls
                await Promise.all(unimatrixCalls.map(async (tc) => {
                  try {
                    const args = JSON.parse(tc.function.arguments || '{}');
                    await executeUnimatrixTool(tc.function.name, args, apiKey);
                  } catch {}
                }));
                // Strip unimatrix tool calls from the response (they're internal)
                const remainingCalls = toolCalls.filter(tc =>
                  !tc?.function?.name?.startsWith('unimatrix_')
                );
                if (remainingCalls.length === 0 && choice?.message) {
                  delete choice.message.tool_calls;
                  choice.finish_reason = 'stop';
                } else if (choice?.message) {
                  choice.message.tool_calls = remainingCalls;
                }
                respJson.choices[0] = choice;
              }

              const out = JSON.stringify(respJson);
              res.writeHead(upstreamRes.statusCode, {
                ...upstreamRes.headers,
                'content-length':             Buffer.byteLength(out).toString(),
                'access-control-allow-origin': '*',
              });
              res.end(out);
            } catch {
              // If parsing fails, forward raw
              res.writeHead(upstreamRes.statusCode, {
                ...upstreamRes.headers,
                'access-control-allow-origin': '*',
              });
              res.end(respBody);
            }
          });
          return;
        }

        // Streaming: forward SSE chunks, intercept unimatrix tool_calls inline
        res.writeHead(upstreamRes.statusCode, {
          ...upstreamRes.headers,
          'access-control-allow-origin': '*',
        });

        let pendingToolCallName  = '';
        let pendingToolCallArgs  = '';
        let pendingToolCallId    = '';
        let pendingToolCallIdx   = -1;
        let isUnimatrixCall      = false;

        upstreamRes.on('data', async (chunk) => {
          const lines = chunk.toString().split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) { res.write(line + '\n'); continue; }
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') { res.write('data: [DONE]\n\n'); continue; }
            try {
              const delta = JSON.parse(dataStr);
              const tc    = delta?.choices?.[0]?.delta?.tool_calls?.[0];
              if (tc) {
                if (tc.index !== undefined) pendingToolCallIdx  = tc.index;
                if (tc.id)                  pendingToolCallId   = tc.id;
                if (tc.function?.name)      pendingToolCallName = tc.function.name;
                if (tc.function?.arguments) pendingToolCallArgs += tc.function.arguments;

                isUnimatrixCall = pendingToolCallName.startsWith('unimatrix_');
                if (isUnimatrixCall) continue; // suppress this chunk from forwarding
              }
              // If we were building a unimatrix call and it's now complete (no more tool_calls delta)
              // execute it and emit nothing (it's handled internally)
              if (isUnimatrixCall && !tc && pendingToolCallName) {
                try {
                  const args = JSON.parse(pendingToolCallArgs || '{}');
                  executeUnimatrixTool(pendingToolCallName, args, apiKey).catch(() => {});
                } catch {}
                pendingToolCallName = '';
                pendingToolCallArgs = '';
                pendingToolCallId   = '';
                pendingToolCallIdx  = -1;
                isUnimatrixCall     = false;
                continue;
              }
              if (!isUnimatrixCall) {
                res.write(`data: ${JSON.stringify(delta)}\n\n`);
              }
            } catch {
              if (!isUnimatrixCall) res.write(line + '\n');
            }
          }
        });

        upstreamRes.on('end', () => {
          // Execute any final pending unimatrix call
          if (isUnimatrixCall && pendingToolCallName) {
            try {
              const args = JSON.parse(pendingToolCallArgs || '{}');
              executeUnimatrixTool(pendingToolCallName, args, apiKey).catch(() => {});
            } catch {}
          }
        });
      });

      upstreamReq.on('error', (err) => {
        if (!res.headersSent) {
          res.writeHead(502);
          res.end(JSON.stringify({ error: 'Upstream error', detail: err.message }));
        }
      });

      upstreamReq.write(newBody);
      upstreamReq.end();
    });
  });

  openaiProxyServer.listen(OPENAI_PROXY_PORT, '127.0.0.1', () => {
    console.log(`[OpenAI Proxy] Listening on localhost:${OPENAI_PROXY_PORT}/v1 → ${openaiUpstream}`);
  });

  openaiProxyServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[OpenAI Proxy] Port ${OPENAI_PROXY_PORT} in use — proxy disabled`);
    } else {
      console.error('[OpenAI Proxy] Server error:', err);
    }
  });
}

// Generic passthrough for non-intercepted routes
function proxyPassthrough(req, res, body, upstreamBase) {
  const isHttps   = upstreamBase.startsWith('https://');
  const transport = isHttps ? https : http;
  const urlObj    = new URL(upstreamBase + req.url);
  const opts = {
    hostname: urlObj.hostname,
    port:     urlObj.port || (isHttps ? 443 : 80),
    path:     urlObj.pathname + urlObj.search,
    method:   req.method,
    headers:  { ...req.headers, host: urlObj.hostname, connection: 'close' },
  };
  delete opts.headers['transfer-encoding'];
  const proxyReq = transport.request(opts, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'access-control-allow-origin': '*',
    });
    proxyRes.pipe(res);
  });
  proxyReq.on('error', (err) => {
    if (!res.headersSent) { res.writeHead(502); res.end(JSON.stringify({ error: err.message })); }
  });
  if (body) proxyReq.write(body);
  proxyReq.end();
}


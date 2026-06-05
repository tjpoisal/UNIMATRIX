const { app, BrowserWindow, Menu, shell, nativeTheme, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const os = require('os');

const APP_URL = 'https://deployunimatrix.com';
nativeTheme.themeSource = 'dark';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#0A0F1C',
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadURL(APP_URL);

  // Open external links in browser, not Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(APP_URL)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  return win;
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ label: app.name, submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]}] : []),
    { label: 'Edit', submenu: [
      { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
      { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }
    ]},
    { label: 'View', submenu: [
      { role: 'reload' }, { role: 'forceReload' },
      { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]},
    { label: 'Window', submenu: [
      { role: 'minimize' }, { role: 'zoom' },
      ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : [{ role: 'close' }])
    ]},
    { label: 'Help', submenu: [
      { label: 'deployunimatrix.com', click: () => shell.openExternal(APP_URL) },
      { label: 'Check for Updates', click: () => autoUpdater.checkForUpdatesAndNotify() }
    ]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- Auto installer helpers for easy onboarding ---

function getClaudeDesktopConfigPath() {
  const home = os.homedir();
  if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json');
  } else {
    // Linux — less common but try common locations
    return path.join(home, '.config', 'Claude', 'claude_desktop_config.json');
  }
}

async function configureClaudeDesktop({ apiKey, apiUrl }) {
  const configPath = getClaudeDesktopConfigPath();
  const unimatrixEntry = {
    command: 'npx',
    args: ['-y', '@unimatrix/mcp-server'],
    env: {
      UNIMATRIX_API_KEY: apiKey,
      UNIMATRIX_API_URL: apiUrl || 'https://deployunimatrix.com/api',
    },
  };

  try {
    let config = {};
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      config = JSON.parse(raw || '{}');
    } else {
      // Ensure parent dir exists
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }

    config.mcpServers = config.mcpServers || {};
    const existing = config.mcpServers.unimatrix;

    if (existing && existing.env && existing.env.UNIMATRIX_API_KEY === apiKey) {
      return { success: true, message: 'Already configured with this key', path: configPath };
    }

    config.mcpServers.unimatrix = unimatrixEntry;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

    return {
      success: true,
      message: 'Claude Desktop config updated successfully',
      path: configPath,
      backup: existing ? 'previous config preserved in the file' : null,
    };
  } catch (err) {
    console.error('Failed to configure Claude Desktop:', err);
    return {
      success: false,
      error: err.message,
      path: configPath,
      hint: 'Make sure Claude Desktop is installed and you have write permission. You can also copy the config manually from the web onboarding page.',
    };
  }
}

ipcMain.handle('configure-claude-desktop', async (_event, payload) => {
  return configureClaudeDesktop(payload);
});

ipcMain.handle('get-client-config-status', async () => {
  const claudePath = getClaudeDesktopConfigPath();
  let claudeStatus = 'not-found';
  if (fs.existsSync(claudePath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(claudePath, 'utf8'));
      claudeStatus = cfg.mcpServers && cfg.mcpServers.unimatrix ? 'configured' : 'exists';
    } catch {
      claudeStatus = 'exists';
    }
  }
  return {
    platform: process.platform,
    claudeDesktop: {
      path: claudePath,
      status: claudeStatus,
    },
    // Future: cursor, windsurf, etc.
  };
});

// Write a ready-to-use .env for self-host using the keys the user provided in onboarding
ipcMain.handle('write-selfhost-env', async (_event, { databaseUrl, anthropicKey, openaiKey, googleKey, groqKey, voyageKey, masterKey, unimatrixApiKey, apiUrl }) => {
  const targetDir = path.join(os.homedir(), 'unimatrix-selfhost');
  fs.mkdirSync(targetDir, { recursive: true });

  const envContent = `# Unimatrix self-host env — generated by the desktop installer
# Copy into the appropriate .env files as per LOCAL_SETUP.md

DATABASE_URL=${databaseUrl || 'postgresql://unimatrix:unimatrix@localhost:5432/unimatrix'}

# LLM keys you provided (used by server for Librarian, agents, routing)
ANTHROPIC_API_KEY=${anthropicKey || ''}
OPENAI_API_KEY=${openaiKey || ''}
GOOGLE_API_KEY=${googleKey || ''}
GROQ_API_KEY=${groqKey || ''}
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Optional but recommended
VOYAGE_API_KEY=${voyageKey || ''}
MASTER_ENCRYPTION_KEY=${masterKey || 'generate-with-openssl-rand-hex-32'}

# Unimatrix API key for the local MCP bridge (create one in the web dashboard)
UNIMATRIX_API_KEY=${unimatrixApiKey || 'create-in-dashboard'}
UNIMATRIX_API_URL=${apiUrl || 'http://localhost:3001'}

NODE_ENV=production
`;

  const envPath = path.join(targetDir, '.env.unimatrix');
  fs.writeFileSync(envPath, envContent, 'utf8');

  return {
    success: true,
    path: envPath,
    instructions: 'Use this file to populate the .env files in packages/server, apps/web, and packages/mcp-server as described in LOCAL_SETUP.md. Then run the setup commands.',
  };
});

ipcMain.handle('show-item-in-folder', async (_event, p) => {
  shell.showItemInFolder(p);
  return { success: true };
});

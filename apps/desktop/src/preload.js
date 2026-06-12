const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronBridge', {
  platform:  process.platform,
  version:   process.versions.electron,
  isDesktop: true,

  // MCP client configuration (Claude Desktop, Cursor, Windsurf, etc.)
  configureClaudeDesktop: (apiKey, apiUrl) =>
    ipcRenderer.invoke('configure-claude-desktop', { apiKey, apiUrl }),

  getClientConfigStatus: () =>
    ipcRenderer.invoke('get-client-config-status'),

  // Auto-start on login
  setAutostart: (enabled) =>
    ipcRenderer.invoke('set-autostart', { enabled }),

  // Local MCP proxy status
  getMcpProxyStatus: () =>
    ipcRenderer.invoke('get-mcp-proxy-status'),

  // Trigger background sync now
  triggerSync: () =>
    ipcRenderer.invoke('trigger-sync'),

  // Save config (API URL, API key, preferences)
  saveConfig: (data) =>
    ipcRenderer.invoke('save-config', data),

  // Self-host env file writer
  writeSelfhostEnv: (keys) =>
    ipcRenderer.invoke('write-selfhost-env', keys),

  // File system helpers
  showItemInFolder: (p) =>
    ipcRenderer.invoke('show-item-in-folder', p),
});

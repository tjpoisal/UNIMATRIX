const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronBridge', {
  platform: process.platform,
  version: process.versions.electron,
  isDesktop: true,

  // Auto-configure Claude Desktop (or other clients) with Unimatrix MCP
  configureClaudeDesktop: (apiKey, apiUrl) =>
    ipcRenderer.invoke('configure-claude-desktop', { apiKey, apiUrl }),

  // Get detected paths and status
  getClientConfigStatus: () => ipcRenderer.invoke('get-client-config-status'),

  // For self-host installer flows (future)
  runLocalSetup: (config) => ipcRenderer.invoke('run-local-setup', config),

  // Write a pre-filled self-host .env using keys from onboarding
  writeSelfhostEnv: (keys) => ipcRenderer.invoke('write-selfhost-env', keys),

  // Open folder in finder/explorer
  showItemInFolder: (p) => ipcRenderer.invoke('show-item-in-folder', p),
});
});

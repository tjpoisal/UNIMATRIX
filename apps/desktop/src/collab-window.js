/**
 * Collaborative Multi-LLM Conversation Room Window
 * 
 * A dedicated window for real-time multi-LLM collaboration.
 * Multiple AI agents participate in a single conversation simultaneously.
 */

const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let collabWindow = null;

function createCollabWindow() {
  if (collabWindow && !collabWindow.isDestroyed()) {
    collabWindow.show();
    collabWindow.focus();
    return collabWindow;
  }

  collabWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0A0F1C',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the collaborative room from the web app
  collabWindow.loadURL('https://deployunimatrix.com/collab');
  
  collabWindow.once('ready-to-show', () => collabWindow.show());

  collabWindow.on('closed', () => {
    collabWindow = null;
  });

  return collabWindow;
}

// IPC handler to open collab room
ipcMain.handle('open-collab-room', () => {
  return createCollabWindow();
});

// IPC handler to close collab room
ipcMain.handle('close-collab-room', () => {
  if (collabWindow && !collabWindow.isDestroyed()) {
    collabWindow.close();
    collabWindow = null;
  }
  return { success: true };
});

module.exports = { createCollabWindow };

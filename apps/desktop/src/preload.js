const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('electronBridge', {
  platform: process.platform,
  version: process.versions.electron,
});

const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('positions', {
    positions: (position) => ipcRenderer.send('positions',position)
});
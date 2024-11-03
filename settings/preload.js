const  { contextBridge, ipcRenderer } = require('electron');
console.log('preload loaded')
contextBridge.exposeInMainWorld('settings', {
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    saveSettings: (newSettings) => ipcRenderer.send('save-settings', newSettings)
});
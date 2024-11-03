const  { contextBridge, ipcRenderer } = require('electron');
console.log('preload loaded')
contextBridge.exposeInMainWorld('lastResult', {
    lastResult: () => ipcRenderer.invoke('lastResult')
});
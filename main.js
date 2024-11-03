const { app, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { AppTray } = require('./tray/AppTray.js')
const { CalcOverlay } = require('./calcOverlay/CalcOverlay.js')
const { collectJewels } = require('./calculations/collectJewels.js');

let clacOverlay = null

app.on('ready', async () =>{
  console.log('App is ready')
  new AppTray()
  const openOverlay = globalShortcut.register('Ctrl+Shift+T', () => {
    clacOverlay = new CalcOverlay()
  });
  const exit = globalShortcut.register('Ctrl+Space+T', () => {
    app.exit()
  });
})

ipcMain.on('positions',(event,data) => {
    collectJewels(data)
    clacOverlay.close()
})

app.on('window-all-closed', (e) => {
  e.preventDefault();
});

app.on('browser-window-created', (event, newWindow) => {
  newWindow.webContents.on('did-finish-load', () => {
    if(!newWindow.webContents.getURL().includes('calcOverlay.html')){
      newWindow.maximize();
      newWindow.setMenuBarVisibility(false);
      newWindow.setIcon(path.join(__dirname, 'img', 'tray-icon.jpg'))
    }
  })
});

ipcMain.handle('lastResult', () => {
  const data = fs.readFileSync(path.join(__dirname, 'filteredResults.json'));
  console.log('last result loaded')
  return JSON.parse(data);
});

ipcMain.handle('load-settings', () => {
  const data = fs.readFileSync(path.join(__dirname, 'settings', 'settings.json'));
  console.log('settings loaded')
  return JSON.parse(data);
});

ipcMain.on('save-settings', async (event, newSettings) => {
  const settingsPath = path.join(__dirname, 'settings', 'settings.json');
  await fs.promises.writeFile(settingsPath, JSON.stringify(newSettings, null, 2));
});
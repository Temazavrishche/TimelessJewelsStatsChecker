const { app, globalShortcut, ipcMain, Notification, dialog } = require('electron')
const path = require('path')
const fs = require('fs').promises
const { AppTray } = require('./tray/AppTray.js')
const { CalcOverlay } = require('./calcOverlay/CalcOverlay.js')
const { calculate } = require('./calculations/calculator.js')

let clacOverlay = null
async function loadSettings() {
  const settingsPath = path.join(__dirname, 'settings', 'settings.json');
  try {
    global.settings = JSON.parse(await fs.readFile(settingsPath, 'utf-8'))
  }catch(err){
    global.settings = {
      "normal": 53,
      "quad": 26.5,
      "currentTab": "normal",
      "minWeight": 150,
      "tradeIndexed": "1week"
    } // настройки по умолчанию
    new Notification({body: `Error while load settings.\nLoaded default settings`, title: 'Notification', silent: true}).show()
  }
}
loadSettings();
app.on('ready', async () =>{
  new AppTray()
  globalShortcut.register('Ctrl+Shift+T', () => {
    clacOverlay = new CalcOverlay()
    globalShortcut.register('Esc', () => {
      clacOverlay.close()
      clacOverlay = null
      globalShortcut.unregister('Esc')
    })
  })
  console.log('App is ready')
})

ipcMain.on('positions',(event,positions) => {
    calculate(positions)
    clacOverlay.close()
    clacOverlay = null
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

ipcMain.handle('lastResult', async (event) => {
  try{
    const data = await fs.readFile(path.join(__dirname, 'filteredResults.json'))
    return JSON.parse(data);
  }catch(error){
    dialog.showErrorBox(`Error load results`, error.toString())
  }
});

ipcMain.handle('load-settings', () => {
  return global.settings
});

ipcMain.on('save-settings', async (event, newSettings) => {
  const settingsPath = path.join(__dirname, 'settings', 'settings.json');
  try {
    await fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2))
    global.settings = newSettings
  } catch (error) {
    dialog.showErrorBox(`Error save settings`, error.toString())
  }
})
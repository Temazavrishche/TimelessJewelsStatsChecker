const { app, Tray, Menu } = require('electron');
const { MainWindow } = require('../mainWindow/MainWindow.js')
const { Settings } = require("../settings/Settings.js")
const fs = require('fs').promises

class AppTray{
    constructor(){
        this.tray = new Tray('./img/tray-icon.jpg')
        this.tray.setToolTip('Timeless Jewels Checker')
        this.trayMenu()
    }
    trayMenu(){
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Settings',
                click: () => new Settings()
            },
            {
                label: 'Quit',
                click: () => {
                    this.tray.destroy()
                    app.quit()

                }
            },
            {
                label: 'Last results',
                click: async () =>{
                    const jewels = await fs.readFile('./filteredResults.json', 'utf8').then(JSON.parse)
                    new MainWindow(jewels)
                }
            }
        ])
        this.tray.setContextMenu(contextMenu)
    }
}

module.exports.AppTray = AppTray
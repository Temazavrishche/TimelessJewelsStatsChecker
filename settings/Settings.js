const { BrowserWindow } = require('electron');
const path = require('path');

class Settings{
    constructor(){
        this.createResultWindow()
    }
    createResultWindow(){
        this.window = new BrowserWindow({
            title: 'Settings',
            width: 800,
            height: 606,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
        })
        this.window.loadFile(`${path.join(__dirname, 'settings.html')}`)
    }
    close(){
        this.window.close()
    }
}

module.exports.Settings = Settings
const { BrowserWindow } = require('electron');
const path = require('path');
class CalcOverlay{
    constructor(){
        this.window = new BrowserWindow({
            fullscreen: true,
            frame: false,
            resizable: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
            customProperty: 'calcOverlay' 
        });
        this.window.setOpacity(0.25)
        this.window.loadFile('./calcOverlay/calcOverlay.html');
    }
    close(){
        this.window.close()
    }
}

module.exports.CalcOverlay = CalcOverlay
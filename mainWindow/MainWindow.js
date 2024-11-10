const { BrowserWindow } = require('electron')
const path = require('path')

class MainWindow{
    constructor(){
        this.window = new BrowserWindow({
            title: 'Timeless Jewels',
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            },
        })
        this.window.loadFile(`${path.join(__dirname, 'main.html')}`)
    }
    close(){
        this.window.close()
    }
}

module.exports.MainWindow = MainWindow
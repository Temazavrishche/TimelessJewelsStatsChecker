const { clipboard } = require('electron');
const { Hardware } = require("keysender");
const { getStats } = require("./getStats.js");
const fs = require('fs')
const path = require('path')
const settings = JSON.parse(fs.readFileSync(path.join(__dirname, '../settings/settings.json')))

const collectJewels = async (positions) => {
    console.log('start collecting')
    const rawJewels = []
    const step = settings[settings.currentTab]
    const current = {x: positions.first.x, y: positions.first.y}
    const xSteps = Math.round((positions.second.x - positions.first.x) / step) + 1
    const ySteps = Math.round((positions.second.y - positions.first.y) / step) + 1
    const hardware = new Hardware()
    const userClipboard = clipboard.readText()
    let active = true
    let prevClipboard = null;
    let currentXStep = 0
    let currentYStep = 0
    while(active){
        await hardware.mouse.humanMoveTo(current.x,current.y,10,15,25)
        await hardware.keyboard.sendKey(['ctrl','c'],50)
        const currentClipboard = clipboard.readText()
        current.x += step

        currentXStep++
        currentXStep >= xSteps ? (current.x = positions.first.x, current.y += step, currentXStep = 0, currentYStep++) : false

        currentYStep >= ySteps ? active = false : false        

        if(!currentClipboard.includes('Timeless Jewel') || currentClipboard === prevClipboard) continue

        prevClipboard = currentClipboard
        rawJewels.push(currentClipboard)
    }
    clipboard.writeText(userClipboard)
    parseJewel(rawJewels)
}

const parseJewel = (jewels) => {
    const parsedJewels = []
    const jewelsId = {
        'GloriousVanity': ['Ahuana', 'Doryani', 'Xibaqua'],
        'LethalPride': ['Akoya', 'Kaom', 'Rakiata'],
        'BrutalRestraint': ['Asenath', 'Balbala', 'Nasima'],
        'MilitantFaith': ['Avarius', 'Dominus', 'Maxarius'],
        'ElegantHubris': ['Cadiro', 'Caspiro', 'Victario'],
    }
    for(const item in jewels){
        let jewelName = 0
        let conquerorName = ''
        let seed = jewels[item].match(/\b\d{3,6}\b/);
        for (const [name, conqueror] of Object.entries(jewelsId)){
            if (conqueror.some(name => jewels[item].includes(name))){
                jewelName = name
                conquerorName = conqueror.find(cnq => jewels[item].includes(cnq));
            }
        }
        parsedJewels.push({jewelName: jewelName,
            conquerorName: conquerorName,
            seed: seed[0],
        })
    }
    console.log('jewels parsed')
    getStats(parsedJewels)
}
module.exports.collectJewels = collectJewels
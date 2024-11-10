const { clipboard } = require('electron')
const { Hardware } = require("keysender")
const collectJewels = async (positions) => {
    const rawJewels = []
    const step = global.settings[global.settings.currentTab]
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
        currentXStep >= xSteps && (current.x = positions.first.x, current.y += step, currentXStep = 0, currentYStep++)

        currentYStep >= ySteps && (active = false)   

        if(!currentClipboard.includes('Timeless Jewel') || currentClipboard === prevClipboard) continue

        prevClipboard = currentClipboard
        rawJewels.push(currentClipboard)
    }
    clipboard.writeText(userClipboard)
    return parseJewel(rawJewels)
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
        let seed = jewels[item].match(/\b\d{3,6}\b/)
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
    return parsedJewels
}
module.exports.collectJewels = collectJewels
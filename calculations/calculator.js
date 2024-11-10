const { collectJewels } = require('./collectJewels.js')
const { getStats } = require('./getStats.js')
const { calculateWeights } = require('./calculateWeights.js')
const { getPricesFromTrade } = require('./getPricesFromTrade.js')
const { MainWindow } = require('../mainWindow/MainWindow.js')
const { sort } = require('./sortResult.js')
const fs = require('fs').promises
const { app, dialog } = require('electron')


const calculate = async (positions) => {
    const parsedJewels = await collectJewels(positions)
    const jewels = await getStats(parsedJewels)
    calculateWeights(jewels)
    await getPricesFromTrade(jewels)
    sort(jewels)
    console.log(jewels)
    try{
        await fs.writeFile('filteredResults.json', JSON.stringify(jewels, null, 2))
    }catch(error){
        dialog.showErrorBox(`Error save results`, error.toString())
    }
    new MainWindow()
}
module.exports.calculate = calculate
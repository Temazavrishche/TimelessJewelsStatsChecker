const axios = require('axios')
const url = 'https://www.pathofexile.com/api/trade/search/Settlers'
const url2 = 'https://www.pathofexile.com/api/trade/fetch/'
const url3 = 'https://poe.ninja/api/data/currencyoverview?league=Settlers&type=Currency'
const config = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
    }
}
let allPrices
const getPrices = async () => {
    let data 
    await axios.get(url3).then(res => data = res.data)
    allPrices = {
        divine: {
            price: data.lines.find(element => element.detailsId == 'divine-orb').chaosEquivalent,
            icon: data.currencyDetails.find(element => element.tradeId == 'divine')
        },
        mirror: {
            price: data.lines.find(element => element.detailsId == 'mirror-of-kalandra')?.chaosEquivalent,
            icon: data.currencyDetails.find(element => element.tradeId == 'mirror')
        },
        chaos: {
            price: 1,
            icon: data.currencyDetails.find(element => element.tradeId == 'chaos')
        }
    }
    setTimeout(() => {
        getPrices()
    }, 600000);
}
getPrices()
let canDoRequest = true
const getPricesFromTrade = async (jewels) => {
    const filters = {
        "query":{
            "stats":[{
            "type":"count",
            "filters":[],
            "disabled":false,
            "value": {
                "min": 1
            }
            }],
            "filters":{
            "trade_filters":{
                "filters":{
                "indexed":{
                    "option": global.settings.tradeIndexed
                }
                },
                "disabled": false
            }
            },
            "status":{
            "option":"any"
            }
        },
        "sort":{
            "price":"asc"
        }
    }
    if (canDoRequest) {
        const conqs = {
            'GloriousVanity': ['Ahuana', 'Doryani', 'Xibaqua'],
            'LethalPride': ['Akoya', 'Kaom', 'Rakiata'],
            'BrutalRestraint': ['Asenath', 'Balbala', 'Nasima'],
            'MilitantFaith': ['Avarius', 'Dominus', 'Maxarius'],
            'ElegantHubris': ['Cadiro', 'Caspiro', 'Victario'],
        }
        for(const jewel in jewels){
            for(let i = 0; i < conqs[jewels[jewel].jewel].length; i++){
                filters.query.stats[0].filters.push({
                    disabled: false,
                    id: `explicit.pseudo_timeless_jewel_${conqs[jewels[jewel].jewel][i].toLowerCase()}`,
                    value: {
                        min: jewels[jewel].seed,
                        max: jewels[jewel].seed
                    }
                })
            }
            jewels[jewel].prices = {
                lots: []
            }
        }
        try {
            const jewelsLotsHash = await axios.post(url, filters, config)
            const jewelsLots = await fetchWithDelay(jewelsLotsHash)
            for (const chunk of jewelsLots) {
                chunk.data.result.forEach(lotInfo => {
                    for (const jewel in jewels) {
                        if (jewels[jewel].seed == lotInfo.item.explicitMods[0].match(/\b\d{3,6}\b/) && jewels[jewel].jewel == lotInfo.item.name.replace(' ', '')) {
                            jewels[jewel].prices.lots.push({
                                amount: lotInfo.listing.price.amount,
                                currency: lotInfo.listing.price.currency,
                                indexed: lotInfo.listing.indexed,
                                conqueror: lotInfo.item.extended.hashes.explicit[0][0].match(/[^_]+$/)[0]
                            })
                        }
                    }
                })
            }
            for (const jewel in jewels) {
                let priceSum = 0
                if(jewels[jewel].prices.lots.length < 1) continue
                for (const lot of jewels[jewel].prices.lots) {
                    priceSum += (allPrices[lot.currency].price * lot.amount) / allPrices.divine.price
                }
                jewels[jewel].prices.averagePrice = priceSum / jewels[jewel].prices.lots.length
                priceSum = 0
                jewels[jewel].prices.currencyImg = allPrices.divine.icon
            }
        } catch (error) {
            errorHandler(error)
        }
    }
}

const fetchWithDelay = async (jewelsLotsHash) => {
    const promises = [];

    for (let i = 0; i < jewelsLotsHash.data.result.length; i += 10) {
        const chunk = jewelsLotsHash.data.result.slice(i, i + 10)
        promises.push(axios.get(`${url2}${chunk.join(',')}?query=${jewelsLotsHash.data.id}`, config))
        
        await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    const res = await Promise.allSettled(promises)
    const element = res.find(element => element.status == 'rejected')
    element && errorHandler(element.reason);
    return res.filter(element => element.status == 'fulfilled').map(result => result.value)
}
const errorHandler = (error) => {
    console.log(error)
    canDoRequest = false
    setTimeout(() => {
        canDoRequest = true
    }, error.response?.headers['retry-after'] * 1000 || 60000)
}
module.exports.getPricesFromTrade = getPricesFromTrade

const { getAffectedNodes } = require('./getAffectedNodes')
const { MainWindow } = require('../mainWindow/MainWindow')
const fs = require('fs')
const { exec } = require('child_process')
const  path  = require('path')
const locations = [60735,54127,61834,33989,34483,41263,46882,32763,21984,33631,55190,48768,31683,6230,61419,36634,7960,26196,26725,2491,28475]
const statsWeight = {
    "GloriousVanity": {},
    "LethalPride": {'#% increased Strength': [2,12,60,200],
                    '#% increased Armour': [2,12,60,200],
                    '#% of Attack Damage Leeched as Life': [2,2,2,2],
                    '#% chance to deal Double Damage': [6,48,120,200],
                    '#% increased maximum Life': [2,7,14,24],
                    '#% increased Effect of Fortify on you': [2,6,12,20],
                    'Regenerate #% of Life per second': [2,2,4,4],
                    '#% to Fire Resistance': [2,4,6,10],
                    '#% increased Melee Damage': [2,8,20,200],
                    'You take #% reduced Extra Damage from Critical Strikes': [2,4,8,12],
                    '#% increased Melee Critical Strike Chance': [3,8,16,20],
                    '#% increased Burning Damage': [2,4,6,10],
                    '#% increased Totem Damage': [1,2,6,10],
                    '#% to Melee Critical Strike Multiplier': [2,8,50,200],
                    '#% increased Global Physical Damage': [3,7,14,28],
                    '#% increased Warcry Buff Effect': [2,6,10,15],
                    '#% increased Totem Placement speed': [1,1,1,1],
                    '#% increased Stun Duration on Enemies': [1,1,1,1],
                    'Ignites you inflict deal Damage #% faster': [1,2,4,10],
                    '#% reduced Enemy Stun Threshold' : [1,1,1,1],
                    'Gain #% of Physical Damage as Extra Fire Damage': [2,6,12,24],
                    'Gain # Rage on Melee Hit': [3,7,10,15],
                    '#% chance to gain an Endurance Charge on Kill': [2,4,6,6],
                    '#% chance to Intimidate Enemies for 4 seconds on Hit': [3,4,4,4],
                    '# to maximum Fortification': [3,3,6,9]
    },
    "BrutalRestraint": {},
    "MilitantFaith": {},
    "ElegantHubris": {  'Minions have #% increased maximum Life' : [2,8,10,12],
                        '#% to Lightning Resistance' : [2,4,8,10],
                        '#% increased Cold Damage with Attack Skills' : [5,14,24,35],
                        '#% to Global Critical Strike Multiplier' : [15,40,70,100],
                        '#% increased Lightning Damage with Attack Skills' : [5,14,24,34],
                        '#% Chance to Block Attack Damage' : [2,4,8,12],
                        '#% to Fire Resistance' : [2,4,8,10],
                        '#% increased Cast Speed' : [4,15,20,35],
                        '#% increased Rarity of Items found' : [1,1,70,300],
                        '#% increased Evasion Rating per Frenzy Charge' : [4,10,18,25], //Я ХЗ МОЖНО КАК ТО ЭТОТ
                        '#% increased Damage per Frenzy Charge' : [4,15,20,35], //С ЭТИМ ВМЕСТЕ ПОСЧИТАТЬ ТАК ДОРОЖЕ БУДУТ
                        '#% increased Damage per Endurance Charge' : [4,12,18,27], //И ЭТИМ
                        '#% increased Damage per Power Charge': [4,8,16,30], //И ЭТИМ
                        '#% chance to gain a Frenzy Charge on Hit' : [3,5,15,20],
                        '#% increased Armour per Endurance Charge' : [4,10,20,35],
                        "Gain # Endurance Charge every second if you've been Hit Recently" : [1,3,5,5],
                        '#% increased Energy Shield per Power Charge' : [1,1,1,1],
                        '#% chance to gain a Power Charge on Critical Strike' : [1,1,1,1],
                        '#% increased Global Critical Strike Chance' : [3,10,15,25],
                        '#% increased Flask Effect Duration' : [4,7,12,18],
                        '#% increased Spell Critical Strike Chance' : [2,6,12,24],
                        '#% increased Spell Damage' : [3,25,40,60],
                        '#% increased Global Physical Damage' : [3,25,40,60],
                        '#% increased Damage with Bleeding' : [1,10,20,35],
                        'Bleeding you inflict deals Damage #% faster': [0,0,0,0],
                        '#% increased Armour' : [3,15,25,35],
                        '#% increased Mana Regeneration Rate' : [1,2,3,4],
                        '#% increased Projectile Attack Damage' : [4,15,25,40],
                        '#% increased Fire Damage with Attack Skills' : [3,11,15,20],
                        '#% increased maximum Mana' : [3,15,40,70],
                        '#% chance to Suppress Spell Damage' : [3,11,15,20],
                        '#% increased Melee Physical Damage' : [4,15,25,35],
                        '#% increased Effect of Chill' : [2,2,2,2],
                        '#% chance to Avoid being Chilled' : [2,2,2,2],
                        '#% increased maximum Life' : [5,15,25,40],
                        '#% chance to Avoid being Shocked' : [2,2,2,2],
                        '#% Chance to Block Spell Damage' : [3,10,15,20],
                        '#% chance to Avoid Elemental Ailments' : [3,11,15,20],
                        '#% increased Evasion Rating' : [3,11,15,20],
                        'Minions deal #% increased Damage' : [3,15,25,35],
                        '#% to Cold Resistance' : [2,2,2,2],
                        '#% increased effect of Non-Curse Auras from your Skills' : [15,40,70,200],
                        '#% increased Effect of Shock' : [3,11,15,20],
                        '#% increased Attack Speed' : [3,15,25,35],
                        '#% increased Global Accuracy Rating' : [3,5,7,10],
                        '#% increased Evasion Rating' : [3,11,15,20],
                        '#% to Chaos Resistance' : [3,4,7,15],
                        '#% increased Mana Reservation Efficiency of Skills': [10,20,30,40],
                        'Supreme Decadence': [0,0,0,0],
                        'Supreme Ostentation': [20,20,20,20],
                        'Supreme Grandstanding': [1,1,1,1]
                    }
}
const skillTree = JSON.parse(fs.readFileSync('./data/SkillTree.json'))
const passiveSkills = JSON.parse(fs.readFileSync('./data/passive_skills.json'))
const allStats = JSON.parse(fs.readFileSync('./data/stats.json'))
const statsDescriprion = JSON.parse(fs.readFileSync('./data/stat_descriptions.json'))


const getStats = (parsedJewels) => {
    const jewels = {}
    let count = 0
    locations.forEach((location) => {
        parsedJewels.forEach((jewel) => {
            jewels[count] = {   location: location,
                                jewel: jewel.jewelName,
                                conqueror: jewel.conquerorName,
                                seed: Number(jewel.seed),
                                nodes: []
            }
            getAffectedNodes(skillTree.nodes[location]).forEach((node) => {
                jewels[count].nodes.push(getSkillKey(node))
            })
            count++
        })
    })
    fs.writeFileSync('jewels.json',JSON.stringify(jewels,null,2))
    const go_calc = path.join(__dirname, 'go_calc')
    exec(`${go_calc}`, (error,stdout,stderr) =>{
        error ? console.log(error) : false
        stderr ? console.log(stderr) : false
        stdout ? console.log(stdout) : false 
        const stats = JSON.parse(fs.readFileSync('output.json','utf-8'))
        translateStatsManager(stats)
    })
}

const getSkillKey = (node) => {
    for (const item of passiveSkills) 
        if (item.PassiveSkillGraphId === node.skill) 
            return item._key;
}
const translatedStatsManager = (stats) => {
    
}
const translateStats = (stats) => {
    const res = {}
    for(const [id, value] of Object.entries(stats)){
        const nodes = {}
        for(const [node,stats] of Object.entries(value.nodes)){
            for(const [stat, value] of Object.entries(stats)){
                allStats.forEach((item) => {
                    if(item._key == stat){
                        const itemId = item.Id
                        statsDescriprion.descriptors.forEach((description) => {
                            if(description.ids[0] == itemId){
                                const statDescriprion = description.list[0].string.replace(/{0(:\+?d)?}/g, '#')
                                nodes[statDescriprion] = (nodes[statDescriprion] || 0) + 1
                                return
                            }
                        })
                    return
                    }
                })
            }
        }
        res[id] = {
            location: value.location,
            jewel: value.jewel,
            conqueror: value.conqueror,
            seed: value.seed,
            nodes: nodes
        }
    }
    console.log('All stats translated')
    calculateWeight(res)
}

const calculateWeight = (stats) => {
    const res = {}
    for(const [id, values] of Object.entries(stats)){
        let weight = 0
        for(const [node, count] of Object.entries(values.nodes)){
            weight += statsWeight[values.jewel][node][count - 1]
        }
        res[id] = {
            location: values.location,
            jewel: values.jewel,
            conqueror: values.conqueror,
            seed: values.seed,
            nodes: values.nodes,
            weight: weight
        }
    }
    console.log('Got all weights')
    filterResults(res)
}

const filterResults = (stats) => {
    const settings = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'settings', 'settings.json')))
    const minWeight = settings.minWeight
    const temp = Object.entries(stats).filter((item) => item[1].weight >= minWeight)
    const temp2 = temp.reduce((acc, item) => {
        const seedPlusJewel = item[1].seed + item[1].jewel
        acc[seedPlusJewel] = acc[seedPlusJewel] || [];
        acc[seedPlusJewel].push({
            jewel: item[1].jewel,
            conqueror: item[1].conqueror,
            location: item[1].location,
            nodes: item[1].nodes,
            weight: item[1].weight
        });
        return acc;
    }, {});
    const res = Object.entries(temp2)
    res.forEach((item) => item[1].sort((a, b) => b.weight - a.weight))
    fs.writeFileSync('filteredResults.json',JSON.stringify(Object.fromEntries(res),null,2))
    console.log('All calculations done, file with results saved')
    new MainWindow()
}
module.exports.getStats = getStats
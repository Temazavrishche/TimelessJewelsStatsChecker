const { MainWindow } = require('../mainWindow/MainWindow')
const fs = require('fs')
const  path  = require('path')
const statsWeight = {
    "GloriousVanity": {},
    "LethalPride": {'#% increased Strength': [2,12,60,200,1000],
                    '#% increased Armour': [2,12,60,200,1000],
                    '#% of Attack Damage Leeched as Life': [2,2,2,2,2],
                    '#% chance to deal Double Damage': [6,48,120,200,1000],
                    '#% increased maximum Life': [2,7,14,24,36],
                    '#% increased Effect of Fortify on you': [2,6,12,20,36],
                    'Regenerate #% of Life per second': [2,2,4,4,10],
                    '#% to Fire Resistance': [2,4,6,10,18],
                    '#% increased Melee Damage': [2,8,20,150,200],
                    'You take #% reduced Extra Damage from Critical Strikes': [2,4,8,12,16],
                    '#% increased Melee Critical Strike Chance': [3,8,16,20,36],
                    '#% increased Burning Damage': [2,4,6,10,16],
                    '#% increased Totem Damage': [1,2,6,10,16],
                    '#% to Melee Critical Strike Multiplier': [2,8,50,200,500],
                    '#% increased Global Physical Damage': [3,7,14,28,48],
                    '#% increased Warcry Buff Effect': [2,6,10,16,24],
                    '#% increased Totem Placement speed': [1,1,1,1,1],
                    '#% increased Stun Duration on Enemies': [1,1,1,1,1],
                    'Ignites you inflict deal Damage #% faster': [1,2,4,10,16],
                    '#% reduced Enemy Stun Threshold' : [1,1,1,1,1],
                    'Gain #% of Physical Damage as Extra Fire Damage': [2,6,12,24,36],
                    'Gain # Rage on Melee Hit': [3,7,10,16,24],
                    '#% chance to gain an Endurance Charge on Kill': [2,4,6,6,6],
                    '#% chance to Intimidate Enemies for 4 seconds on Hit': [3,4,4,4,4],
                    '# to maximum Fortification': [3,3,6,9,12],
                    '# to Strength' : [1,1,1,1,1]
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

const weightManager = (stats) => {
    const mapping = {
        'GloriousVanity': (stats) => GloriousVanity(stats),
        'LethalPride': (stats) => LethalPride(stats),
        'BrutalRestraint': (stats) => BrutalRestraint(stats),
        'MilitantFaith': (stats) => MilitantFaith(stats),
        'ElegantHubris': (stats) => ElegantHubris(stats),
    }
    for(const i in Object.entries(stats)){
        stats[i].weight = mapping[stats[i].jewel](stats[i])
    }
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
    new MainWindow()
}

const GloriousVanity = (stats) =>{
    
}

const LethalPride = (stats) =>{
    const counts = calcCounts(stats)
    let weight = 0
    for(let [stat, count] of Object.entries(counts)){
        count > 5 ? count = 5 : false
        weight += statsWeight[stats.jewel][stat][count-1] ?? 0
    }
    return weight
}

const BrutalRestraint = (stats) =>{
    
}

const MilitantFaith = (stats) =>{
    
}

const ElegantHubris = (stats) =>{
    
}

const calcCounts = (stats) =>{
    let weight = 0
    const counts = {}
    for(const [oldStat, newStat] of Object.entries(stats.nodes)){
        for(const [node, value] of Object.entries(newStat))
            counts[node] = (counts[node] ?? 0) + 1 * value.length
    }
    return counts
}

module.exports.weightManager = weightManager
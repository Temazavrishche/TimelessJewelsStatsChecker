const { getAffectedNodes } = require('./getAffectedNodes')
const fs = require('fs').promises
const { app, dialog } = require('electron')
const { exec } = require('child_process')
const  path  = require('path')
const locations = [60735,54127,61834,33989,34483,41263,46882,32763,21984,33631,55190,48768,31683,6230,61419,36634,7960,26196,26725,2491,28475]
let skillTree, passiveSkills, allStats, statsDescription
async function loadData() {
    try{
        [skillTree, passiveSkills, allStats, statsDescription] = await Promise.all([
            fs.readFile('./data/SkillTree.json', 'utf8').then(JSON.parse),
            fs.readFile('./data/passive_skills.json', 'utf8').then(JSON.parse),
            fs.readFile('./data/stats.json', 'utf8').then(JSON.parse),
            fs.readFile('./data/stat_descriptions.json', 'utf8').then(JSON.parse)
        ])
    }catch (error) {
        dialog.showErrorBox(`Error load data`, error.toString())
        app.quit()
    }
}
loadData()

/*const indexHandlers = {
    negate: -1,
    times_twenty: 1 / 20,
    canonical_stat: 1,
    per_minute_to_per_second: 60,
    milliseconds_to_seconds: 1000,
    display_indexable_support: 1,
    divide_by_one_hundred: 100,
    milliseconds_to_seconds_2dp_if_required: 1000,
    deciseconds_to_seconds: 10,
    old_leech_percent: 1,
    old_leech_permyriad: 10000,
    times_one_point_five: 1 / 1.5,
    '30%_of_value': 100 / 30,
    divide_by_one_thousand: 1000,
    divide_by_twelve: 12,
    divide_by_six: 6,
    per_minute_to_per_second_2dp_if_required: 60,
    '60%_of_value': 100 / 60,
    double: 1 / 2,
    negate_and_double: 1 / -2,
    multiply_by_four: 1 / 4,
    per_minute_to_per_second_0dp: 60,
    milliseconds_to_seconds_0dp: 1000,
    mod_value_to_item_class: 1,
    milliseconds_to_seconds_2dp: 1000,
    multiplicative_damage_modifier: 1,
    divide_by_one_hundred_2dp: 100,
    per_minute_to_per_second_1dp: 60,
    divide_by_one_hundred_2dp_if_required: 100,
    divide_by_ten_1dp_if_required: 10,
    milliseconds_to_seconds_1dp: 1000,
    divide_by_fifty: 50,
    per_minute_to_per_second_2dp: 60,
    divide_by_ten_0dp: 10,
    divide_by_one_hundred_and_negate: -100,
    tree_expansion_jewel_passive: 1,
    passive_hash: 1,
    divide_by_ten_1dp: 10,
    affliction_reward_type: 1,
    divide_by_five: 5,
    metamorphosis_reward_description: 1,
    divide_by_two_0dp: 2,
    divide_by_fifteen_0dp: 15,
    divide_by_three: 3,
    divide_by_twenty_then_double_0dp: 10,
    divide_by_four: 4
}*/
const getStats = (parsedJewels) => {
    return new Promise(async (resolve, reject) => {
        const jewels = {}
        let count = 0
        parsedJewels.forEach(jewel => {
            jewels[count] = {
                jewel: jewel.jewelName,
                conqueror: jewel.conquerorName,
                seed: Number(jewel.seed),
                locations: {}
            }
            locations.forEach(location => {
                jewels[count].locations[location] = getAffectedNodes(skillTree.nodes[location]).reduce((acc, curr) => {
                    acc.push(getSkillKey(curr))
                    return acc
                }, [])
            })
            count++
        })
        try{
            await fs.writeFile('jewels.json', JSON.stringify(jewels, null, 2))
        }catch{
            dialog.showErrorBox('Error writing jewels.json:', error.toString())
            reject(error)
        }
        const go_calc = path.join(__dirname, 'go_calc')
        exec(`${go_calc}`, async (error, stdout, stderr) => {
            if (error) {
                reject(error)
            } else {
                if (stderr) console.warn("Standard error output:", stderr)
                if (stdout) console.log("Standard output:", stdout)
                try {
                    const jewels = JSON.parse(await fs.readFile('output.json', 'utf-8'))
                    resolve(translateStats(jewels))
                } catch (error) {
                    dialog.showErrorBox('Error reading or parsing output.json:', error.toString())
                    reject(error)
                }
            }
        })
    })
}


const getSkillKey = (node) => {
    for (const item of passiveSkills) 
        if (item.PassiveSkillGraphId === node.skill) 
            return item._key;
}

const translateStats = (jewels) => {
    //Найти в jewels id по _key, потом в stat_description найти описание по ids(_key)
    for (const i in jewels) {    
        for (let location in jewels[i].locations) {
            for (let nodeId in jewels[i].locations[location].nodes) {
                const currentValue = jewels[i].locations[location].nodes[nodeId]
                delete jewels[i].locations[location].nodes[nodeId]
                const statId = allStats.find(stat => stat._key == nodeId).Id
                const description = statsDescription.descriptors.find(desc => desc.ids[0] == statId).list[0].string.replace(/{0(:\+?d)?}/g, '#')
                jewels[i].locations[location].nodes[description] = currentValue
            }
        }
    }
    return jewels
}
module.exports.getStats = getStats
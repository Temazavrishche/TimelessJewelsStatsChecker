const { getAffectedNodes } = require('./getAffectedNodes')
const { weightManager } = require('./calculateWeights')
const fs = require('fs')
const { exec } = require('child_process')
const  path  = require('path')
const locations = [60735,54127,61834,33989,34483,41263,46882,32763,21984,33631,55190,48768,31683,6230,61419,36634,7960,26196,26725,2491,28475]
const skillTree = JSON.parse(fs.readFileSync('./data/SkillTree.json'))
const passiveSkills = JSON.parse(fs.readFileSync('./data/passive_skills.json'))
const allStats = JSON.parse(fs.readFileSync('./data/stats.json'))
const statsDescriprion = JSON.parse(fs.readFileSync('./data/stat_descriptions.json'))
const indexHandlers = {
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
}

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
        translateStats(stats)
    })
}

const getSkillKey = (node) => {
    for (const item of passiveSkills) 
        if (item.PassiveSkillGraphId === node.skill) 
            return item._key;
}

const translateStats = (stats) => {
    const res = {};
    for (const [id, value] of Object.entries(stats)) {
        const nodes = {};
        for (const [node, stats] of Object.entries(value.nodes)) {
            const translatedStats = {};
            for (const [stat, value] of Object.entries(stats)) {
                let item = '';
                const replaceStat = ['base_strength', 'base_dexterity', 'base_intelligence'];
                allStats.forEach((STAT) => {
                    if (STAT._key == stat) {
                        item = replaceStat.includes(STAT.Id) ? STAT.Id.replace('base', 'additional') : STAT.Id;
                        return;
                    }
                });
                let statDescriprion = { list: [{ string: '# to Devotion' }] };
                statsDescriprion.descriptors.forEach((desc) => {
                    if (desc.ids[0] == item) {
                        statDescriprion = desc;
                        return;
                    }
                });
                let finalStat = value;
                if (statDescriprion?.list[0].index_handlers != undefined) {
                    Object.keys(statDescriprion.list[0].index_handlers).forEach((handler) => {
                        finalStat = finalStat / (indexHandlers[handler] ?? 1);
                    });
                }
                const st = statDescriprion?.list[0].string.replace(/{0(:\+?d)?}/g, '#');

                translatedStats[st] ? translatedStats[st].push(finalStat) : translatedStats[st] = [finalStat]

            }

            let skillName = '';
            passiveSkills.forEach((skill) => skill._key == node ? skillName = skill.Name : false);

            
            if (nodes[skillName]) {
                Object.keys(translatedStats).forEach((key) => {
                    if (nodes[skillName][key]) {
                        nodes[skillName][key] = nodes[skillName][key].concat(translatedStats[key])
                    } else {
                        nodes[skillName][key] = translatedStats[key]
                    }
                });
            }
            else 
                nodes[skillName] = translatedStats;
        }
        res[id] = {
            location: value.location,
            jewel: value.jewel,
            conqueror: value.conqueror,
            seed: value.seed,
            nodes: nodes
        };
    }
    console.log('All stats translated');
    fs.writeFileSync('test.json', JSON.stringify(res, null, 2));
    weightManager(res)
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
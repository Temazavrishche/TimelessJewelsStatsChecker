document.addEventListener('DOMContentLoaded', async () => {
    const lastResult = await window.lastResult.lastResult();
    loadResult(lastResult);

    /*function cycleColors(elements, colors) {
        let index = 0;
        setInterval(() => {
            elements.forEach(element => {
                element.style.color = colors[index];
            });
            index = (index + 1) % colors.length;
        }, 2500); // Время в миллисекундах должно совпадать с длительностью перехода
    }
    
    // Функция для применения цветового цикла ко всем элементам с указанным классом
    function applyColorCycleToClass(className, colors) {
        const elements = document.querySelectorAll(`.${className}`);
        cycleColors(elements, colors);
    }
    
    // Применяем цветовой цикл ко всем элементам с указанными классами
    applyColorCycleToClass("GloriousVanity", ["#FF0000", "#FF6347"]);
    applyColorCycleToClass("LethalPride", ["#FFA500", "#FF8C00"]);
    applyColorCycleToClass("BrutalRestraint", ["#FFFF00", "#FFD700"]);
    applyColorCycleToClass("MilitantFaith", ["#008000", "#32CD32"]);
    applyColorCycleToClass("ElegantHubris", ["#C0C0C0", "#D3D3D3"]);*/ //Жрет много GPU
});

const jewelsId = {
    'GloriousVanity': 1,
    'LethalPride': 2,
    'BrutalRestraint': 3,
    'MilitantFaith': 4,
    'ElegantHubris': 5
}
const loadResult = (lastResult) =>{
    const container = document.getElementById('jewels-container');
    for(const item in lastResult){
        const seed = item.match(/\d+/g)
        const jewelType = item.match(/[a-zA-Z]+/g);
        const conqueror = lastResult[item][0].conqueror
        const seedGroup = document.createElement('div');
        seedGroup.className = 'seed-group';

        const seedHeader = document.createElement('div');
        seedHeader.className = 'seed-header';
        const innerHTML = {
            GloriousVanity: `<img src="../img/${jewelType}.png" alt="${jewelType}"><p>Bathed in the blood of <span class="${jewelType}">${seed}</span> sacrificed in the name of <span class="${jewelType}">${conqueror}</span></p>`,
            LethalPride: `<img src="../img/${jewelType}.png" alt="${jewelType}"><p>Commanded leadership over <span class="${jewelType}">${seed}</span> warriors under <span class="${jewelType}">${conqueror}</span></p>`,
            BrutalRestraint: `<img src="../img/${jewelType}.png" alt="${jewelType}"><p>Denoted service of <span class="${jewelType}">${seed}</span> dekhara in the akhara of <span class="${jewelType}">${conqueror}</span></p>`,
            MilitantFaith: `<img src="../img/${jewelType}.png" alt="${jewelType}"><p>Carved to glorify <span class="${jewelType}">${seed}</span> new faithful converted by High Templar <span class="${jewelType}">${conqueror}</span></p>`,
            ElegantHubris: `<img src="../img/${jewelType}.png" alt="${jewelType}"><p>Commissioned <span class="${jewelType}">${seed}</span> coins to commemorate <span class="${jewelType}">${conqueror}</span></p>`
        }
        seedHeader.innerHTML = innerHTML[jewelType]
        seedGroup.appendChild(seedHeader);

        const seedRow = document.createElement('div');
        seedRow.className = 'seed-row';

        lastResult[item].forEach(jewel => {
            const jewelBlock = document.createElement('div');
            const location = jewel.location
            const url = `https://vilsol.github.io/timeless-jewels/tree?jewel=${jewelsId[jewelType]}&conqueror=${conqueror}&seed=${seed}&location=${location}&mode=seed`
            jewelBlock.className = 'jewel-block';
            jewelBlock.innerHTML = 
                `<div class="jewel-details">
                    <p><strong>Weight:</strong> ${jewel.weight}</p>
                    <p><strong>Location:</strong> ${jewel.location}</p>
                    <p><a href="${url}" target="_blank" class="${jewelType}">View Jewel</a></p>
                </div>`
            seedRow.appendChild(jewelBlock);
        });
        seedGroup.appendChild(seedRow);
        container.appendChild(seedGroup);
    }
}
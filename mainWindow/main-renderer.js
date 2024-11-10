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
const loadResult = (lastResult) => {
    const container = document.getElementById('jewels-container');
    for (const item in lastResult) {
        if (Object.keys(lastResult[item].locations).length < 1) continue;
        const seed = lastResult[item].seed;
        const jewelType = lastResult[item].jewel;
        const conqueror = lastResult[item].conqueror;
        const seedGroup = document.createElement('div');
        seedGroup.className = 'seed-group';

        // Seed Header
        const seedHeader = document.createElement('div');
        seedHeader.className = 'seed-header';
        const innerHTML = {
            GloriousVanity: `<img src="../img/${jewelType}.png" alt="${jewelType}"><p>Bathed in the blood of <span class="${jewelType}">${seed}</span> sacrificed in the name of <span class="${jewelType}">${conqueror}</span></p>`,
            LethalPride: `<img src="../img/${jewelType}.png" alt="${jewelType}"><p>Commanded leadership over <span class="${jewelType}">${seed}</span> warriors under <span class="${jewelType}">${conqueror}</span></p>`,
            BrutalRestraint: `<img src="../img/${jewelType}.png" alt="${jewelType}"><p>Denoted service of <span class="${jewelType}">${seed}</span> dekhara in the akhara of <span class="${jewelType}">${conqueror}</span></p>`,
            MilitantFaith: `<img src="../img/${jewelType}.png" alt="${jewelType}"><p>Carved to glorify <span class="${jewelType}">${seed}</span> new faithful converted by High Templar <span class="${jewelType}">${conqueror}</span></p>`,
            ElegantHubris: `<img src="../img/${jewelType}.png" alt="${jewelType}"><p>Commissioned <span class="${jewelType}">${seed}</span> coins to commemorate <span class="${jewelType}">${conqueror}</span></p>`
        };
        seedHeader.innerHTML = innerHTML[jewelType];
        seedGroup.appendChild(seedHeader);

        if (Object.keys(lastResult[item].prices.lots).length > 0) {
            // Average Price and Currency Icon
            const averagePriceBlock = document.createElement('div');
            averagePriceBlock.className = 'averageprice';
            const price = lastResult[item].prices.averagePrice;
            const currencyImg = lastResult[item].prices.currencyImg.icon;
            const currencyTooltip = document.createElement('div');
            currencyTooltip.className = 'currency-tooltip';
            const lots = lastResult[item].prices.lots.map(lot => {
                return `
                    <div class="lot">
                        <p><strong>Amount:</strong> ${lot.amount}</p>
                        <p><strong>Currency:</strong> ${lot.currency}</p>
                        <p><strong>Indexed:</strong> ${lot.indexed}</p>
                        <p><strong>Conqueror:</strong> ${lot.conqueror}</p>
                    </div>
                `;
            }).join('');
            currencyTooltip.innerHTML = lots;

            const currencyIcon = document.createElement('img');
            currencyIcon.src = currencyImg;
            currencyIcon.alt = 'Currency';
            currencyIcon.className = 'currency-icon';

            // Show tooltip on hover
            currencyIcon.addEventListener('mouseover', () => {
                currencyTooltip.style.display = 'block';
            });
            currencyIcon.addEventListener('mouseout', () => {
                currencyTooltip.style.display = 'none';
            });

            // Dynamically position the tooltip near the cursor
            currencyIcon.addEventListener('mousemove', (event) => {
                const tooltipWidth = currencyTooltip.offsetWidth;
                const tooltipHeight = currencyTooltip.offsetHeight;
                const mouseX = event.pageX;
                const mouseY = event.pageY;
                currencyTooltip.style.left = `${mouseX + 10}px`;
                currencyTooltip.style.top = `${mouseY + 10}px`;
            });

            averagePriceBlock.innerHTML = `<h3>Average Price: ${price}</h3>`;
            averagePriceBlock.appendChild(currencyIcon);
            averagePriceBlock.appendChild(currencyTooltip);
            seedGroup.appendChild(averagePriceBlock);
        }

        // Seed Row
        const seedRow = document.createElement('div');
        seedRow.className = 'seed-row';
        for (const location in lastResult[item].locations) {
            const jewelBlock = document.createElement('div');
            jewelBlock.className = 'jewel-block';
            jewelBlock.innerHTML = `
                <div class="jewel-details">
                    <p><strong>Weight:</strong> ${lastResult[item].locations[location].weight}</p>
                    <p><strong>Location:</strong> ${location}</p>
                    <p><a href="https://vilsol.github.io/timeless-jewels/tree?jewel=${jewelsId[jewelType]}&conqueror=${conqueror}&seed=${seed}&location=${location}&mode=seed" target="_blank" class="${jewelType}">View Jewel</a></p>
                </div>
            `;

            // Tooltip functionality for jewel-block
            jewelBlock.addEventListener('mouseenter', (event) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'jewel-tooltip';
                tooltip.innerHTML = generateNodesTooltip(lastResult[item].locations[location].nodes);
                document.body.appendChild(tooltip);

                const rect = jewelBlock.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width + 10}px`;
                tooltip.style.top = `${rect.top}px`;

                jewelBlock.addEventListener('mouseleave', () => {
                    tooltip.remove();
                });
            });

            seedRow.appendChild(jewelBlock);
        }
        seedGroup.appendChild(seedRow);
        container.appendChild(seedGroup);
    }
};

// Генерация содержимого для tooltip из объекта nodes
const generateNodesTooltip = (nodes) => {
    let tooltipContent = '';
    for (const node in nodes) {
        tooltipContent += `<p><strong>${node}:</strong> ${nodes[node]}</p>`;
    }
    return tooltipContent;
};


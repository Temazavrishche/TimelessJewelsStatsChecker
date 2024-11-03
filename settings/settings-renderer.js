document.addEventListener('DOMContentLoaded', async () => {
    const settings = await window.settings.loadSettings();
    loadSettings(settings);
});

const loadSettings = (settings) => {
    const container = document.getElementById('settings-container');

    // Создание поля для "Step for normal tab"
    const normalTabGroup = document.createElement('div');
    normalTabGroup.className = 'setting-group';
    const normalTabLabel = document.createElement('label');
    normalTabLabel.textContent = 'Step for normal tab:';
    const normalTabInput = document.createElement('input');
    normalTabInput.type = 'number';
    normalTabInput.value = settings.normal;
    normalTabLabel.appendChild(normalTabInput);
    normalTabGroup.appendChild(normalTabLabel);
    container.appendChild(normalTabGroup);

    // Создание поля для "Step for quad tab"
    const quadTabGroup = document.createElement('div');
    quadTabGroup.className = 'setting-group';
    const quadTabLabel = document.createElement('label');
    quadTabLabel.textContent = 'Step for quad tab:';
    const quadTabInput = document.createElement('input');
    quadTabInput.type = 'number';
    quadTabInput.value = settings.quad;
    quadTabLabel.appendChild(quadTabInput);
    quadTabGroup.appendChild(quadTabLabel);
    container.appendChild(quadTabGroup);

    // Создание поля для "min weight"
    const minWeightGroup = document.createElement('div');
    minWeightGroup.className = 'setting-group';
    const minWeightLabel = document.createElement('label');
    minWeightLabel.textContent = 'Minimum weight for display:';
    const minWeightInput = document.createElement('input');
    minWeightInput.type = 'number';
    minWeightInput.value = settings.minWeight;
    minWeightLabel.appendChild(minWeightInput);
    minWeightGroup.appendChild(minWeightLabel);
    container.appendChild(minWeightGroup);

    // Создание выпадающего списка для "Current tab"
    const currentTabGroup = document.createElement('div');
    currentTabGroup.className = 'setting-group';
    const currentTabLabel = document.createElement('label');
    currentTabLabel.textContent = 'Current tab:';
    const currentTabSelect = document.createElement('select');
    const normalOption = document.createElement('option');
    normalOption.value = 'normal';
    normalOption.textContent = 'Normal';
    const quadOption = document.createElement('option');
    quadOption.value = 'quad';
    quadOption.textContent = 'Quad';

    currentTabSelect.appendChild(normalOption);
    currentTabSelect.appendChild(quadOption);
    currentTabSelect.value = settings.currentTab;
    currentTabLabel.appendChild(currentTabSelect);
    currentTabGroup.appendChild(currentTabLabel);
    container.appendChild(currentTabGroup);

    // Создание кнопки "Сохранить"
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Settings';
    saveButton.className = 'save-button';

    saveButton.addEventListener('click', () => {
        const updatedSettings = {
            normal: Number(normalTabInput.value),
            quad: Number(quadTabInput.value),
            currentTab: currentTabSelect.value,
            minWeight: Number(minWeightInput.value)
        };

        window.settings.saveSettings(updatedSettings);
    });

    container.appendChild(saveButton);
};
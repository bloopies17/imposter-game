const defaultCategories = {
    Locations: ['Beach', 'Hospital', 'School', 'Restaurant', 'Airport', 'Library', 'Gym', 'Park'],
    Objects: ['Umbrella', 'Laptop', 'Guitar', 'Camera', 'Bicycle', 'Watch', 'Backpack', 'Sunglasses'],
    Animals: ['Elephant', 'Dolphin', 'Eagle', 'Tiger', 'Penguin', 'Giraffe', 'Butterfly', 'Kangaroo'],
    Food: ['Pizza', 'Sushi', 'Burger', 'Pasta', 'Tacos', 'Ice Cream', 'Salad', 'Sandwich'],
    Professions: ['Doctor', 'Teacher', 'Chef', 'Pilot', 'Artist', 'Engineer', 'Musician', 'Athlete'],
    Numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
};

let categories = { ...defaultCategories };

let gameState = {
    players: [],
    imposter: null,
    category: null,
    word: null,
    allowImposterFirst: false,
    revealedPlayers: new Set(),
    firstPlayer: null,
    selectedCategory: 'random',
    customCategory: null
};

const setupScreen = document.getElementById('setupScreen');
const categorySelectionScreen = document.getElementById('categorySelectionScreen');
const gameplayScreen = document.getElementById('gameplayScreen');
const playerNameInput = document.getElementById('playerNameInput');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerList = document.getElementById('playerList');
const currentCategoryBtn = document.getElementById('currentCategoryBtn');
const currentCategoryLabel = document.getElementById('currentCategoryLabel');
const categoryGrid = document.getElementById('categoryGrid');
const categoryBackBtn = document.getElementById('categoryBackBtn');
const showCreateCategoryBtn = document.getElementById('showCreateCategoryBtn');
const categoryCreateForm = document.getElementById('categoryCreateForm');
const newCategoryName = document.getElementById('newCategoryName');
const newCategoryWords = document.getElementById('newCategoryWords');
const saveNewCategoryBtn = document.getElementById('saveNewCategoryBtn');
const cancelNewCategoryBtn = document.getElementById('cancelNewCategoryBtn');
const imposterFirstToggle = document.getElementById('imposterFirstToggle');
const startGameBtn = document.getElementById('startGameBtn');
const categoryDisplay = document.getElementById('categoryDisplay');
const playerButtons = document.getElementById('playerButtons');
const playAgainBtn = document.getElementById('playAgainBtn');
const revealModal = document.getElementById('revealModal');
const modalCategory = document.getElementById('modalCategory');
const modalWord = document.getElementById('modalWord');
const closeModalBtn = document.getElementById('closeModalBtn');
const startPlayerModal = document.getElementById('startPlayerModal');
const clearNamesBtn = document.getElementById('clearNamesBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const cancelGameBtn = document.getElementById('cancelGameBtn');
const startPlayerAnnouncement = document.getElementById('startPlayerAnnouncement');
const closeStartPlayerBtn = document.getElementById('closeStartPlayerBtn');

const resultsScreen = document.getElementById('resultsScreen');
const resultsStarterName = document.getElementById('resultsStarterName');
const revealImposterBtn = document.getElementById('revealImposterBtn');
const imposterRevealText = document.getElementById('imposterRevealText');
const resultsImposterName = document.getElementById('resultsImposterName');
const resultsPlayAgainBtn = document.getElementById('resultsPlayAgainBtn');
const resultsHomeBtn = document.getElementById('resultsHomeBtn');

function loadCustomCategories() {
    const saved = localStorage.getItem('customCategories');
    if (saved) {
        try {
            const customCats = JSON.parse(saved);
            Object.keys(customCats).forEach(catName => {
                categories[catName] = customCats[catName];
            });
        } catch (e) {
            console.error('Error loading custom categories:', e);
        }
    }
}

function saveCustomCategory(name, words) {
    const saved = localStorage.getItem('customCategories');
    let customCats = {};

    if (saved) {
        try {
            customCats = JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing saved categories:', e);
        }
    }

    customCats[name] = words;
    localStorage.setItem('customCategories', JSON.stringify(customCats));

    categories[name] = words;
}

function getSelectedCategoryLabel() {
    if (gameState.selectedCategory === 'random') return 'Random';
    return gameState.selectedCategory;
}

function syncCurrentCategoryLabel() {
    currentCategoryLabel.textContent = getSelectedCategoryLabel();
}

function showCategoryScreen() {
    categoryCreateForm.style.display = 'none';
    newCategoryName.value = '';
    newCategoryWords.value = '';

    setupScreen.classList.remove('active');
    gameplayScreen.classList.remove('active');
    categorySelectionScreen.classList.add('active');

    renderCategoryGrid();
}

function showSetupScreen() {
    categorySelectionScreen.classList.remove('active');
    gameplayScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    setupScreen.classList.add('active');
}

function showResultsScreen() {
    resultsStarterName.textContent = gameState.firstPlayer;
    resultsImposterName.textContent = gameState.imposter;
    imposterRevealText.classList.add('hidden');

    setupScreen.classList.remove('active');
    categorySelectionScreen.classList.remove('active');
    gameplayScreen.classList.remove('active');
    resultsScreen.classList.add('active');
}

function hideResultsScreen() {
    resultsScreen.classList.remove('active');
}

function setSelectedCategory(categoryName) {
    gameState.selectedCategory = categoryName;
    syncCurrentCategoryLabel();
}

function getCustomCategoryNames() {
    return Object.keys(categories).filter(cat => !defaultCategories.hasOwnProperty(cat));
}

function renderCategoryGrid() {
    const defaultNames = Object.keys(defaultCategories);
    const customNames = getCustomCategoryNames();

    const all = ['random', ...defaultNames, ...customNames];

    categoryGrid.innerHTML = all.map((cat) => {
        const isCustom = cat !== 'random' && !defaultCategories.hasOwnProperty(cat);
        const label = cat === 'random' ? 'Random' : cat;
        const selected = cat === gameState.selectedCategory ? ' selected' : '';
        const customClass = isCustom ? ' custom' : '';
        return `<button class="category-btn${customClass}${selected}" data-category="${cat}">${label}</button>`;
    }).join('');

    categoryGrid.querySelectorAll('[data-category]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const chosen = btn.getAttribute('data-category');
            setSelectedCategory(chosen);
            showSetupScreen();
        });
    });
}

function updatePlayerList() {
    if (gameState.players.length === 0) {
        playerList.innerHTML = '<div class="empty-message">No players added yet</div>';
        startGameBtn.disabled = true;
    } else {
        playerList.innerHTML = gameState.players.map((player, index) => `
            <div class="player-item">
                <span class="player-name">${player}</span>
                <button class="remove-btn" onclick="removePlayer(${index})">Remove</button>
            </div>
        `).join('');
        startGameBtn.disabled = gameState.players.length < 3;
    }
}

function addPlayer() {
    const name = playerNameInput.value.trim();
    if (name && !gameState.players.includes(name)) {
        gameState.players.push(name);
        playerNameInput.value = '';
        updatePlayerList();
    } else if (gameState.players.includes(name)) {
        alert('This player name already exists!');
    }
}

function removePlayer(index) {
    gameState.players.splice(index, 1);
    updatePlayerList();
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function startGame() {
    if (gameState.players.length < 3) {
        alert('You need at least 3 players to start the game!');
        return;
    }

    if (gameState.selectedCategory === 'random') {
        const categoryNames = Object.keys(categories);
        gameState.category = getRandomItem(categoryNames);
        gameState.word = getRandomItem(categories[gameState.category]);
    } else {
        gameState.category = gameState.selectedCategory;
        gameState.word = getRandomItem(categories[gameState.selectedCategory]);
    }

    gameState.allowImposterFirst = imposterFirstToggle.checked;

    gameState.imposter = getRandomItem(gameState.players);

    const eligiblePlayers = gameState.allowImposterFirst
        ? gameState.players
        : gameState.players.filter(p => p !== gameState.imposter);
    gameState.firstPlayer = getRandomItem(eligiblePlayers);

    gameState.revealedPlayers.clear();

    setupScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    gameplayScreen.classList.add('active');

    categoryDisplay.textContent = `Category: ${gameState.category}`;

    renderPlayerButtons();
}

function renderPlayerButtons() {
    playerButtons.innerHTML = gameState.players.map(player => `
        <button class="player-btn" data-player="${player}" onclick="revealRole('${player}')">
            ${player}
        </button>
    `).join('');
}

function revealRole(playerName) {
    const isImposter = playerName === gameState.imposter;

    modalCategory.textContent = gameState.category;

    if (isImposter) {
        modalWord.textContent = 'YOU ARE THE IMPOSTER';
        modalWord.classList.add('imposter');
    } else {
        modalWord.textContent = gameState.word;
        modalWord.classList.remove('imposter');
    }

    revealModal.classList.add('active');

    closeModalBtn.onclick = () => {
        revealModal.classList.remove('active');

        gameState.revealedPlayers.add(playerName);

        const playerBtn = document.querySelector(`[data-player="${playerName}"]`);
        if (playerBtn) {
            playerBtn.disabled = true;
        }

        if (gameState.revealedPlayers.size === gameState.players.length) {
            setTimeout(() => {
                showResultsScreen();
            }, 300);
        }
    };
}

function announceFirstPlayer() {
    startPlayerAnnouncement.innerHTML = `
        Everyone has seen their role!<br><br>
        <strong>${gameState.firstPlayer}</strong> starts the questioning.
    `;
    startPlayerModal.classList.add('active');
}

function clearPlayerNames() {
    gameState.players = [];
    updatePlayerList();
}

function resetAll() {
    // Clear player names
    clearPlayerNames();
    
    // Reset category to default
    gameState.selectedCategory = 'random';
    gameState.customCategory = null;
    syncCurrentCategoryLabel();
    
    // Reset other UI elements
    playerNameInput.value = '';
    imposterFirstToggle.checked = false;
    gameState.allowImposterFirst = false;
}

function cancelGame() {
    // Just return to setup screen without clearing anything
    revealModal.classList.remove('active');
    startPlayerModal.classList.remove('active');
    resultsScreen.classList.remove('active');
    showSetupScreen();
}

function playAgainSamePlayersSameCategory() {
    if (!gameState.category) {
        return;
    }

    const categoryToUse = gameState.category;
    gameState.word = getRandomItem(categories[categoryToUse]);
    gameState.imposter = getRandomItem(gameState.players);

    const eligiblePlayers = gameState.allowImposterFirst
        ? gameState.players
        : gameState.players.filter(p => p !== gameState.imposter);
    gameState.firstPlayer = getRandomItem(eligiblePlayers);

    gameState.revealedPlayers.clear();

    hideResultsScreen();
    setupScreen.classList.remove('active');
    categorySelectionScreen.classList.remove('active');
    gameplayScreen.classList.add('active');

    categoryDisplay.textContent = `Category: ${gameState.category}`;
    renderPlayerButtons();
}

function resetGame() {
    // Keep the current players and settings, just reset the game state
    gameState.imposter = null;
    gameState.category = null;
    gameState.word = null;
    gameState.revealedPlayers.clear();
    gameState.firstPlayer = null;
    
    // Clear the player buttons
    playerButtons.innerHTML = '';
    
    // Show setup screen and hide others
    showSetupScreen();
}

function softReset() {
    gameState.imposter = null;
    gameState.category = null;
    gameState.word = null;
    gameState.revealedPlayers.clear();
    gameState.firstPlayer = null;
    gameState.customCategory = null;

    startPlayerModal.classList.remove('active');
    gameplayScreen.classList.remove('active');
    categorySelectionScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    setupScreen.classList.add('active');
}

// Add event listeners
addPlayerBtn.addEventListener('click', addPlayer);
clearNamesBtn.addEventListener('click', clearPlayerNames);
resetAllBtn.addEventListener('click', resetAll);
cancelGameBtn.addEventListener('click', cancelGame);

playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPlayer();
    }
});

startGameBtn.addEventListener('click', startGame);

closeStartPlayerBtn.addEventListener('click', () => {
    startPlayerModal.classList.remove('active');
});

playAgainBtn.addEventListener('click', softReset);

revealImposterBtn.addEventListener('click', () => {
    imposterRevealText.classList.toggle('hidden');
});

resultsPlayAgainBtn.addEventListener('click', playAgainSamePlayersSameCategory);

resultsHomeBtn.addEventListener('click', () => {
    hideResultsScreen();
    showSetupScreen();
});

currentCategoryBtn.addEventListener('click', showCategoryScreen);

categoryBackBtn.addEventListener('click', () => {
    showSetupScreen();
});

showCreateCategoryBtn.addEventListener('click', () => {
    categoryCreateForm.style.display = categoryCreateForm.style.display === 'none' ? 'block' : 'none';
});

cancelNewCategoryBtn.addEventListener('click', () => {
    categoryCreateForm.style.display = 'none';
    newCategoryName.value = '';
    newCategoryWords.value = '';
});

saveNewCategoryBtn.addEventListener('click', () => {
    const name = newCategoryName.value.trim();
    const wordsRaw = newCategoryWords.value.trim();

    if (!name || !wordsRaw) {
        alert('Please fill in both the category name and words list for your custom category!');
        return;
    }

    if (name.toLowerCase() === 'random') {
        alert('Category name cannot be "Random".');
        return;
    }

    if (defaultCategories.hasOwnProperty(name)) {
        alert('That category name already exists as a default category. Please choose another name.');
        return;
    }

    const wordsArray = wordsRaw.split(',').map(w => w.trim()).filter(w => w.length > 0);
    if (wordsArray.length < 3) {
        alert('Please provide at least 3 words for your custom category!');
        return;
    }

    saveCustomCategory(name, wordsArray);
    newCategoryName.value = '';
    newCategoryWords.value = '';
    categoryCreateForm.style.display = 'none';

    renderCategoryGrid();
});

loadCustomCategories();
syncCurrentCategoryLabel();
updatePlayerList();

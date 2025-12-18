const categories = {
    Locations: ['Beach', 'Hospital', 'School', 'Restaurant', 'Airport', 'Library', 'Gym', 'Park'],
    Objects: ['Umbrella', 'Laptop', 'Guitar', 'Camera', 'Bicycle', 'Watch', 'Backpack', 'Sunglasses'],
    Animals: ['Elephant', 'Dolphin', 'Eagle', 'Tiger', 'Penguin', 'Giraffe', 'Butterfly', 'Kangaroo'],
    Food: ['Pizza', 'Sushi', 'Burger', 'Pasta', 'Tacos', 'Ice Cream', 'Salad', 'Sandwich'],
    Professions: ['Doctor', 'Teacher', 'Chef', 'Pilot', 'Artist', 'Engineer', 'Musician', 'Athlete'],
    Numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    
};

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
const gameplayScreen = document.getElementById('gameplayScreen');
const playerNameInput = document.getElementById('playerNameInput');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerList = document.getElementById('playerList');
const categorySelect = document.getElementById('categorySelect');
const customCategorySection = document.getElementById('customCategorySection');
const customCategoryName = document.getElementById('customCategoryName');
const customWordsList = document.getElementById('customWordsList');
const imposterFirstToggle = document.getElementById('imposterFirstToggle');
const startGameBtn = document.getElementById('startGameBtn');
const categoryDisplay = document.getElementById('categoryDisplay');
const playerButtons = document.getElementById('playerButtons');
const resetGameBtn = document.getElementById('resetGameBtn');
const revealModal = document.getElementById('revealModal');
const modalCategory = document.getElementById('modalCategory');
const modalWord = document.getElementById('modalWord');
const closeModalBtn = document.getElementById('closeModalBtn');
const startPlayerModal = document.getElementById('startPlayerModal');
const startPlayerAnnouncement = document.getElementById('startPlayerAnnouncement');
const closeStartPlayerBtn = document.getElementById('closeStartPlayerBtn');

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

    gameState.selectedCategory = categorySelect.value;
    
    if (gameState.selectedCategory === 'custom') {
        const customName = customCategoryName.value.trim();
        const customWords = customWordsList.value.trim();
        
        if (!customName || !customWords) {
            alert('Please fill in both the category name and words list for your custom category!');
            return;
        }
        
        const wordsArray = customWords.split(',').map(word => word.trim()).filter(word => word.length > 0);
        
        if (wordsArray.length < 3) {
            alert('Please provide at least 3 words for your custom category!');
            return;
        }
        
        gameState.customCategory = {
            name: customName,
            words: wordsArray
        };
        
        gameState.category = customName;
        gameState.word = getRandomItem(wordsArray);
    } else if (gameState.selectedCategory === 'random') {
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
                announceFirstPlayer();
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

function resetGame() {
    gameState = {
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
    
    playerNameInput.value = '';
    categorySelect.value = 'random';
    customCategoryName.value = '';
    customWordsList.value = '';
    customCategorySection.style.display = 'none';
    imposterFirstToggle.checked = false;
    
    gameplayScreen.classList.remove('active');
    setupScreen.classList.add('active');
    
    updatePlayerList();
}

addPlayerBtn.addEventListener('click', addPlayer);

playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPlayer();
    }
});

startGameBtn.addEventListener('click', startGame);

resetGameBtn.addEventListener('click', resetGame);

closeStartPlayerBtn.addEventListener('click', () => {
    startPlayerModal.classList.remove('active');
});

categorySelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        customCategorySection.style.display = 'block';
    } else {
        customCategorySection.style.display = 'none';
    }
});

updatePlayerList();

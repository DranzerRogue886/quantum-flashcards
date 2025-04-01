// Constants
const PILE_CONFIGS = {
    unstudied: { name: 'unstudied', color: '#9c27b0' },
    wrong: { name: 'wrong', color: '#f44336' },
    almost: { name: 'almost', color: '#ffd700' },
    right: { name: 'right', color: '#4caf50' },
    done: { name: 'done', color: '#9c27b0' }
};

// State
let cards = [];
let currentCard = null;
let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const currentCardElement = document.getElementById('currentCard');
const questionInput = document.getElementById('questionInput');
const answerInput = document.getElementById('answerInput');
const flipBtn = document.getElementById('flipBtn');
const saveBtn = document.getElementById('saveBtn');
const pileElements = document.querySelectorAll('.pile-item');

// Initialize
function init() {
    loadCards();
    updatePileCounts();
    setupEventListeners();
    updateTheme();
}

// Event Listeners
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    flipBtn.addEventListener('click', flipCard);
    saveBtn.addEventListener('click', saveCard);
    
    pileElements.forEach(pile => {
        pile.addEventListener('click', () => moveToPile(pile.dataset.pile));
        // Update pile card color
        const card = pile.querySelector('.pile-card');
        card.style.borderLeft = `4px solid ${PILE_CONFIGS[pile.dataset.pile].color}`;
    });
}

// Theme Management
function toggleTheme() {
    isDarkMode = !isDarkMode;
    updateTheme();
}

function updateTheme() {
    document.body.classList.toggle('dark-mode', isDarkMode);
    themeToggle.querySelector('.material-icons').textContent = isDarkMode ? 'light_mode' : 'dark_mode';
}

// Card Management
function loadCards() {
    const savedCards = localStorage.getItem('flashcards');
    if (savedCards) {
        cards = JSON.parse(savedCards);
    }
}

function saveCards() {
    localStorage.setItem('flashcards', JSON.stringify(cards));
    updatePileCounts();
}

function updatePileCounts() {
    for (const pile of Object.keys(PILE_CONFIGS)) {
        const count = cards.filter(card => card.pile === pile).length;
        const pileElement = document.querySelector(`[data-pile="${pile}"] .pile-count`);
        if (pileElement) {
            pileElement.textContent = count;
        }
    }
}

// Card Actions
function flipCard() {
    currentCardElement.classList.toggle('flipped');
}

function saveCard() {
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();
    
    if (!question || !answer) return;

    const newCard = {
        id: Date.now().toString(),
        question,
        answer,
        pile: 'unstudied',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };

    cards.push(newCard);
    saveCards();
    resetInputs();
}

function moveToPile(pile) {
    if (!currentCard) return;

    currentCard.pile = pile;
    currentCard.lastModified = new Date().toISOString();
    saveCards();

    // Show next card or reset
    currentCard = cards.find(card => card.pile === 'unstudied') || null;
    if (currentCard) {
        displayCard(currentCard);
    } else {
        resetInputs();
    }
}

function displayCard(card) {
    questionInput.value = card.question;
    answerInput.value = card.answer;
    currentCardElement.classList.remove('flipped');
}

function resetInputs() {
    questionInput.value = '';
    answerInput.value = '';
    currentCardElement.classList.remove('flipped');
}

// Initialize the app
init();

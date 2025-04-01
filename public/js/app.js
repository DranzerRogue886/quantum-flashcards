import { ThemeManager } from './components/Theme.js';
import { Card, createCard } from './components/Card.js';
import { PileManager } from './components/Pile.js';
import { loadFromStorage, saveToStorage } from './utils/storage.js';

class App {
    constructor() {
        this.cards = [];
        this.currentCard = null;
        this.themeManager = new ThemeManager();
        this.init();
    }

    init() {
        this.loadCards();
        this.pileManager = new PileManager(this.cards);
        this.setupEventListeners();
    }

    loadCards() {
        const savedCards = loadFromStorage('flashcards');
        if (savedCards) {
            this.cards = savedCards;
        }
    }

    saveCards() {
        saveToStorage('flashcards', this.cards);
        this.pileManager.updatePileCounts();
    }

    setupEventListeners() {
        const flipBtn = document.getElementById('flipBtn');
        const saveBtn = document.getElementById('saveBtn');
        const pileElements = document.querySelectorAll('.pile-item');

        if (flipBtn) flipBtn.addEventListener('click', () => this.flipCard());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveCard());

        pileElements.forEach(pile => {
            pile.addEventListener('click', () => this.moveToPile(pile.dataset.pile));
        });
    }

    flipCard() {
        const card = document.getElementById('currentCard');
        if (card) card.classList.toggle('flipped');
    }

    saveCard() {
        const question = document.getElementById('questionInput')?.value.trim();
        const answer = document.getElementById('answerInput')?.value.trim();

        if (!question || !answer) return;

        const newCard = createCard(question, answer);
        this.cards.push(newCard);
        this.saveCards();
        this.resetInputs();
    }

    moveToPile(pile) {
        if (!this.currentCard) return;

        this.pileManager.moveCard(this.currentCard.id, pile);
        this.saveCards();

        // Show next card or reset
        this.currentCard = this.cards.find(card => card.pile === 'unstudied') || null;
        if (this.currentCard) {
            this.displayCard(this.currentCard);
        } else {
            this.resetInputs();
        }
    }

    displayCard(card) {
        const questionInput = document.getElementById('questionInput');
        const answerInput = document.getElementById('answerInput');
        const cardElement = document.getElementById('currentCard');

        if (questionInput) questionInput.value = card.question;
        if (answerInput) answerInput.value = card.answer;
        if (cardElement) cardElement.classList.remove('flipped');
    }

    resetInputs() {
        const questionInput = document.getElementById('questionInput');
        const answerInput = document.getElementById('answerInput');
        const cardElement = document.getElementById('currentCard');

        if (questionInput) questionInput.value = '';
        if (answerInput) answerInput.value = '';
        if (cardElement) cardElement.classList.remove('flipped');
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

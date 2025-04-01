import { ThemeManager } from './components/Theme.js';
import { Card, createCard } from './components/Card.js';
import { PileManager } from './components/Pile.js';
import { loadFromStorage, saveToStorage } from './utils/storage.js';
import { checkAnswer } from './utils/ai.js';

class App {
    constructor() {
        this.cards = [];
        this.currentCard = null;
        this.studyPile = null;
        this.studyIndex = 0;
        this.studyCards = [];
        this.themeManager = new ThemeManager();
        this.mode = 'create';
        this.init();
    }

    init() {
        this.loadCards();
        this.pileManager = new PileManager(this.cards);
        this.setupEventListeners();
        this.createQuantumParticles();
    }

    loadCards() {
        const savedCards = loadFromStorage('flashcards');
        if (savedCards) {
            // Convert saved cards back to Card instances
            this.cards = savedCards.map(cardData => {
                const card = new Card(cardData.question, cardData.answer, cardData.pile);
                card.id = cardData.id;
                card.createdAt = cardData.createdAt;
                card.lastModified = cardData.lastModified;
                card.userGuesses = cardData.userGuesses || [];
                return card;
            });
        }
    }

    saveCards() {
        saveToStorage('flashcards', this.cards);
        this.pileManager.updatePileCounts();
    }

    createQuantumParticles() {
        const bg = document.querySelector('.neural-network-bg');
        const numParticles = 150;

        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'quantum-particle';
            
            // Random initial position
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // Random animation delay
            particle.style.animationDelay = `${Math.random() * 8}s`;
            
            bg.appendChild(particle);
        }
    }

    setupEventListeners() {
        // Create mode buttons
        const flipBtn = document.getElementById('flipBtn');
        const backFlipBtn = document.getElementById('backFlipBtn');
        const saveBtn = document.getElementById('saveBtn');
        const mainCard = document.getElementById('currentCard');

        // Allow flipping the main card from both sides
        if (flipBtn) flipBtn.addEventListener('click', () => this.flipCard(mainCard));
        if (backFlipBtn) backFlipBtn.addEventListener('click', () => this.flipCard(mainCard));
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveCard());

        // Study mode buttons
        const studyButtons = document.querySelectorAll('.study-button');
        const closeStudyBtn = document.getElementById('closeStudyBtn');
        const deleteDoneBtn = document.getElementById('deleteDoneBtn');

        studyButtons.forEach(btn => {
            const pile = btn.closest('.pile-item').dataset.pile;
            btn.addEventListener('click', () => this.showStudyCards(pile));
        });

        if (closeStudyBtn) closeStudyBtn.addEventListener('click', () => this.exitStudyMode());
        
        // Delete done cards button
        if (deleteDoneBtn) {
            deleteDoneBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete all completed cards? This cannot be undone.')) {
                    this.deleteDoneCards();
                }
            });
        }
    }

    flipCard(card) {
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

    showStudyCards(pile) {
        this.studyPile = pile;
        this.studyCards = this.cards.filter(card => card.pile === pile);

        // Update popup title
        const studyTitle = document.querySelector('.study-title');
        if (studyTitle) {
            studyTitle.textContent = `Study ${pile.charAt(0).toUpperCase() + pile.slice(1)} Cards`;
        }

        // Show the study popup
        const studyPopup = document.getElementById('studyPopup');
        studyPopup.classList.add('active');

        // Clear existing cards
        const studyContainer = document.querySelector('#studyPopup .study-container');
        if (studyContainer) {
            studyContainer.innerHTML = '';

            // Create and display saved cards
            this.studyCards.forEach(cardData => {
                const cardElement = this.createStudyCardElement(cardData);
                studyContainer.appendChild(cardElement);
            });

            if (this.studyCards.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-pile-message';
                emptyMessage.textContent = 'No cards in this pile yet.';
                studyContainer.appendChild(emptyMessage);
            }
        }
    }

    createStudyCardElement(cardData) {
        const cardElement = document.createElement('div');
        cardElement.className = 'flashcard study-card';
        cardElement.dataset.cardId = cardData.id;
        
        // Ensure card has userGuesses
        if (!cardData.userGuesses) cardData.userGuesses = [];
        const latestGuess = cardData.userGuesses[cardData.userGuesses.length - 1] || '';
        
        cardElement.innerHTML = `
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <div class="card-content">${cardData.question}</div>
                    <div class="guess-input-container">
                        <textarea class="guess-input" placeholder="Enter your answer...">${latestGuess}</textarea>
                    </div>
                    <div class="card-actions">
                        <button class="action-button check-answer-btn" title="Check Answer">
                            <span class="material-icons">check_circle</span>
                            Check Answer
                        </button>
                    </div>
                </div>
                <div class="flashcard-back">
                    <div class="card-content">
                        <div class="correct-answer">
                            <span class="answer-label">Correct Answer:</span>
                            <div>${cardData.answer}</div>
                        </div>
                        <div class="user-answer">
                            <span class="answer-label">Your Answer:</span>
                            <div>${latestGuess}</div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <div class="pile-actions">
                            <button data-pile="wrong" class="action-button wrong" title="Wrong">Wrong</button>
                            <button data-pile="almost" class="action-button almost" title="Almost">Almost</button>
                            <button data-pile="right" class="action-button right" title="Right">Right</button>
                            <button data-pile="done" class="action-button done" title="Done">Done</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const checkAnswerBtn = cardElement.querySelector('.check-answer-btn');
        if (checkAnswerBtn) {
            checkAnswerBtn.addEventListener('click', () => {
                const guessInput = cardElement.querySelector('.guess-input');
                const userAnswer = guessInput.value.trim();
                
                if (!userAnswer) {
                    guessInput.classList.add('error');
                    guessInput.placeholder = 'Please enter your answer first!';
                    setTimeout(() => {
                        guessInput.classList.remove('error');
                        guessInput.placeholder = 'Enter your answer...';
                    }, 2000);
                    return;
                }

                const card = this.cards.find(c => c.id === cardData.id);
                if (card) {
                    card.userGuesses.push(userAnswer);
                    const answerDiv = cardElement.querySelector('.user-answer div:last-child');
                    if (answerDiv) answerDiv.textContent = userAnswer;
                    this.flipCard(cardElement);
                    this.saveCards();
                }
            });
        }

        const pileButtons = cardElement.querySelectorAll('.pile-actions button');
        pileButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.moveStudyCard(btn.dataset.pile, cardData.id);
                cardElement.remove();
            });
        });

        return cardElement;
    }

    displayStudyCard(card) {
        const questionEl = document.getElementById('studyQuestion');
        const answerEl = document.getElementById('correctAnswer');
        const userAnswerInput = document.getElementById('studyAnswer');
        const userAnswerDisplay = document.getElementById('userAnswer');

        if (questionEl) questionEl.textContent = card.question;
        if (answerEl) answerEl.textContent = card.answer;
        if (userAnswerInput) userAnswerInput.value = '';
        if (userAnswerDisplay) userAnswerDisplay.textContent = '';

        const studyCard = document.querySelector('.study-card');
        if (studyCard) studyCard.classList.remove('flipped');
    }

    async checkStudyAnswer() {
        const userAnswer = document.getElementById('studyAnswer').value;
        const currentCard = this.studyCards[this.studyIndex];
        
        document.getElementById('userAnswer').textContent = userAnswer;
        
        // Use AI to check the answer
        const result = await checkAnswer(currentCard.answer, userAnswer);
        
        // Show the comparison and feedback
        const studyCard = document.querySelector('.study-card');
        const feedbackEl = document.createElement('div');
        feedbackEl.className = 'answer-feedback';
        feedbackEl.innerHTML = `
            <div class="feedback-text">${result.feedback}</div>
            <div class="feedback-score">Score: ${Math.round(result.score * 100)}%</div>
            <div class="feedback-suggestion">${result.suggestion}</div>
        `;
        
        // Replace any existing feedback
        const existingFeedback = document.querySelector('.answer-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        // Add new feedback
        const answerComparison = document.querySelector('.answer-comparison');
        if (answerComparison) {
            answerComparison.appendChild(feedbackEl);
        }
        
        if (studyCard) studyCard.classList.add('flipped');
    }

    moveStudyCard(pile, cardId) {
        const card = this.cards.find(c => c.id === cardId);
        if (card) {
            card.pile = pile;
            card.lastModified = new Date().toISOString();
            this.pileManager.updatePileCounts();
            this.saveCards();
            
            // Remove the card element with animation
            const cardElement = document.querySelector(`.study-card[data-card-id="${cardId}"]`);
            if (cardElement) {
                cardElement.classList.add('moving-to-pile');
                setTimeout(() => cardElement.remove(), 500);
            }
        }
    }

    nextStudyCard() {
        this.studyIndex++;
        if (this.studyIndex >= this.studyCards.length) {
            // End of pile
            this.exitStudyMode();
            return;
        }
        this.displayStudyCard(this.studyCards[this.studyIndex]);
    }

    exitStudyMode() {
        document.getElementById('studyPopup').classList.remove('active');
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

    deleteDoneCards() {
        const doneCards = this.cards.filter(card => card.pile === 'done').length;
        if (doneCards === 0) return; // Don't animate if no cards to delete

        // Remove all cards from the 'done' pile
        this.cards = this.cards.filter(card => card.pile !== 'done');
        this.saveCards();

        // Reset the done pile count immediately
        const donePileCount = document.querySelector('[data-pile="done"] .pile-count');
        if (donePileCount) {
            donePileCount.textContent = '0';
        }

        // Add delete animation to done pile
        const donePile = document.querySelector('[data-pile="done"]');
        if (donePile) {
            donePile.classList.add('shake');
            setTimeout(() => donePile.classList.remove('shake'), 500);
        }

        // Force pile manager to update all counts
        if (this.pileManager) {
            this.pileManager.cards = this.cards;
            this.pileManager.updatePileCounts();
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

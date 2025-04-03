class FlashCard {
    constructor(question, answer) {
        this.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.question = question;
        this.answer = answer;
        this.pile = 'unstudied';
        this.createdAt = new Date();
        this.lastStudied = null;
    }
}

class QuantumFlashCards {
    constructor() {
        this.cards = this.loadCards();
        this.currentStudyCard = null;
        this.currentStudyPile = null;
        this.maxCardsPerPile = 100; // Limit cards per pile for memory management
        this.initializeElements();
        this.initializeEventListeners();
        this.createNeuralNetwork();
        this.updatePileCounts();
        this.cleanupOldCards();
    }

    initializeElements() {
        // Main card elements
        this.mainCard = document.getElementById('mainCard');
        this.questionInput = document.getElementById('questionInput');
        this.answerInput = document.getElementById('answerInput');
        this.flipBtn = document.getElementById('flipBtn');
        this.saveBtn = document.getElementById('saveBtn');

        // Study mode elements
        this.studyMode = document.getElementById('studyMode');
        this.studyCard = document.getElementById('studyCard');
        this.studyAnswer = document.getElementById('studyAnswer');
        this.checkAnswerBtn = document.getElementById('checkAnswerBtn');
        this.exitStudyBtn = document.querySelector('.exit-study-btn');
        this.userAnswerBox = document.getElementById('userAnswerBox');

        // Control buttons
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.supportBtn = document.getElementById('supportBtn');
        this.supportMeBtn = document.getElementById('supportMeBtn');

        // Category buttons
        this.categoryBtns = document.querySelectorAll('.category-btn');
        
        // Delete pile buttons
        this.deletePileBtns = document.querySelectorAll('.delete-pile-btn');

        // Initialize elements with default states
        if (this.studyMode) this.studyMode.classList.add('hidden');
        if (this.checkAnswerBtn) this.checkAnswerBtn.disabled = true;
        if (this.categoryBtns) {
            this.categoryBtns.forEach(btn => {
                btn.style.display = 'none';
                btn.disabled = true;
            });
        }
    }

    initializeEventListeners() {
        // Study buttons
        document.querySelectorAll('.study-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pileDiv = e.target.closest('.pile');
                if (pileDiv && pileDiv.id) {
                    const pileName = pileDiv.id.replace('Pile', '').toLowerCase();
                    this.startStudyMode(pileName);
                }
            });
        });

        // Exit study button and escape key
        if (this.exitStudyBtn) {
            this.exitStudyBtn.addEventListener('click', () => this.exitStudyMode());
        }
        
        // Add escape key listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.studyMode && !this.studyMode.classList.contains('hidden')) {
                this.exitStudyMode();
            }
        });

        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.currentStudyCard) return;
                
                const category = btn.classList.contains('wrong') ? 'wrong' :
                                btn.classList.contains('close') ? 'close' :
                                btn.classList.contains('right') ? 'right' :
                                btn.classList.contains('delete') ? 'delete' : null;
                
                if (category) {
                    this.categorizeCard(category);
                    this.showNextCard();
                }
            });
        });

        // Study answer input validation
        if (this.studyAnswer) {
            // Initially disable check answer button
            if (this.checkAnswerBtn) {
                this.checkAnswerBtn.disabled = true;
                this.checkAnswerBtn.classList.add('disabled');
            }

            // Enable/disable check answer button based on input
            this.studyAnswer.addEventListener('input', () => {
                if (this.checkAnswerBtn) {
                    const hasAnswer = this.studyAnswer.value.trim().length > 0;
                    this.checkAnswerBtn.disabled = !hasAnswer;
                    if (hasAnswer) {
                        this.checkAnswerBtn.classList.remove('disabled');
                    } else {
                        this.checkAnswerBtn.classList.add('disabled');
                    }
                }
            });

            // Handle Enter key
            this.studyAnswer.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!this.checkAnswerBtn.disabled) {
                        this.checkAnswer();
                    }
                }
            });
        }

        if (this.checkAnswerBtn) {
            this.checkAnswerBtn.addEventListener('click', () => {
                if (!this.checkAnswerBtn.disabled) {
                    this.checkAnswer();
                }
            });
        }

        // Main card listeners
        this.flipBtn.addEventListener('click', () => this.mainCard.classList.toggle('flipped'));
        this.saveBtn.addEventListener('click', () => this.saveCard());

        // Control buttons
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        if (this.supportBtn) {
            this.supportBtn.addEventListener('click', () => this.showSupport());
        }

        if (this.supportMeBtn) {
            this.supportMeBtn.addEventListener('click', () => this.showSupportMe());
        }

        // Study mode listeners
        if (this.exitStudyBtn) {
            this.exitStudyBtn.addEventListener('click', () => this.exitStudyMode());
        }
        
        // Pile study buttons
        document.querySelectorAll('.study-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pileDiv = e.target.closest('.pile');
                if (pileDiv && pileDiv.id) {
                    const pile = pileDiv.id.replace('Pile', '');
                    this.startStudyMode(pile);
                }
            });
        });

        // Category buttons
        if (this.categoryBtns) {
            this.categoryBtns.forEach(btn => {
                // Initially disable category buttons
                btn.disabled = true;
                btn.classList.add('disabled');

                btn.addEventListener('click', (e) => {
                    const category = e.target.classList[1];
                    if (category) {
                        // Disable all category buttons after selection
                        this.categoryBtns.forEach(btn => {
                            btn.disabled = true;
                            btn.classList.add('disabled');
                        });
                        this.categorizeCard(category);
                    }
                });
            });
        }

        // Delete all completed cards
        const deleteAllBtn = document.querySelector('.delete-all-btn');
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete all completed cards?')) {
                    this.deleteCompletedCards();
                }
            });
        }
    }

    cleanupOldCards() {
        // Keep only the most recent cards if we exceed the limit
        const piles = ['unstudied', 'wrong', 'close', 'right', 'deletion'];
        piles.forEach(pile => {
            const pileCards = this.cards.filter(card => card.pile === pile);
            if (pileCards.length > this.maxCardsPerPile) {
                // Sort by last modified/studied date and keep only the most recent
                const sortedCards = pileCards.sort((a, b) => {
                    const dateA = a.lastStudied || a.createdAt;
                    const dateB = b.lastStudied || b.createdAt;
                    return new Date(dateB) - new Date(dateA);
                });
                // Remove excess cards
                const cardsToRemove = sortedCards.slice(this.maxCardsPerPile);
                this.cards = this.cards.filter(card => !cardsToRemove.includes(card));
            }
        });
        this.saveCards();
    }

    saveCard() {
        const question = this.questionInput.value.trim();
        const answer = this.answerInput.value.trim();

        if (!question || !answer) {
            alert('Please enter both question and answer');
            return;
        }

        const card = new FlashCard(question, answer);
        this.cards.push(card);
        this.saveCards();
        this.updatePileCounts();

        // Reset inputs
        this.questionInput.value = '';
        this.answerInput.value = '';
        this.mainCard.classList.remove('flipped');

        // Show success message
        this.showNotification('Card saved successfully!');
    }

    startStudyMode(pile) {
        const pileCards = this.cards.filter(card => card.pile === pile);
        if (pileCards.length === 0) {
            alert('No cards in this pile to study!');
            return;
        }

        this.currentStudyPile = pile;
        this.studyPileCards = pileCards;
        this.currentCardIndex = 0;
        this.currentStudyCard = pileCards[0];
        this.studyMode.classList.remove('hidden');
        
        // Hide category buttons initially
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.style.display = 'none';
            btn.disabled = true;
        });
        
        this.showStudyCard();
    }

    showNextCard() {
        if (!this.studyPileCards || !this.currentStudyPile) return;

        this.currentCardIndex++;
        if (this.currentCardIndex >= this.studyPileCards.length) {
            this.exitStudyMode();
            return;
        }

        this.currentStudyCard = this.studyPileCards[this.currentCardIndex];
        this.showStudyCard();
    }

    showStudyCard() {
        if (!this.studyCard || !this.currentStudyCard) return;

        const questionText = this.studyCard.querySelector('.question-text');
        if (questionText) {
            questionText.textContent = this.currentStudyCard.question;
        }

        this.studyCard.classList.remove('flipped');
        
        if (this.studyAnswer) {
            this.studyAnswer.value = '';
            this.studyAnswer.disabled = false;
            this.studyAnswer.classList.remove('disabled');
        }
        
        // Initially disable check answer button (no input yet)
        if (this.checkAnswerBtn) {
            this.checkAnswerBtn.disabled = true;
            this.checkAnswerBtn.classList.add('disabled');
        }
        
        // Hide and disable category buttons until answer is checked
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.style.display = 'none';
            btn.disabled = true;
        });
        
        // Clear previous answer boxes
        const correctAnswerText = document.querySelector('.correct-answer-text');
        const userAnswerText = this.userAnswerBox.querySelector('.user-answer-text');

        if (correctAnswerText) correctAnswerText.textContent = '';
        if (userAnswerText) userAnswerText.textContent = '';
        if (userAnswerBox) userAnswerBox.className = 'answer-box';

        // Show/hide delete button based on pile
        if (this.deleteCardBtn) {
            this.deleteCardBtn.style.display = this.currentStudyCard.pile === 'completed' ? 'block' : 'none';
        }
    }

    async categorizeCard(category) {
        if (!this.currentStudyCard || !category) return;

        // Update card based on category
        this.currentStudyCard.pile = category;
        this.currentStudyCard.lastStudied = new Date();
        
        // Save changes
        this.saveCards();
        this.updatePileCounts();

        // Hide category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.style.display = 'none';
            btn.disabled = true;
        });

        // Show next card or exit study mode
        if (this.studyPileCards && this.currentCardIndex < this.studyPileCards.length - 1) {
            this.showNextCard();
        } else {
            this.exitStudyMode();
        }
    }

    async validateAnswer(userAnswer, correctAnswer) {
        // AI-powered answer validation using advanced similarity metrics
        const userTokens = this.tokenize(userAnswer.toLowerCase());
        const correctTokens = this.tokenize(correctAnswer.toLowerCase());

        // Calculate multiple similarity metrics
        const levenshteinSim = this.calculateSimilarity(userAnswer.toLowerCase(), correctAnswer.toLowerCase());
        const tokenSim = this.calculateTokenSimilarity(userTokens, correctTokens);
        const semanticSim = this.calculateSemanticSimilarity(userTokens, correctTokens);

        // Weight the different metrics
        const similarity = (
            levenshteinSim * 0.4 +
            tokenSim * 0.3 +
            semanticSim * 0.3
        );

        return similarity;
    }

    tokenize(text) {
        // Basic tokenization and cleaning
        return text
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .split(/\s+/)
            .filter(token => token.length > 0);
    }

    calculateTokenSimilarity(tokens1, tokens2) {
        // Jaccard similarity for token overlap
        const set1 = new Set(tokens1);
        const set2 = new Set(tokens2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }

    calculateSemanticSimilarity(tokens1, tokens2) {
        // Semantic similarity using word position and common phrases
        const commonPhrases = this.findCommonPhrases(tokens1, tokens2);
        const positionScore = this.calculatePositionScore(tokens1, tokens2);
        return (commonPhrases + positionScore) / 2;
    }

    findCommonPhrases(tokens1, tokens2) {
        // Find common consecutive words
        let maxPhrase = 0;
        for (let i = 0; i < tokens1.length; i++) {
            for (let j = 0; j < tokens2.length; j++) {
                let k = 0;
                while (i + k < tokens1.length && 
                       j + k < tokens2.length && 
                       tokens1[i + k] === tokens2[j + k]) {
                    k++;
                }
                maxPhrase = Math.max(maxPhrase, k);
            }
        }
        return maxPhrase / Math.max(tokens1.length, tokens2.length);
    }

    calculatePositionScore(tokens1, tokens2) {
        // Compare word positions
        let score = 0;
        const len = Math.max(tokens1.length, tokens2.length);
        
        for (let i = 0; i < len; i++) {
            if (tokens1[i] === tokens2[i]) {
                score += 1;
            } else if (tokens1[i] && tokens2.includes(tokens1[i])) {
                score += 0.5;
            }
        }
        
        return score / len;
    }

    calculateSimilarity(str1, str2) {
        // Levenshtein distance calculation
        const matrix = Array(str2.length + 1).fill(null)
            .map(() => Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + indicator
                );
            }
        }

        const maxLength = Math.max(str1.length, str2.length);
        const similarity = 1 - (matrix[str2.length][str1.length] / maxLength);
        return similarity;
    }

    async checkAnswer() {
        if (!this.currentStudyCard || !this.studyAnswer || !this.checkAnswerBtn) {
            this.showNotification('No card to check', 'wrong');
            return;
        }

        // Prevent multiple checks
        if (this.studyAnswer.disabled) {
            return;
        }

        const userAnswer = this.studyAnswer.value.trim();
        if (!userAnswer) {
            this.showNotification('Please enter an answer first', 'wrong');
            return;
        }

        try {
            // Lock input and button during check
            this.studyAnswer.disabled = true;
            this.studyAnswer.classList.add('disabled');
            this.checkAnswerBtn.disabled = true;
            this.checkAnswerBtn.classList.add('disabled');

            // First flip the card to show loading state
            if (this.studyCard) {
                this.studyCard.classList.add('flipped');
                // Clear previous answers
                const correctAnswerText = document.querySelector('.correct-answer-text');
                const userAnswerText = document.querySelector('.user-answer-text');
                const userAnswerBox = document.getElementById('userAnswerBox');
                
                if (correctAnswerText) correctAnswerText.textContent = 'Checking answer...';
                if (userAnswerText) userAnswerText.textContent = userAnswer;
                if (userAnswerBox) userAnswerBox.className = 'answer-box';
            }

            // Validate answer with AI
            const similarity = await this.validateAnswer(userAnswer, this.currentStudyCard.answer);
            let suggestedCategory;

            if (similarity >= 0.9) suggestedCategory = 'right';
            else if (similarity >= 0.7) suggestedCategory = 'close';
            else suggestedCategory = 'wrong';

            // Update answer boxes with results
            const correctAnswerText = document.querySelector('.correct-answer-text');
            const userAnswerText = this.userAnswerBox.querySelector('.user-answer-text');

            if (correctAnswerText) {
                correctAnswerText.textContent = this.currentStudyCard.answer;
                // Add explanation if answer is not perfect
                if (similarity < 1.0) {
                    correctAnswerText.textContent += '\n\nDifferences explained:\n';
                    correctAnswerText.textContent += this.explainDifferences(userAnswer, this.currentStudyCard.answer);
                }
            }
            if (userAnswerText) userAnswerText.textContent = userAnswer;
            if (this.userAnswerBox) this.userAnswerBox.className = 'answer-box ' + suggestedCategory;

            // Show feedback without moving the card
            this.showAnswerFeedback(suggestedCategory, similarity);

            // Show and enable category buttons
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.style.display = 'block';
                btn.disabled = false;
            });
            this.showNotification('Choose a pile for this card', 'info');

        } catch (error) {
            console.error('Error checking answer:', error);
            this.showNotification('Error checking answer', 'wrong');
            
            // Re-enable input and button
            if (this.studyAnswer) {
                this.studyAnswer.disabled = false;
                this.studyAnswer.classList.remove('disabled');
            }
            if (this.checkAnswerBtn) {
                this.checkAnswerBtn.disabled = false;
                this.checkAnswerBtn.classList.remove('disabled');
            }
        }
    }

    explainDifferences(userAnswer, correctAnswer) {
        const userWords = userAnswer.toLowerCase().split(/\s+/);
        const correctWords = correctAnswer.toLowerCase().split(/\s+/);
        
        // Find missing and extra words
        const missing = correctWords.filter(word => !userWords.includes(word));
        const extra = userWords.filter(word => !correctWords.includes(word));
        
        let explanation = '';
        
        if (missing.length > 0) {
            explanation += '\nMissing words: ' + missing.join(', ');
        }
        
        if (extra.length > 0) {
            explanation += '\nExtra words: ' + extra.join(', ');
        }
        
        // Check word order
        const commonWords = userWords.filter(word => correctWords.includes(word));
        if (commonWords.length > 0 && commonWords.join(' ') !== correctWords.filter(word => userWords.includes(word)).join(' ')) {
            explanation += '\nWord order is different from the correct answer.';
        }
        
        return explanation || '\nThe answers are completely different.';
    }

    showAnswerFeedback(category, similarity) {
        const percentage = Math.round(similarity * 100);
        const message = `${percentage}% match - ${category.toUpperCase()}`;
        this.showNotification(message, category);
    }

    enableCategoryButtons() {
        // Enable all category buttons
        if (this.categoryBtns) {
            this.categoryBtns.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('disabled');
            });
        }
    }

    exitStudyMode() {
        this.studyMode.classList.add('hidden');
        this.currentStudyCard = null;
        this.currentStudyPile = null;
    }

    deleteCompletedCards() {
        this.cards = this.cards.filter(card => card.pile !== 'completed');
        this.saveCards();
        this.updatePileCounts();
    }

    updatePileCounts() {
        const piles = ['unstudied', 'wrong', 'close', 'right', 'deletion'];
        piles.forEach(pile => {
            const count = this.cards.filter(card => card.pile === pile).length;
            const pileElement = document.getElementById(`${pile}Pile`);
            if (pileElement) {
                const countElement = pileElement.querySelector('.card-count');
                if (countElement) {
                    countElement.textContent = count;
                }
            }
        });
    }

    createNeuralNetwork() {
        // Neural network animation is now handled by particle-animation.js
    }

    loadCards() {
        const saved = localStorage.getItem('quantumFlashCards');
        return saved ? JSON.parse(saved) : [];
    }

    saveCards() {
        localStorage.setItem('quantumFlashCards', JSON.stringify(this.cards));
    }

    showNotification(message, category = '') {
        const notification = document.createElement('div');
        notification.className = `notification ${category}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    deleteCompletedCards() {
        this.cards = this.cards.filter(card => card.pile !== 'completed');
        this.saveCards();
        this.updatePileCounts();
        this.showNotification('All completed cards deleted!');
    }

    deleteCurrentCard() {
        if (!this.currentStudyCard) {
            this.showNotification('No card to delete', 'wrong');
            return;
        }

        if (this.currentStudyCard.pile !== 'completed') {
            this.showNotification('Only completed cards can be deleted', 'wrong');
            return;
        }

        if (confirm('Are you sure you want to delete this card?')) {
            try {
                // Remove card from array
                this.cards = this.cards.filter(card => card.id !== this.currentStudyCard.id);
                this.saveCards();
                this.updatePileCounts();
                
                // Show next card or exit study mode
                const pileCards = this.cards.filter(card => card.pile === this.currentStudyPile);
                if (pileCards.length > 0) {
                    const currentIndex = pileCards.findIndex(card => card.id === this.currentStudyCard.id);
                    this.currentStudyCard = pileCards[currentIndex + 1] || pileCards[0];
                    this.showStudyCard();
                    this.showNotification('Card deleted successfully', 'right');
                } else {
                    this.exitStudyMode();
                    this.showNotification('Last card deleted, exiting study mode', 'right');
                }
            } catch (error) {
                console.error('Error deleting card:', error);
                this.showNotification('Error deleting card', 'wrong');
            }
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Exit Fullscreen';
        } else {
            document.exitFullscreen();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> Fullscreen';
        }
    }

    showSupport() {
        const supportContent = `
            <div class='tutorial-content'>
                <h2>🎓 Welcome to Quantum FlashCards!</h2>
                
                <h3>📝 Creating Cards</h3>
                <ul>
                    <li>Enter your question in the top field</li>
                    <li>Enter the answer in the bottom field</li>
                    <li>Click 'Save' to add the card to your collection</li>
                    <li>Cards start in the 'Unstudied' pile</li>
                </ul>

                <h3>📚 Studying Cards</h3>
                <ul>
                    <li>Click 'Study' on any pile to begin</li>
                    <li>Type your answer and click 'Check'</li>
                    <li>Use the category buttons to rate your answer:</li>
                    <ul>
                        <li>❌ Wrong - Need more practice</li>
                        <li>↗️ Close - Almost there</li>
                        <li>✅ Right - Got it perfect</li>
                    </ul>
                    <li>Press ESC or click 'Exit' to stop studying</li>
                </ul>

                <h3>📊 Understanding Piles</h3>
                <ul>
                    <li><strong>Unstudied:</strong> New cards you haven't practiced yet</li>
                    <li><strong>Wrong:</strong> Cards you need to review more</li>
                    <li><strong>Close:</strong> Cards you almost know</li>
                    <li><strong>Right:</strong> Cards you've mastered</li>
                    <li><strong>Deletion:</strong> Cards you want to remove</li>
                </ul>

                <h3>⌨️ Keyboard Shortcuts</h3>
                <ul>
                    <li>ESC - Exit study mode</li>
                    <li>Enter - Check answer (when typing)</li>
                </ul>

                <h3>💡 Tips</h3>
                <ul>
                    <li>Study regularly from the 'Wrong' and 'Close' piles</li>
                    <li>Move cards between piles based on your confidence</li>
                    <li>Use the deletion pile for cards you no longer need</li>
                    <li>Our AI helps compare your answers for accuracy</li>
                    <li>Take breaks between study sessions</li>
                </ul>
            </div>
        `;

        // Create and style the modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class='modal-content'>
                ${supportContent}
                <button class='close-modal'>Got it!</button>
            </div>
        `;

        // Add styles if not already present
        if (!document.querySelector('#tutorial-styles')) {
            const style = document.createElement('style');
            style.id = 'tutorial-styles';
            style.textContent = `
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 10px;
                    max-width: 80%;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .tutorial-content {
                    color: #333;
                    line-height: 1.6;
                }
                .tutorial-content h2 {
                    color: #2196F3;
                    margin-bottom: 1.5rem;
                    text-align: center;
                }
                .tutorial-content h3 {
                    color: #1976D2;
                    margin: 1.5rem 0 1rem;
                    border-bottom: 2px solid #e0e0e0;
                    padding-bottom: 0.5rem;
                }
                .tutorial-content ul {
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .tutorial-content li {
                    margin: 0.5rem 0;
                }
                .close-modal {
                    display: block;
                    margin: 2rem auto 0;
                    padding: 0.75rem 2rem;
                    background: #2196F3;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background 0.3s ease;
                }
                .close-modal:hover {
                    background: #1976D2;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        // Close modal on button click or clicking outside
        const closeModal = () => modal.remove();
        modal.querySelector('.close-modal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    showSupportMe() {
        const supportMeContent = `
            <div class="support-modal support-me-modal">
                <h2>Support This Project</h2>
                <p>Thank you for using Quantum FlashCards! If you're enjoying this app and would like to see more features or similar applications, consider supporting the project.</p>
                <div class="support-options">
                    <p>You can:</p>
                    <ul>
                        <li>Make a donation via <a href="https://account.venmo.com/u/Benjamin-Wrenn" target="_blank">Venmo</a></li>
                        <li>Suggest new features or improvements</li>
                        <li>Share the app with others who might find it useful</li>
                    </ul>
                </div>
                <p class="thank-you">Your support helps keep this project growing!</p>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = supportMeContent;
        document.body.appendChild(modal);

        modal.addEventListener('click', () => {
            modal.remove();
        });
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuantumFlashCards();
});

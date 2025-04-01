// Pile configurations and management
export const PILE_CONFIGS = {
    unstudied: { name: 'unstudied', color: '#9c27b0' },
    wrong: { name: 'wrong', color: '#f44336' },
    almost: { name: 'almost', color: '#ffd700' },
    right: { name: 'right', color: '#4caf50' },
    done: { name: 'done', color: '#9c27b0' }
};

export class PileManager {
    constructor(cards = []) {
        this.cards = cards;
        this.init();
    }

    init() {
        this.setupPileStyles();
        this.updatePileCounts();
    }

    setupPileStyles() {
        const piles = document.querySelectorAll('.pile-item');
        piles.forEach(pile => {
            const card = pile.querySelector('.pile-card');
            if (card && pile.dataset.pile) {
                card.style.borderLeft = `4px solid ${PILE_CONFIGS[pile.dataset.pile].color}`;
            }
        });
    }

    updatePileCounts() {
        Object.keys(PILE_CONFIGS).forEach(pile => {
            const count = this.cards.filter(card => card.pile === pile).length;
            const pileElement = document.querySelector(`[data-pile="${pile}"] .pile-count`);
            if (pileElement) {
                pileElement.textContent = count;
            }
        });
    }

    moveCard(cardId, targetPile) {
        const card = this.cards.find(c => c.id === cardId);
        if (card) {
            card.pile = targetPile;
            this.updatePileCounts();
        }
    }
}

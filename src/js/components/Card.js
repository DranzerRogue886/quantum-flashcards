// Card component functionality
export class Card {
    constructor(question = '', answer = '', pile = 'unstudied') {
        this.id = Date.now().toString();
        this.question = question;
        this.answer = answer;
        this.pile = pile;
        this.createdAt = new Date().toISOString();
        this.lastModified = new Date().toISOString();
        this.userGuesses = [];
    }

    update(pile) {
        this.pile = pile;
        this.lastModified = new Date().toISOString();
    }
}

export const createCard = (question, answer) => {
    return new Card(question, answer);
};

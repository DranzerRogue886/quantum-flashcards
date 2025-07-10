import { useState } from 'react';
import './Flashcard.css';

const Flashcard = ({ question, answer, onNext, onPrevious, isFirst, isLast }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    onNext();
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    onPrevious();
  };

  return (
    <div className="flashcard-container">
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <h3>Question</h3>
            <p>{question}</p>
            <div className="flashcard-hint">Click to reveal answer</div>
          </div>
          <div className="flashcard-back">
            <h3>Answer</h3>
            <p>{answer}</p>
            <div className="flashcard-hint">Click to see question</div>
          </div>
        </div>
      </div>
      
      <div className="flashcard-controls">
        <button 
          onClick={handlePrevious} 
          disabled={isFirst}
          className="nav-button"
        >
          ← Previous
        </button>
        <button 
          onClick={handleNext} 
          disabled={isLast}
          className="nav-button"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Flashcard; 
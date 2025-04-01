// AI utility functions for checking answers

/**
 * Compare the user's answer with the correct answer using basic text similarity
 * This is a simple implementation - in a real app, you'd want to use a more sophisticated
 * NLP approach or an actual AI service
 */
export async function checkAnswer(correctAnswer, userAnswer) {
    // Convert both answers to lowercase and remove extra whitespace
    const correct = correctAnswer.toLowerCase().trim();
    const user = userAnswer.toLowerCase().trim();

    // Calculate similarity score
    let score = 0;
    
    // Exact match
    if (correct === user) {
        score = 1;
    } else {
        // Check for word overlap
        const correctWords = new Set(correct.split(/\s+/));
        const userWords = new Set(user.split(/\s+/));
        
        // Calculate Jaccard similarity
        const intersection = new Set([...correctWords].filter(x => userWords.has(x)));
        const union = new Set([...correctWords, ...userWords]);
        
        score = intersection.size / union.size;
    }

    // Return result with feedback
    return {
        score: score,
        feedback: getFeedback(score),
        suggestion: score < 0.8 ? 'Consider moving to Wrong or Almost pile' : 'Great! Move to Right or Done pile'
    };
}

/**
 * Get appropriate feedback based on the similarity score
 */
function getFeedback(score) {
    if (score === 1) {
        return 'Perfect match! Your answer is exactly correct.';
    } else if (score >= 0.8) {
        return 'Very close! Your answer captures the main points.';
    } else if (score >= 0.5) {
        return 'Getting there! Your answer has some correct elements but needs improvement.';
    } else if (score >= 0.3) {
        return 'Keep trying! Your answer shows some understanding but needs significant work.';
    } else {
        return 'Your answer is quite different from the expected one. Review the material and try again.';
    }
}

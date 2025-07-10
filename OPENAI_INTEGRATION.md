# OpenAI Integration Features

## 🤖 Quantum Flashcards with AI

Your Quantum Flashcards app now includes OpenAI integration for generating dynamic, educational content!

## ✨ Features Added:

### 1. **AI-Powered Flashcard Generation**
- Generate flashcards on any quantum computing topic
- Uses GPT-3.5-turbo for intelligent content creation
- Creates both questions and answers automatically

### 2. **Interactive Flashcard Interface**
- Click to flip cards (question ↔ answer)
- Navigate between cards with Previous/Next buttons
- Beautiful quantum-themed animations
- Responsive design for mobile and desktop

### 3. **Secure API Key Management**
- API key stored in `.env` file (not committed to git)
- Environment variable: `VITE_OPENAI_API_KEY`
- Automatic error handling and user feedback

### 4. **User-Friendly Interface**
- Topic input field for custom flashcard generation
- Loading states and error messages
- Example topics provided
- Card counter showing progress

## 🔧 How to Use:

1. **Enter a Topic**: Type any quantum computing topic (e.g., "quantum superposition")
2. **Generate Flashcards**: Click "Generate Flashcards" button
3. **Study**: Click cards to flip between question and answer
4. **Navigate**: Use Previous/Next buttons to move through cards

## 📚 Example Topics:
- Quantum superposition
- Quantum entanglement
- Quantum gates
- Quantum algorithms
- Quantum error correction
- Quantum teleportation
- Quantum cryptography
- Quantum annealing

## 🔒 Security Features:
- API key stored securely in environment variables
- `.env` file excluded from version control
- Error handling prevents API key exposure
- Rate limiting and error recovery

## 🎨 UI Features:
- Quantum-themed gradient backgrounds
- Smooth flip animations
- Responsive design
- Loading states
- Error message styling
- Mobile-friendly interface

## 🚀 Deployment Ready:
- All features work in production build
- Environment variables configured for deployment
- No sensitive data in build output
- Ready for Firebase Hosting deployment

## 📝 API Usage:
The app uses OpenAI's GPT-3.5-turbo model for:
- Generating educational flashcards
- Creating questions and answers
- Explaining quantum concepts
- Providing beginner-friendly explanations

## 💡 Future Enhancements:
- Save favorite flashcards
- Share flashcards with others
- Multiple difficulty levels
- Progress tracking
- Custom flashcard creation
- Voice explanations 
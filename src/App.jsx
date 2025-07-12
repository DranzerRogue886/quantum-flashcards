import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import Flashcard from "./components/Flashcard";
import FileUpload from "./components/FileUpload";
import FileAnalysis from "./components/FileAnalysis";
import openaiService from "./services/openai";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState("quantum computing");
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(true);

  async function greet() {
    setGreetMsg(`Hello, ${name}! Welcome to Quantum Flashcards!`);
  }

  const generateFlashcards = async () => {
    setLoading(true);
    setError("");
    try {
      const newFlashcards = await openaiService.generateMultipleFlashcards(topic, 5);
      setFlashcards(Array.isArray(newFlashcards) ? newFlashcards : [newFlashcards]);
      setCurrentCardIndex(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleFileProcessed = (fileData) => {
    setUploadedFile(fileData);
    setShowFileUpload(false);
    setError("");
  };

  const handleFileError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleGenerateFlashcardsFromFile = async (fileData) => {
    setLoading(true);
    setError("");
    try {
      const newFlashcards = await openaiService.generateFlashcardsFromFile(
        fileData.originalContent,
        fileData.fileName,
        fileData.topics,
        fileData.fileCategory
      );
      setFlashcards(Array.isArray(newFlashcards) ? newFlashcards : [newFlashcards]);
      setCurrentCardIndex(0);
      setShowFileUpload(true);
      setUploadedFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToUpload = () => {
    setShowFileUpload(true);
    setUploadedFile(null);
    setError("");
  };

  return (
    <main className="container">
      <h1>Quantum Flashcards</h1>
      <p>Master quantum computing concepts with interactive flashcards</p>

      {/* File Upload Section */}
      {showFileUpload && (
        <div className="file-upload-section">
          <h2>📁 Upload Files to Generate Flashcards</h2>
          <p>Drag and drop files to convert them into AI-generated flashcards</p>
          <FileUpload 
            onFileProcessed={handleFileProcessed}
            onError={handleFileError}
          />
        </div>
      )}

      {/* File Analysis Section */}
      {uploadedFile && !showFileUpload && (
        <FileAnalysis
          fileData={uploadedFile}
          onGenerateFlashcards={handleGenerateFlashcardsFromFile}
          onBack={handleBackToUpload}
        />
      )}

      {/* Manual Topic Input Section */}
      <div className="manual-input-section">
        <h2>🎯 Or Generate Flashcards Manually</h2>
        <div className="controls-section">
          <div className="topic-input">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a quantum computing topic..."
              className="topic-field"
            />
            <button 
              onClick={generateFlashcards} 
              disabled={loading}
              className="generate-button"
            >
              {loading ? "Generating..." : "Generate Flashcards"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {flashcards.length > 0 && (
        <div className="flashcard-section">
          <div className="card-counter">
            Card {currentCardIndex + 1} of {flashcards.length}
          </div>
          <Flashcard
            question={flashcards[currentCardIndex].question}
            answer={flashcards[currentCardIndex].answer}
            onNext={nextCard}
            onPrevious={previousCard}
            isFirst={currentCardIndex === 0}
            isLast={currentCardIndex === flashcards.length - 1}
          />
        </div>
      )}

      {flashcards.length === 0 && !loading && !uploadedFile && (
        <div className="welcome-section">
          <h2>Welcome to Quantum Flashcards!</h2>
          <p>Upload a file or enter a topic to generate AI-powered flashcards.</p>
          <div className="example-topics">
            <h3>Example topics:</h3>
            <ul>
              <li>Quantum superposition</li>
              <li>Quantum entanglement</li>
              <li>Quantum gates</li>
              <li>Quantum algorithms</li>
              <li>Quantum error correction</li>
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;

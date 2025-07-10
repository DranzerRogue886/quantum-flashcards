import { useState } from 'react';
import './FileAnalysis.css';

const FileAnalysis = ({ fileData, onGenerateFlashcards, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleGenerateFlashcards = async () => {
    setIsGenerating(true);
    try {
      await onGenerateFlashcards(fileData);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="file-analysis-container">
      <div className="file-header">
        <h2>📄 {fileData.fileName}</h2>
        <button onClick={onBack} className="back-button">
          ← Back to Upload
        </button>
      </div>

      <div className="file-stats">
        <div className="stat-item">
          <span className="stat-label">Words:</span>
          <span className="stat-value">{fileData.wordCount.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Lines:</span>
          <span className="stat-value">{fileData.lineCount.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Topics Found:</span>
          <span className="stat-value">{fileData.topics.length}</span>
        </div>
      </div>

      <div className="content-sections">
        <div className="section">
          <h3>🔍 Key Topics Identified</h3>
          <div className="topics-grid">
            {fileData.topics.map((topic, index) => (
              <span key={index} className="topic-tag">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="section">
          <h3>📝 Content Preview</h3>
          <div className="content-preview">
            {fileData.paragraphs.slice(0, 3).map((paragraph, index) => (
              <div key={index} className="paragraph">
                <p>{paragraph.length > 200 ? paragraph.substring(0, 200) + '...' : paragraph}</p>
              </div>
            ))}
            {fileData.paragraphs.length > 3 && (
              <p className="more-content">... and {fileData.paragraphs.length - 3} more paragraphs</p>
            )}
          </div>
        </div>
      </div>

      <div className="action-section">
        <button 
          onClick={handleGenerateFlashcards}
          disabled={isGenerating}
          className="generate-flashcards-btn"
        >
          {isGenerating ? 'Generating Flashcards...' : '🎯 Generate Flashcards'}
        </button>
        <p className="action-hint">
          AI will create 5 educational flashcards based on your file content
        </p>
      </div>
    </div>
  );
};

export default FileAnalysis; 
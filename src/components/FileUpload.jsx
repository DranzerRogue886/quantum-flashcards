import { useState, useRef } from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileProcessed, onError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const content = await readFileContent(file);
      const parsedContent = parseFileContent(content, file.name);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        onFileProcessed(parsedContent, file.name);
        setIsProcessing(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      setIsProcessing(false);
      setUploadProgress(0);
      onError(`Error processing file: ${error.message}`);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else if (file.type.includes('pdf')) {
        // For PDFs, we'll need a different approach
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Unsupported file type. Please upload .txt, .md, or .pdf files.'));
      }
    });
  };

  const parseFileContent = (content, fileName) => {
    // Extract key concepts and topics from the content
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const paragraphs = content.split('\n\n').filter(para => para.trim().length > 0);
    
    // Extract potential topics and concepts
    const topics = extractTopics(content);
    
    return {
      originalContent: content,
      fileName: fileName,
      topics: topics,
      paragraphs: paragraphs.slice(0, 10), // Limit to first 10 paragraphs
      wordCount: content.split(' ').length,
      lineCount: lines.length
    };
  };

  const extractTopics = (content) => {
    // Simple topic extraction - can be enhanced with NLP
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    const wordFreq = {};
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });

    // Get top words as potential topics
    const sortedWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return sortedWords;
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {!isProcessing ? (
          <div className="upload-content">
            <div className="upload-icon">📄</div>
            <h3>Drag & Drop Files Here</h3>
            <p>or click to browse files</p>
            <div className="supported-formats">
              <span>Supported: .txt, .md, .pdf</span>
            </div>
          </div>
        ) : (
          <div className="processing-content">
            <div className="processing-icon">⚡</div>
            <h3>Processing File...</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>{uploadProgress}% complete</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 
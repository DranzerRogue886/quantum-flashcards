import { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import './FileUpload.css';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
      // Check if file is supported
      const supportCheck = isFileSupported(file);
      if (!supportCheck.supported) {
        throw new Error(`Unsupported file type: ${file.name}. Please upload a supported file type.`);
      }

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

      const content = await readFileContent(file, supportCheck.category);
      const parsedContent = parseFileContent(content, file.name, supportCheck);
      
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

  // Comprehensive file type definitions
  const supportedFileTypes = {
    // Text and Markup
    text: {
      extensions: ['.txt', '.md', '.rst', '.tex', '.log', '.csv', '.tsv', '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf'],
      mimeTypes: ['text/plain', 'text/markdown', 'text/csv', 'application/json', 'application/xml', 'text/yaml'],
      category: 'Text & Markup',
      icon: '📄'
    },
    
    // Linux/Unix Files
    linux: {
      extensions: ['.sh', '.bash', '.zsh', '.fish', '.py', '.pl', '.rb', '.php', '.js', '.ts', '.go', '.rs', '.c', '.cpp', '.h', '.hpp', '.java', '.kt', '.scala', '.clj', '.hs', '.ml', '.f90', '.r', '.m', '.sql', '.dockerfile', '.dockerignore', '.gitignore', '.gitattributes', '.env', '.env.local', '.env.production', '.env.development'],
      mimeTypes: ['application/x-sh', 'application/x-bash', 'text/x-python', 'text/x-perl', 'text/x-ruby', 'text/x-php', 'application/javascript', 'text/x-typescript', 'text/x-go', 'text/x-rust', 'text/x-c', 'text/x-c++', 'text/x-java', 'text/x-kotlin', 'text/x-scala', 'text/x-clojure', 'text/x-haskell', 'text/x-ocaml', 'text/x-fortran', 'text/x-r', 'text/x-matlab', 'text/x-sql'],
      category: 'Linux & Code',
      icon: '🐧'
    },
    
    // Documents
    documents: {
      extensions: ['.doc', '.docx', '.odt', '.rtf', '.pages', '.tex', '.latex'],
      mimeTypes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.oasis.opendocument.text', 'application/rtf', 'application/x-tex', 'application/x-latex'],
      category: 'Documents',
      icon: '📝'
    },
    
    // Spreadsheets
    spreadsheets: {
      extensions: ['.xls', '.xlsx', '.ods', '.numbers', '.csv', '.tsv'],
      mimeTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.oasis.opendocument.spreadsheet', 'text/csv'],
      category: 'Spreadsheets',
      icon: '📊'
    },
    
    // Presentations
    presentations: {
      extensions: ['.ppt', '.pptx', '.odp', '.key', '.keynote'],
      mimeTypes: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.oasis.opendocument.presentation'],
      category: 'Presentations',
      icon: '📽️'
    },
    
    // PDFs
    pdf: {
      extensions: ['.pdf'],
      mimeTypes: ['application/pdf'],
      category: 'PDF Documents',
      icon: '📕'
    },
    
    // Archives
    archives: {
      extensions: ['.zip', '.tar', '.gz', '.bz2', '.xz', '.rar', '.7z', '.tar.gz', '.tar.bz2', '.tar.xz'],
      mimeTypes: ['application/zip', 'application/x-tar', 'application/gzip', 'application/x-bzip2', 'application/x-xz', 'application/x-rar-compressed', 'application/x-7z-compressed'],
      category: 'Archives',
      icon: '📦'
    },
    
    // Configuration Files
    config: {
      extensions: ['.conf', '.config', '.ini', '.cfg', '.properties', '.yml', '.yaml', '.toml', '.json', '.xml', '.lock', '.lockfile'],
      mimeTypes: ['text/plain', 'application/json', 'application/xml', 'text/yaml'],
      category: 'Configuration',
      icon: '⚙️'
    },
    
    // Data Files
    data: {
      extensions: ['.json', '.xml', '.csv', '.tsv', '.sql', '.db', '.sqlite', '.sqlite3', '.parquet', '.avro', '.orc'],
      mimeTypes: ['application/json', 'application/xml', 'text/csv', 'text/x-sql', 'application/x-sqlite3'],
      category: 'Data Files',
      icon: '🗄️'
    }
  };

  const isFileSupported = (file) => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    // Check by extension
    for (const category in supportedFileTypes) {
      const typeInfo = supportedFileTypes[category];
      if (typeInfo.extensions.some(ext => fileName.endsWith(ext))) {
        return { supported: true, category, typeInfo };
      }
    }
    
    // Check by MIME type
    for (const category in supportedFileTypes) {
      const typeInfo = supportedFileTypes[category];
      if (typeInfo.mimeTypes.some(mime => fileType.includes(mime.replace('application/', '').replace('text/', '')))) {
        return { supported: true, category, typeInfo };
      }
    }
    
    return { supported: false };
  };

  const extractTextFromFile = async (file, category) => {
    try {
      // Handle PDF files with special extraction
      if (category === 'pdf') {
        const pdfText = await extractTextFromPDF(file);
        if (pdfText.trim().length === 0) {
          return `PDF file: ${file.name}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nNote: No text content could be extracted from this PDF. It might be an image-based PDF or contain only scanned content.`;
        }
        return cleanTextContent(pdfText, category);
      }

      // Handle Word documents
      if (category === 'documents' && (file.name.endsWith('.docx') || file.name.endsWith('.doc'))) {
        const wordText = await extractTextFromWord(file);
        return cleanTextContent(wordText, category);
      }

      // Handle Excel files
      if (category === 'spreadsheets' && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        const excelText = await extractTextFromExcel(file);
        return cleanTextContent(excelText, category);
      }

      // Handle PowerPoint files
      if (category === 'presentations' && (file.name.endsWith('.pptx') || file.name.endsWith('.ppt'))) {
        const pptText = await extractTextFromPowerPoint(file);
        return cleanTextContent(pptText, category);
      }

      // Handle other file types
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          let content = e.target.result;
          
          // Process content based on file category
          if (category === 'archives') {
            content = `Archive file: ${file.name}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\nType: ${file.type || 'Unknown'}\n\nNote: Archive contents cannot be directly processed. Please extract and upload individual files.`;
          } else if (typeof content === 'string') {
            // For text files, clean and process the content
            content = cleanTextContent(content, category);
          } else {
            content = `Binary file: ${file.name}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nNote: This file type cannot be processed as text. Please convert to a text format.`;
          }
          
          resolve(content);
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };

        // Read file based on category
        if (category === 'archives') {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsText(file);
        }
      });
    } catch (error) {
      throw error;
    }
  };

  const extractTextFromPDF = async (file) => {
    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Extract text items and maintain some formatting
          const pageText = textContent.items
            .map(item => {
              // Add line breaks for items with significant vertical spacing
              const hasLineBreak = item.transform && item.transform[5] !== undefined;
              return item.str + (hasLineBreak ? '\n' : ' ');
            })
            .join('')
            .replace(/\s+/g, ' ')
            .trim();
          
          fullText += pageText + '\n\n';
        } catch (pageError) {
          console.warn(`Error extracting text from page ${pageNum}:`, pageError);
          // Continue with other pages
        }
      }
      
      const cleanedText = fullText.trim();
      if (cleanedText.length === 0) {
        throw new Error('No text content found in PDF');
      }
      
      return cleanedText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      // Try alternative approach for basic PDFs
      try {
        return await extractTextFromPDFAlternative(file);
      } catch (altError) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
      }
    }
  };

  const extractTextFromPDFAlternative = async (file) => {
    // Alternative method for basic PDFs
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Simple text extraction for basic PDFs
    const textDecoder = new TextDecoder('utf-8');
    const pdfString = textDecoder.decode(uint8Array);
    
    // Extract text content using regex patterns
    const textMatches = pdfString.match(/\(([^)]+)\)/g);
    if (textMatches) {
      return textMatches
        .map(match => match.slice(1, -1)) // Remove parentheses
        .filter(text => text.length > 2 && !text.includes('\\')) // Filter meaningful text
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    throw new Error('No text content could be extracted');
  };

  const extractTextFromWord = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || 'No text content found in Word document';
    } catch (error) {
      console.error('Word extraction error:', error);
      throw new Error('Failed to extract text from Word document');
    }
  };

  const extractTextFromExcel = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      let fullText = '';
      
      // Extract text from all sheets
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        fullText += `Sheet: ${sheetName}\n`;
        jsonData.forEach(row => {
          if (row && row.length > 0) {
            const rowText = row
              .filter(cell => cell !== null && cell !== undefined)
              .map(cell => String(cell))
              .join(' | ');
            if (rowText.trim()) {
              fullText += rowText + '\n';
            }
          }
        });
        fullText += '\n';
      });
      
      return fullText.trim() || 'No data found in Excel file';
    } catch (error) {
      console.error('Excel extraction error:', error);
      throw new Error('Failed to extract data from Excel file');
    }
  };

  const extractTextFromPowerPoint = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Basic PowerPoint text extraction
      const textDecoder = new TextDecoder('utf-8');
      const pptString = textDecoder.decode(uint8Array);
      
      // Extract text content from PowerPoint
      const textMatches = pptString.match(/[a-zA-Z0-9\s.,!?;:()[\]{}"'\-_+=<>/@#$%^&*~`|\\]+/g);
      if (textMatches) {
        return textMatches
          .filter(text => text.length > 3 && text.trim().length > 0)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      return 'No text content found in PowerPoint file';
    } catch (error) {
      console.error('PowerPoint extraction error:', error);
      throw new Error('Failed to extract text from PowerPoint file');
    }
  };

  const cleanTextContent = (content, category) => {
    // Remove excessive whitespace and normalize line endings
    let cleaned = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Category-specific cleaning
    if (category === 'pdf') {
      // Special cleaning for PDF content
      cleaned = cleaned
        .replace(/Skia\/PDF[^a-zA-Z]*/g, '') // Remove Skia/PDF renderer info
        .replace(/Google Docs Renderer[^a-zA-Z]*/g, '') // Remove Google Docs renderer info
        .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
        .replace(/\b[a-f0-9]{8,}\b/gi, '') // Remove hex strings
        .replace(/\b\d{10,}\b/g, '') // Remove long number sequences
        .replace(/[^\w\s.,!?;:()[\]{}"'\-_+=<>/@#$%^&*~`|\\]/g, '') // Keep only readable characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // If the cleaned content is too short or mostly garbage, return a helpful message
      const meaningfulWords = cleaned.split(/\s+/).filter(word => word.length > 2).length;
      if (meaningfulWords < 10) {
        return `PDF file content appears to be mostly formatting or binary data. 
        The extracted content contains: ${cleaned.substring(0, 200)}...
        
        This PDF may be image-based or contain mostly formatting information. 
        Please try uploading a text-based PDF or convert the document to text format.`;
      }
    } else if (category === 'linux') {
      // For code files, preserve structure but clean comments
      cleaned = cleaned
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*$/gm, '') // Remove line comments
        .replace(/#.*$/gm, ''); // Remove shell comments
    } else if (category === 'config') {
      // For config files, preserve structure
      cleaned = cleaned.replace(/^\s*#.*$/gm, ''); // Remove comment lines
    } else if (category === 'data') {
      // For data files, preserve structure
      cleaned = cleaned.replace(/^\s*\/\/.*$/gm, ''); // Remove comment lines
    }

    return cleaned;
  };

  const readFileContent = (file, category) => {
    return extractTextFromFile(file, category);
  };

  const parseFileContent = (content, fileName, supportCheck) => {
    // Extract key concepts and topics from the content
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const paragraphs = content.split('\n\n').filter(para => para.trim().length > 0);
    
    // Extract potential topics and concepts
    const topics = extractTopics(content, supportCheck.category);
    
    return {
      originalContent: content,
      fileName: fileName,
      fileCategory: supportCheck.category,
      fileTypeInfo: supportCheck.typeInfo,
      topics: topics,
      paragraphs: paragraphs.slice(0, 10), // Limit to first 10 paragraphs
      wordCount: content.split(' ').length,
      lineCount: lines.length
    };
  };

  const extractTopics = (content, category) => {
    // Enhanced topic extraction based on file category
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    // Category-specific keywords to prioritize
    const categoryKeywords = {
      'linux': ['function', 'class', 'import', 'export', 'module', 'package', 'config', 'server', 'client', 'api', 'database', 'query', 'script', 'shell', 'bash', 'python', 'javascript', 'typescript', 'rust', 'go', 'java', 'c++', 'c#', 'php', 'ruby', 'perl', 'sql', 'docker', 'git', 'npm', 'yarn', 'pip', 'cargo', 'maven', 'gradle'],
      'config': ['config', 'setting', 'option', 'parameter', 'environment', 'variable', 'database', 'server', 'port', 'host', 'url', 'api', 'key', 'secret', 'token', 'auth', 'ssl', 'tls', 'proxy', 'cache', 'log', 'debug', 'production', 'development', 'test'],
      'data': ['data', 'table', 'column', 'row', 'field', 'record', 'query', 'select', 'insert', 'update', 'delete', 'join', 'where', 'order', 'group', 'aggregate', 'sum', 'count', 'average', 'max', 'min', 'json', 'xml', 'csv', 'parquet', 'avro'],
      'documents': ['document', 'section', 'chapter', 'paragraph', 'heading', 'title', 'author', 'date', 'content', 'text', 'format', 'style', 'font', 'size', 'color', 'bold', 'italic', 'underline', 'list', 'table', 'image', 'link'],
      'spreadsheets': ['cell', 'row', 'column', 'sheet', 'workbook', 'formula', 'function', 'sum', 'average', 'count', 'max', 'min', 'chart', 'graph', 'data', 'table', 'filter', 'sort', 'pivot', 'vlookup', 'hlookup'],
      'presentations': ['slide', 'presentation', 'title', 'subtitle', 'bullet', 'point', 'image', 'chart', 'graph', 'animation', 'transition', 'theme', 'template', 'layout', 'background', 'font', 'color', 'size']
    };
    
    const wordFreq = {};
    const categoryWords = categoryKeywords[category] || [];
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
        // Give priority to category-specific keywords
        const priority = categoryWords.includes(cleanWord) ? 2 : 1;
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + priority;
      }
    });

    // Get top words as potential topics
    const sortedWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);

    return sortedWords;
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const getAllSupportedExtensions = () => {
    const allExtensions = [];
    for (const category in supportedFileTypes) {
      allExtensions.push(...supportedFileTypes[category].extensions);
    }
    return allExtensions.join(',');
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
          accept={getAllSupportedExtensions()}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {!isProcessing ? (
          <div className="upload-content">
            <div className="upload-icon">📄</div>
            <h3>Drag & Drop Files Here</h3>
            <p>or click to browse files</p>
            <div className="supported-formats">
              <span>Supports: Text, Code, Documents, Spreadsheets, Presentations, PDFs, Archives, Config Files</span>
            </div>
            <div className="file-categories">
              {Object.entries(supportedFileTypes).map(([key, typeInfo]) => (
                <span key={key} className="category-tag">
                  {typeInfo.icon} {typeInfo.category}
                </span>
              ))}
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
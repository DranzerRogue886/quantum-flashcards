import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

class OpenAIService {
  constructor() {
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not found. Please check your .env file.');
    }
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 second between requests
  }

  async makeRateLimitedRequest(requestConfig) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
    
    try {
      const response = await axios(requestConfig);
      return response;
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limit exceeded - wait and retry once
        console.log('Rate limit hit, waiting 2 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.lastRequestTime = Date.now();
        return await axios(requestConfig);
      }
      throw error;
    }
  }

  async generateQuantumFlashcard(topic = 'quantum computing') {
    try {
      const response = await this.makeRateLimitedRequest({
        method: 'POST',
        url: OPENAI_API_URL,
        data: {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a quantum computing expert. Create a flashcard with a question and answer about ${topic}. 
              Format the response as JSON with 'question' and 'answer' fields. 
              Make it educational and suitable for beginners to intermediate learners.`
            },
            {
              role: 'user',
              content: `Create a quantum computing flashcard about ${topic}.`
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        },
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0].message.content;
      
      // Try to parse JSON response
      try {
        return JSON.parse(content);
      } catch (parseError) {
        // If not JSON, create a structured response
        return {
          question: `What is ${topic}?`,
          answer: content
        };
      }
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate flashcard. Please try again.');
    }
  }

  async generateMultipleFlashcards(topic = 'quantum computing', count = 3) {
    try {
      const response = await this.makeRateLimitedRequest({
        method: 'POST',
        url: OPENAI_API_URL,
        data: {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a quantum computing expert. Create ${count} flashcards about ${topic}. 
              Format the response as a JSON array with objects containing 'question' and 'answer' fields. 
              Make them educational and suitable for beginners to intermediate learners.`
            },
            {
              role: 'user',
              content: `Create ${count} quantum computing flashcards about ${topic}.`
            }
          ],
          max_tokens: 600,
          temperature: 0.7
        },
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch (parseError) {
        // If not JSON, create a structured response
        return [
          {
            question: `What is ${topic}?`,
            answer: content
          }
        ];
      }
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate flashcards. Please try again.');
    }
  }

  async explainQuantumConcept(concept) {
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a quantum computing expert. Explain concepts in simple, clear terms suitable for beginners.'
            },
            {
              role: 'user',
              content: `Explain the quantum computing concept: ${concept}`
            }
          ],
          max_tokens: 400,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error('Failed to explain concept. Please try again.');
    }
  }

  async generateFlashcardsFromFile(fileContent, fileName, topics = [], fileCategory = null) {
    try {
      // Check if content is meaningful
      const meaningfulWords = fileContent.split(/\s+/).filter(word => word.length > 2).length;
      if (meaningfulWords < 5) {
        throw new Error('The file content appears to be empty or contains mostly formatting data. Please try uploading a different file with more text content.');
      }

      // Clean the content before processing
      let cleanedContent = fileContent;
      if (fileCategory === 'pdf') {
        // Additional cleaning for PDF content
        cleanedContent = fileContent
          .replace(/Skia\/PDF[^a-zA-Z]*/g, '')
          .replace(/Google Docs Renderer[^a-zA-Z]*/g, '')
          .replace(/[^\x20-\x7E\n]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Check if cleaned content is still meaningful
        const cleanedWords = cleanedContent.split(/\s+/).filter(word => word.length > 2).length;
        if (cleanedWords < 5) {
          throw new Error('The PDF appears to be image-based or contains mostly formatting data. Please try uploading a text-based PDF or convert the document to text format.');
        }
      }

      // Truncate content if too long (OpenAI has token limits)
      const maxContentLength = 4000;
      const truncatedContent = cleanedContent.length > maxContentLength 
        ? cleanedContent.substring(0, maxContentLength) + '...'
        : cleanedContent;

      // Create category-specific instructions
      const categoryInstructions = {
        'linux': 'Focus on programming concepts, functions, classes, imports, and code structure. Create flashcards about coding practices, syntax, and development concepts.',
        'config': 'Focus on configuration settings, parameters, environment variables, and system setup. Create flashcards about configuration management and system administration.',
        'data': 'Focus on data structures, queries, database concepts, and data analysis. Create flashcards about data management and analysis techniques.',
        'documents': 'Focus on document content, key concepts, and important information. Create flashcards about the main topics and ideas presented.',
        'spreadsheets': 'Focus on data analysis, formulas, functions, and spreadsheet concepts. Create flashcards about data manipulation and analysis.',
        'presentations': 'Focus on presentation content, key points, and main ideas. Create flashcards about the topics and concepts presented.',
        'text': 'Focus on the main content, key concepts, and important information. Create flashcards about the primary topics and ideas.',
        'pdf': 'Focus on the document content, key concepts, and important information. Create flashcards about the main topics, definitions, and important details from the PDF document. Pay attention to headings, bullet points, and structured content.',
        'archives': 'Focus on file management and archive concepts. Create flashcards about file organization and data storage.'
      };

      const categoryInstruction = categoryInstructions[fileCategory] || 'Focus on the main concepts and important information from the content.';

      const response = await this.makeRateLimitedRequest({
        method: 'POST',
        url: OPENAI_API_URL,
        data: {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert educator specializing in creating educational flashcards from various types of content. 
              ${categoryInstruction}
              
              Create 5 educational flashcards based on the provided content. 
              Each flashcard should have a clear question and comprehensive answer.
              Format the response as a JSON array with objects containing 'question' and 'answer' fields.
              Make the flashcards educational, accurate, and suitable for learning.
              
              Example format:
              [
                {
                  "question": "What is the main concept?",
                  "answer": "The main concept is..."
                }
              ]`
            },
            {
              role: 'user',
              content: `Create 5 flashcards from this content:
              
              File: ${fileName}
              File Type: ${fileCategory || 'Unknown'}
              Key topics identified: ${topics.join(', ')}
              
              Content:
              ${truncatedContent}
              
              Generate flashcards that cover the main concepts and important details from this content.
              If the content appears to be mostly formatting or binary data, create flashcards about file types and document processing instead.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        // Ensure we have an array of flashcards
        if (Array.isArray(parsed)) {
          return parsed;
        } else if (parsed.question && parsed.answer) {
          return [parsed];
        } else {
          throw new Error('Invalid response format');
        }
      } catch (parseError) {
        console.log('Failed to parse JSON, creating structured response:', parseError);
        // If not JSON, create a structured response
        return [
          {
            question: `What are the main concepts in ${fileName}?`,
            answer: content
          }
        ];
      }
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      
      // Provide helpful error messages based on the error type
      if (error.message.includes('empty') || error.message.includes('formatting')) {
        throw new Error(error.message);
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.response?.status === 401) {
        throw new Error('API key error. Please check your OpenAI configuration.');
      } else {
        throw new Error('Failed to generate flashcards from file. Please try again or upload a different file.');
      }
    }
  }

  async analyzeFileContent(fileContent, fileName, fileCategory = null) {
    try {
      const maxContentLength = 3000;
      const truncatedContent = fileContent.length > maxContentLength 
        ? fileContent.substring(0, maxContentLength) + '...'
        : fileContent;

      const categoryInstructions = {
        'linux': 'Focus on programming concepts, code structure, functions, and development practices.',
        'config': 'Focus on configuration settings, system parameters, and administrative concepts.',
        'data': 'Focus on data structures, database concepts, and data analysis techniques.',
        'documents': 'Focus on document content, key concepts, and main ideas presented.',
        'spreadsheets': 'Focus on data analysis, formulas, and spreadsheet concepts.',
        'presentations': 'Focus on presentation content, key points, and main ideas.',
        'text': 'Focus on the main content and key concepts.',
        'pdf': 'Focus on document content and key concepts.',
        'archives': 'Focus on file management and archive concepts.'
      };

      const categoryInstruction = categoryInstructions[fileCategory] || '';

      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert content analyzer specializing in ${fileCategory || 'various'} content types. 
              ${categoryInstruction}
              
              Analyze the provided content and extract key topics, concepts, and learning objectives.
              Provide a structured analysis that can be used for creating educational content.`
            },
            {
              role: 'user',
              content: `Analyze this content and provide:
              1. Main topics covered
              2. Key concepts
              3. Learning objectives
              4. Difficulty level
              5. Suggested study approach
              
              File: ${fileName}
              File Type: ${fileCategory || 'Unknown'}
              
              Content:
              ${truncatedContent}`
            }
          ],
          max_tokens: 600,
          temperature: 0.5
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error('Failed to analyze file content. Please try again.');
    }
  }

  async extractNotesFromContent(fileContent, fileName, fileCategory = null) {
    try {
      const maxContentLength = 4000;
      const truncatedContent = fileContent.length > maxContentLength 
        ? fileContent.substring(0, maxContentLength) + '...'
        : fileContent;

      const categoryInstructions = {
        'linux': 'Extract key programming concepts, function definitions, class structures, and important code patterns.',
        'config': 'Extract configuration parameters, settings, environment variables, and system requirements.',
        'data': 'Extract data structures, queries, database schemas, and data relationships.',
        'documents': 'Extract main ideas, key concepts, important facts, and supporting details.',
        'spreadsheets': 'Extract data patterns, formulas, functions, and analytical insights.',
        'presentations': 'Extract key points, main ideas, supporting details, and presentation structure.',
        'text': 'Extract main concepts, key ideas, important facts, and supporting information.',
        'pdf': 'Extract document content, key concepts, important information, and structured content. Pay attention to headings, sections, bullet points, and organized information from the PDF.',
        'archives': 'Extract file organization, structure, and management concepts.'
      };

      const categoryInstruction = categoryInstructions[fileCategory] || 'Extract the main concepts and important information.';

      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert note-taker and content summarizer specializing in ${fileCategory || 'various'} content types.
              ${categoryInstruction}
              
              Create comprehensive notes from the provided content that can be used for learning and study.
              Organize the notes in a clear, structured format with main points, subpoints, and key details.`
            },
            {
              role: 'user',
              content: `Create detailed notes from this content:
              
              File: ${fileName}
              File Type: ${fileCategory || 'Unknown'}
              
              Content:
              ${truncatedContent}
              
              Organize the notes with:
              - Main topics and concepts
              - Key definitions and explanations
              - Important details and examples
              - Related concepts and connections
              - Study tips and recommendations`
            }
          ],
          max_tokens: 800,
          temperature: 0.5
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error('Failed to extract notes from content. Please try again.');
    }
  }
}

export default new OpenAIService(); 
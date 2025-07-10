import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

class OpenAIService {
  constructor() {
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not found. Please check your .env file.');
    }
  }

  async generateQuantumFlashcard(topic = 'quantum computing') {
    try {
      const response = await axios.post(
        OPENAI_API_URL,
        {
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
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

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
      const response = await axios.post(
        OPENAI_API_URL,
        {
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
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

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

  async generateFlashcardsFromFile(fileContent, fileName, topics = []) {
    try {
      // Truncate content if too long (OpenAI has token limits)
      const maxContentLength = 3000;
      const truncatedContent = fileContent.length > maxContentLength 
        ? fileContent.substring(0, maxContentLength) + '...'
        : fileContent;

      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert educator. Create 5 educational flashcards based on the provided content. 
              Each flashcard should have a clear question and comprehensive answer.
              Format the response as a JSON array with objects containing 'question' and 'answer' fields.
              Make the flashcards educational and suitable for learning.`
            },
            {
              role: 'user',
              content: `Create 5 flashcards from this content: ${truncatedContent}
              
              Key topics identified: ${topics.join(', ')}
              File: ${fileName}
              
              Generate flashcards that cover the main concepts and important details from this content.`
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch (parseError) {
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
      throw new Error('Failed to generate flashcards from file. Please try again.');
    }
  }

  async analyzeFileContent(fileContent, fileName) {
    try {
      const maxContentLength = 2000;
      const truncatedContent = fileContent.length > maxContentLength 
        ? fileContent.substring(0, maxContentLength) + '...'
        : fileContent;

      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert content analyzer. Analyze the provided content and extract key topics, concepts, and learning objectives.'
            },
            {
              role: 'user',
              content: `Analyze this content and provide:
              1. Main topics covered
              2. Key concepts
              3. Learning objectives
              4. Difficulty level
              
              Content: ${truncatedContent}
              File: ${fileName}`
            }
          ],
          max_tokens: 500,
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
}

export default new OpenAIService(); 
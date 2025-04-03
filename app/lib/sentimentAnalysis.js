import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyzes sentiment of a text using OpenAI's API
 * @param {string} text - The text to analyze
 * @returns {Promise<Object>} - Sentiment analysis results
 */
export async function analyzeSentimentWithOpenAI(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis tool. Analyze the sentiment of the following text and return a JSON object with the following properties: score (from -1 to 1, where -1 is very negative, 0 is neutral, and 1 is very positive), magnitude (from 0 to 1, indicating the strength of the sentiment), and dominant_emotion (one of: joy, sadness, anger, fear, surprise, neutral)."
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    // Parse the response content as JSON
    let result;
    try {
      result = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response as JSON:', parseError);
      // Fallback to a default result if parsing fails
      result = { 
        score: 0, 
        magnitude: 0, 
        dominant_emotion: 'neutral' 
      };
    }
    
    // Include debugging information
    return {
      ...result,
      debug: {
        model: response.model,
        usage: response.usage,
        raw_response: response.choices[0].message.content
      }
    };
  } catch (error) {
    console.error('Error analyzing sentiment with OpenAI:', error);
    return { 
      score: 0, 
      magnitude: 0, 
      dominant_emotion: 'neutral',
      debug: {
        error: error.message,
        stack: error.stack
      }
    };
  }
}

/**
 * Analyzes sentiment of a message and returns sentiment data
 * @param {string} message - The message to analyze
 * @param {number} threshold - Optional threshold for sentiment classification
 * @returns {Promise<Object>} - Sentiment analysis results
 */
export async function analyzeSentiment(message, threshold = 0.3) {
  try {
    // For short messages or simple feedback, use a simpler approach
    if (message.length < 50) {
      const result = await analyzeShortMessage(message);
      return {
        ...result,
        debug: {
          method: 'keyword-based',
          message_length: message.length,
          threshold
        }
      };
    }
    
    // For longer messages, use OpenAI for more accurate analysis
    return await analyzeSentimentWithOpenAI(message);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return { 
      score: 0, 
      magnitude: 0, 
      dominant_emotion: 'neutral',
      debug: {
        error: error.message,
        stack: error.stack
      }
    };
  }
}

/**
 * Analyzes short messages with a simpler approach
 * @param {string} message - The short message to analyze
 * @returns {Promise<Object>} - Sentiment analysis results
 */
async function analyzeShortMessage(message) {
  // Simple keyword-based sentiment analysis for short messages
  const positiveKeywords = ['great', 'good', 'excellent', 'helpful', 'thanks', 'thank', 'awesome', 'perfect', 'love', 'amazing'];
  const negativeKeywords = ['bad', 'terrible', 'awful', 'horrible', 'useless', 'wrong', 'incorrect', 'poor', 'hate', 'disappointed'];
  
  const lowerMessage = message.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) positiveCount++;
  });
  
  negativeKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) negativeCount++;
  });
  
  // Calculate score
  const total = positiveCount + negativeCount;
  let score = 0;
  let magnitude = 0;
  let dominant_emotion = 'neutral';
  
  if (total > 0) {
    score = (positiveCount - negativeCount) / total;
    magnitude = Math.min(1, total / 5); // Scale magnitude based on keyword count
    
    if (score > 0.3) dominant_emotion = 'joy';
    else if (score < -0.3) dominant_emotion = 'sadness';
    else dominant_emotion = 'neutral';
  }
  
  return { 
    score, 
    magnitude, 
    dominant_emotion,
    debug: {
      positive_count: positiveCount,
      negative_count: negativeCount,
      total_keywords: total
    }
  };
} 
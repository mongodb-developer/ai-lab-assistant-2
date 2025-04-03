/**
 * Sentiment analysis service for client-side operations
 */

/**
 * Analyze sentiment of text
 * @param {string} text - Text to analyze
 * @param {boolean} includeDebug - Whether to include debugging information
 * @returns {Promise<Object>} Sentiment analysis result
 */
export const analyzeSentiment = async (text, includeDebug = false) => {
  try {
    const response = await fetch('/api/sentiment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, includeDebug })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Error analyzing sentiment: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
};

/**
 * Check if text has positive sentiment
 * @param {string} text - Text to analyze
 * @param {boolean} includeDebug - Whether to include debugging information
 * @returns {Promise<boolean>} Whether text has positive sentiment
 */
export const isPositiveSentiment = async (text, includeDebug = false) => {
  try {
    const sentiment = await analyzeSentiment(text, includeDebug);
    return sentiment.score > 0.3;
  } catch (error) {
    console.error('Error checking positive sentiment:', error);
    return false;
  }
};

/**
 * Check if text has negative sentiment
 * @param {string} text - Text to analyze
 * @param {boolean} includeDebug - Whether to include debugging information
 * @returns {Promise<boolean>} Whether text has negative sentiment
 */
export const isNegativeSentiment = async (text, includeDebug = false) => {
  try {
    const sentiment = await analyzeSentiment(text, includeDebug);
    return sentiment.score < -0.3;
  } catch (error) {
    console.error('Error checking negative sentiment:', error);
    return false;
  }
};

/**
 * Get dominant emotion from text
 * @param {string} text - Text to analyze
 * @param {boolean} includeDebug - Whether to include debugging information
 * @returns {Promise<string>} Dominant emotion
 */
export const getDominantEmotion = async (text, includeDebug = false) => {
  try {
    const sentiment = await analyzeSentiment(text, includeDebug);
    return sentiment.dominant_emotion;
  } catch (error) {
    console.error('Error getting dominant emotion:', error);
    return 'neutral';
  }
}; 
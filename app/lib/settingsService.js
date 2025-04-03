/**
 * Settings service for client-side operations
 */

/**
 * Fetch admin settings
 * @returns {Promise<Object>} Settings object
 */
export const fetchSettings = async () => {
  try {
    const response = await fetch('/api/admin/settings');
    
    if (!response.ok) {
      throw new Error(`Error fetching settings: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default settings on error
    return {
      sentimentAnalysisEnabled: true,
      feedbackCollectionEnabled: true,
      sentimentAnalysisThreshold: 0.3,
    };
  }
};

/**
 * Get a specific setting value
 * @param {string} key - Setting key
 * @returns {Promise<any>} Setting value
 */
export const getSetting = async (key) => {
  try {
    const settings = await fetchSettings();
    return settings[key];
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    // Return default values for common settings
    const defaults = {
      enableFeedbackCollection: true,
      enableSentimentAnalysis: true,
      sentimentAnalysisThreshold: 0.3,
      feedbackPromptFrequency: 'after_module',
      feedbackPromptMessage: 'How was this workshop?'
    };
    return defaults[key] ?? null;
  }
};

/**
 * Check if feedback collection is enabled
 * @returns {Promise<boolean>} Whether feedback collection is enabled
 */
export const isFeedbackCollectionEnabled = async () => {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      console.warn('Failed to fetch settings, defaulting to enabled');
      return true; // Default to enabled
    }
    
    const settings = await response.json();
    return settings.feedbackCollectionEnabled ?? true; // Default to enabled
  } catch (error) {
    console.error('Error checking feedback collection settings:', error);
    return true; // Default to enabled on error
  }
};

/**
 * Check if sentiment analysis is enabled
 * @returns {Promise<boolean>} Whether sentiment analysis is enabled
 */
export const isSentimentAnalysisEnabled = async () => {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      console.warn('Failed to fetch settings, defaulting to enabled');
      return true; // Default to enabled
    }
    
    const settings = await response.json();
    return settings.sentimentAnalysisEnabled ?? true; // Default to enabled
  } catch (error) {
    console.error('Error checking sentiment analysis settings:', error);
    return true; // Default to enabled on error
  }
};

/**
 * Get feedback prompt frequency
 * @returns {Promise<string>} Feedback prompt frequency
 */
export const getFeedbackPromptFrequency = async () => {
  try {
    return await getSetting('feedbackPromptFrequency');
  } catch (error) {
    console.error('Error getting feedback prompt frequency:', error);
    return 'after_module'; // Default value
  }
};

/**
 * Get feedback prompt message
 * @returns {Promise<string>} Feedback prompt message
 */
export const getFeedbackPromptMessage = async () => {
  try {
    return await getSetting('feedbackPromptMessage');
  } catch (error) {
    console.error('Error getting feedback prompt message:', error);
    return 'How was this workshop?'; // Default value
  }
};

/**
 * Get sentiment analysis threshold
 * @returns {Promise<number>} Sentiment analysis threshold
 */
export const getSentimentAnalysisThreshold = async () => {
  try {
    return await getSetting('sentimentAnalysisThreshold');
  } catch (error) {
    console.error('Error getting sentiment analysis threshold:', error);
    return 0.3; // Default value
  }
};

/**
 * Get all application settings
 * @returns {Promise<Object>} Application settings
 */
export const getSettings = async () => {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      console.warn('Failed to fetch settings, returning defaults');
      // Return default settings
      return {
        sentimentAnalysisEnabled: true,
        feedbackCollectionEnabled: true,
        sentimentAnalysisThreshold: 0.3,
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default settings
    return {
      sentimentAnalysisEnabled: true,
      feedbackCollectionEnabled: true,
      sentimentAnalysisThreshold: 0.3,
    };
  }
};

/**
 * Update application settings
 * @param {Object} settings - Settings to update
 * @returns {Promise<Object>} Updated settings
 */
export const updateSettings = async (settings) => {
  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update settings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}; 
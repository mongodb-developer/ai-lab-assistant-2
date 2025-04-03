/**
 * Feedback service for client-side feedback submission
 */

/**
 * Submit feedback to the API
 * @param {Object} feedbackData - The feedback data to submit
 * @returns {Promise<Object>} - The API response
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    // Check if unauthorized
    if (response.status === 401) {
      throw new Error('You need to sign in to submit feedback');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error submitting feedback: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

/**
 * Fetch feedback from the API
 * @returns {Promise<Array>} - The feedback data
 */
export const fetchFeedback = async () => {
  try {
    const response = await fetch('/api/feedback');

    // Check if unauthorized
    if (response.status === 401) {
      throw new Error('You need to sign in to view feedback');
    }

    // Check if forbidden
    if (response.status === 403) {
      throw new Error('You do not have permission to view feedback');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error fetching feedback: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

/**
 * Submit quick feedback for a chat message
 * @param {string} messageId - The ID of the message
 * @param {string} chatSessionId - The ID of the chat session
 * @param {boolean} isPositive - Whether the feedback is positive
 * @param {string} comment - Optional comment
 * @param {string} workshopId - Optional workshop ID
 * @param {string} moduleId - Optional module ID
 * @returns {Promise<Object>} - The API response
 */
export async function submitQuickFeedback(messageId, chatSessionId, isPositive, comment = '', workshopId = 'default', moduleId = '') {
  const rating = isPositive ? 5 : 1;
  
  return submitFeedback({
    workshopId,
    moduleId,
    feedbackType: 'chat',
    ratings: {
      assistant_helpfulness: rating
    },
    freeText: comment,
    messageId,
    chatSessionId
  });
}

/**
 * Submit comprehensive workshop feedback
 * @param {Object} feedbackData - The feedback data
 * @returns {Promise<Object>} - The API response
 */
export async function submitWorkshopFeedback(feedbackData) {
  return submitFeedback({
    ...feedbackData,
    feedbackType: 'prompt'
  });
}

/**
 * Submit exit survey feedback
 * @param {Object} feedbackData - The feedback data
 * @returns {Promise<Object>} - The API response
 */
export async function submitExitSurvey(feedbackData) {
  return submitFeedback({
    ...feedbackData,
    feedbackType: 'exit'
  });
} 
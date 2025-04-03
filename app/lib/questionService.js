import OpenAI from 'openai';
import Question from '../models/Question';
import UnansweredQuestion from '../models/UnansweredQuestion';
import { generateEmbedding } from './embeddings';
import { connectToDatabase } from './mongodb';
import { getRelevantChunks, trackRagQuery } from './ragSearch';

const SIMILARITY_THRESHOLD = 0.98;

/**
 * Process a question using vector search and LLM fallback
 * @param {string} question - The user's question
 * @param {Array} context - Recent conversation context
 * @param {boolean} debug - Whether to include debug information
 * @param {string} userId - The user's ID
 * @param {string} chatSessionId - The chat session ID
 * @returns {Promise<Object>} - The processed question with answer
 */
export async function processQuestion(question, context = [], debug = false, userId = null, chatSessionId = null) {
  try {
    console.log('\n=== Question Processing Debug Info ===');
    console.log('Input Question:', question);
    console.log('Context Length:', context.length);
    console.log('User ID:', userId);
    console.log('Chat Session ID:', chatSessionId);

    // Initialize debug info if debug mode is enabled
    const debugInfo = debug ? {
      hasQuestionCollection: false,
      totalDocs: 0,
      embeddingLength: 0,
      similarityThreshold: SIMILARITY_THRESHOLD,
      numCandidates: 200,
      rawResults: [],
      finalSource: null,
      matchedQuestion: null,
      finalScore: null,
      processingTime: 0,
      vectorSearchQuery: null,
      contextUsed: context.length > 0,
      ragInfo: null
    } : null;

    const startTime = debug ? Date.now() : null;

    // Ensure database connection
    const { conn, db } = await connectToDatabase();
    
    // Check collection and index status
    console.log('\nChecking collection and index status:');
    const collections = await db.listCollections().toArray();
    const hasQuestionCollection = collections.some(col => col.name === 'questions');
    console.log('Questions collection exists:', hasQuestionCollection);

    if (debug) {
      debugInfo.hasQuestionCollection = hasQuestionCollection;
    }

    if (hasQuestionCollection) {
      const indexes = await db.collection('questions').listIndexes().toArray();
      console.log('\nAvailable indexes:', indexes.map(idx => ({
        name: idx.name,
        key: idx.key,
        type: idx.type
      })));
    }

    // Count documents in collection
    const totalDocs = await Question.countDocuments();
    console.log('Total documents in collection:', totalDocs);

    if (debug) {
      debugInfo.totalDocs = totalDocs;
    }

    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);
    console.log('Generated embedding vector length:', questionEmbedding.length);
    
    if (debug) {
      debugInfo.embeddingLength = questionEmbedding.length;
    }

    // First try to find a similar question in the database
    console.log('\nSearching for similar questions...');
    const similarQuestions = await Question.aggregate([
      {
        $vectorSearch: {
          queryVector: questionEmbedding,
          path: 'question_embedding',
          numCandidates: 200,
          limit: 10,
          index: 'question_index'
        }
      },
      {
        $addFields: {
          similarity_score: { $meta: 'vectorSearchScore' }
        }
      },
      {
        $match: {
          similarity_score: { $gte: SIMILARITY_THRESHOLD }
        }
      }
    ]);

    if (debug) {
      debugInfo.rawResults = similarQuestions.map(q => ({
        question: q.question,
        score: q.similarity_score,
        module: q.module,
        distance: 1 - q.similarity_score
      }));
    }

    // If we have a good match, return its answer
    const bestMatch = similarQuestions[0];
    if (bestMatch && bestMatch.similarity_score >= SIMILARITY_THRESHOLD) {
      console.log('Found similar question with score:', bestMatch.similarity_score);
      
      if (debug) {
        debugInfo.finalSource = 'database';
        debugInfo.matchedQuestion = bestMatch.question;
        debugInfo.finalScore = bestMatch.similarity_score;
        debugInfo.processingTime = Date.now() - startTime;
      }

      return {
        question,
        answer: bestMatch.answer,
        title: bestMatch.title,
        references: bestMatch.references,
        similarity_score: bestMatch.similarity_score,
        source: {
          type: 'database',
          label: 'Matched Question',
          description: 'This answer was found from a similar question in our database',
          matched_question: bestMatch.question,
          confidence: Math.round(bestMatch.similarity_score * 100) + '%'
        },
        debug: debugInfo
      };
    }

    // If no good match, use RAG-enhanced LLM
    console.log('\nNo similar question found. Using RAG to enhance LLM response.');
    
    // Get relevant chunks from RAG documents
    const { chunks, debugInfo: ragDebugInfo } = await getRelevantChunks(question, { debug: true });
    const ragContext = chunks
      .map(result => `From "${result.title}":\n${result.chunk.content}`)
      .join('\n\n');
    
    if (debug) {
      debugInfo.ragInfo = ragDebugInfo;
      debugInfo.finalSource = 'rag_llm';
    }
    
    console.log(`Found ${chunks.length} relevant chunks for RAG context`);
    
    // Generate answer using OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const messages = [
      {
        role: "system",
        content: "You are an AI assistant that helps with MongoDB-related questions. Use the provided context to give accurate and helpful answers."
      }
    ];

    // Add RAG context if available
    if (ragContext) {
      messages.push({
        role: "system",
        content: `Here is some relevant context to help answer the question:\n\n${ragContext}`
      });
    }

    // Add conversation context if available
    if (context.length > 0) {
      messages.push(...context.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    }

    // Add the user's question
    messages.push({
      role: "user",
      content: question
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const answer = completion.choices[0].message.content;

    // Track the RAG query for analysis
    await trackRagQuery(question, chunks, answer, userId, chatSessionId);

    if (debug) {
      debugInfo.processingTime = Date.now() - startTime;
    }

    return {
      question,
      answer,
      source: {
        type: 'rag_llm',
        label: 'AI Generated',
        description: 'This answer was generated using RAG-enhanced AI',
        context_chunks: chunks.length,
        confidence: chunks.length > 0 ? 'High' : 'Medium'
      },
      debug: debugInfo
    };

  } catch (error) {
    console.error('Error processing question:', error);
    throw error;
  }
}

/**
 * Move an unanswered question to the questions collection
 * @param {string} questionId - The ID of the unanswered question
 * @param {Object} updates - The updates to apply to the question
 * @returns {Promise<Object>} - The moved question
 */
export async function moveQuestionToAnswered(questionId, updates) {
  try {
    // Connect to database
    const { conn } = await connectToDatabase();

    // Find the unanswered question
    const unansweredQuestion = await UnansweredQuestion.findById(questionId);
    if (!unansweredQuestion) {
      throw new Error('Question not found');
    }

    // Validate required fields
    if (!updates.answer || !updates.title) {
      throw new Error('Answer and title are required');
    }

    // Generate embeddings for the question and answer
    const [questionEmbedding, answerEmbedding] = await Promise.all([
      generateEmbedding(unansweredQuestion.question),
      generateEmbedding(updates.answer)
    ]);

    // Create new question in questions collection
    const newQuestion = await Question.create({
      question: unansweredQuestion.question,
      answer: updates.answer,
      title: updates.title,
      question_embedding: questionEmbedding,
      answer_embedding: answerEmbedding,
      references: updates.references || [],
      module: updates.module || 'general',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Delete the unanswered question
    await UnansweredQuestion.findByIdAndDelete(questionId);

    return newQuestion;
  } catch (error) {
    console.error('Error moving question to answered:', error);
    throw error;
  }
}

/**
 * Bulk delete questions from either collection
 * @param {string[]} questionIds - Array of question IDs to delete
 * @param {string} collection - Either 'questions' or 'unanswered_questions'
 * @returns {Promise<Object>} Result of the bulk delete operation
 */
export async function bulkDeleteQuestions(questionIds, collection = 'questions') {
  try {
    const { conn } = await connectToDatabase();
    const Model = collection === 'questions' ? Question : UnansweredQuestion;

    const result = await Model.deleteMany({
      _id: { $in: questionIds }
    });

    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} questions`
    };
  } catch (error) {
    console.error('Error in bulk delete:', error);
    throw error;
  }
}

/**
 * Bulk update questions in either collection
 * @param {string[]} questionIds - Array of question IDs to update
 * @param {Object} updates - Updates to apply to the questions
 * @param {string} collection - Either 'questions' or 'unanswered_questions'
 * @returns {Promise<Object>} Result of the bulk update operation
 */
export async function bulkUpdateQuestions(questionIds, updates, collection = 'questions') {
  try {
    const { conn } = await connectToDatabase();
    const Model = collection === 'questions' ? Question : UnansweredQuestion;

    // If we're marking questions as answered, use moveQuestionToAnswered
    if (updates.status === 'answered' && collection === 'unanswered_questions') {
      const results = await Promise.allSettled(
        questionIds.map(id => moveQuestionToAnswered(id, updates))
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        success: true,
        successful,
        failed,
        message: `Successfully processed ${successful} questions${failed > 0 ? `, ${failed} failed` : ''}`
      };
    }

    // For regular updates
    const result = await Model.updateMany(
      { _id: { $in: questionIds } },
      { $set: { ...updates, updated_at: new Date() } }
    );

    return {
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Successfully updated ${result.modifiedCount} questions`
    };
  } catch (error) {
    console.error('Error in bulk update:', error);
    throw error;
  }
} 
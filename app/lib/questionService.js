import OpenAI from 'openai';
import Question from '../models/Question';
import UnansweredQuestion from '../models/UnansweredQuestion';
import { generateEmbedding } from './embeddings';
import { connectToDatabase } from './mongodb';

const SIMILARITY_THRESHOLD = 0.85;

/**
 * Process a question using vector search and LLM fallback
 * @param {string} question - The user's question
 * @param {boolean} debug - Whether to include debug information
 * @returns {Promise<Object>} - The processed question with answer
 */
export async function processQuestion(question, debug = false) {
  try {
    console.log('\n=== Question Processing Debug Info ===');
    console.log('Input Question:', question);

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
      vectorSearchQuery: null
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

    // Define the vector search pipeline
    const vectorSearchPipeline = [
      {
        $vectorSearch: {
          index: 'default',
          path: 'question_embedding',
          queryVector: questionEmbedding,
          numCandidates: 200,
          limit: 10,
          similarity: 'cosine'
        }
      },
      {
        $addFields: {
          similarity_score: { $meta: 'vectorSearchScore' }
        }
      }
    ];

    if (debug) {
      debugInfo.vectorSearchQuery = vectorSearchPipeline;
    }

    // Try a raw aggregation first without similarity threshold
    console.log('\nTrying raw vector search without threshold:');
    const rawResults = await Question.aggregate(vectorSearchPipeline);

    if (debug) {
      debugInfo.rawResults = rawResults.map(r => ({
        question: r.question,
        score: r.similarity_score,
        module: r.module,
        distance: 1 - r.similarity_score // Convert cosine similarity to distance
      }));
    }

    // Now perform the actual search with threshold
    const similarQuestions = await Question.aggregate([
      ...vectorSearchPipeline,
      {
        $match: {
          similarity_score: { $gte: SIMILARITY_THRESHOLD }
        }
      }
    ]);

    // Sort by similarity score
    const bestMatch = similarQuestions.sort((a, b) => b.similarity_score - a.similarity_score)[0];

    // If we have a match, return its answer
    if (bestMatch) {
      if (debug) {
        debugInfo.finalSource = 'database';
        debugInfo.matchedQuestion = bestMatch.question;
        debugInfo.finalScore = bestMatch.similarity_score;
        if (startTime) {
          debugInfo.processingTime = Date.now() - startTime;
        }
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

    if (debug) {
      debugInfo.finalSource = 'llm';
      if (startTime) {
        debugInfo.processingTime = Date.now() - startTime;
      }
    }

    // If no good match, generate answer using OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful MongoDB AI Lab Assistant. You help users with MongoDB-related questions and issues."
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const answer = completion.choices[0].message.content;

    // Store the unanswered question
    const unansweredQuestion = new UnansweredQuestion({
      question,
      answer,
      question_embedding: questionEmbedding,
      user_id: 'system',
      user_name: 'AI Assistant',
      created_at: new Date()
    });

    await unansweredQuestion.save();

    return {
      question,
      answer,
      similarity_score: 0,
      source: {
        type: 'llm',
        label: 'AI Generated',
        description: 'This answer was generated by our AI model',
        confidence: 'N/A'
      },
      debug: debugInfo
    };

  } catch (error) {
    console.error('Error processing question:', error);
    throw error;
  }
} 
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { generateEmbedding } from '@/lib/embeddings';
import { processDocument } from '@/lib/documentChunker';
import { getRelevantChunks } from '@/lib/ragSearch';
import RagDocument from '@/models/RagDocument';
import RagChunk from '@/models/RagChunk'; 
import Question from '@/models/Question';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Simple test endpoint for database connection
 * @returns {Promise<Response>} - Response with test result
 */
export async function GET() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected to database');

    // Create a test question
    const testQuestion = {
      user_id: 'test-user',
      user_name: 'Test User',
      question: 'What is MongoDB Atlas?',
      module: 'atlas',
      answered: false,
      timestamp: new Date()
    };

    console.log('Creating test question:', testQuestion);
    const question = await Question.create(testQuestion);
    console.log('Created test question:', question);

    return NextResponse.json({
      success: true,
      question
    });

  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      name: error.name,
      code: error.code
    }, { status: 500 });
  }
}

/**
 * Test RAG system functionality
 * 
 * This endpoint allows testing the full RAG workflow:
 * 1. Create a test document with embeddings
 * 2. Query the document using a test question
 * 3. Generate a response using the retrieved chunks
 * 
 * @param {Object} request - The request object
 * @returns {Promise<Response>} - The response with test results
 */
export async function POST(request) {
  try {
    const data = await request.json();
    const { action, title, content, question, deleteAfter = true } = data;

    // Connect to database
    await connectToDatabase();

    // Different test actions
    switch (action) {
      case 'upload':
        return handleUpload(title, content);
      case 'query':
        return handleQuery(question);
      case 'full-test':
        return handleFullTest(title, content, question, deleteAfter);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        name: error.name,
        code: error.code
      },
      { status: 500 }
    );
  }
}

/**
 * Handle document upload test
 * @param {string} title - Document title
 * @param {string} content - Document content
 * @returns {Promise<Response>} - Response with upload results
 */
async function handleUpload(title, content) {
  console.log(`[TEST] Uploading test document "${title}"...`);

  if (!title || !content) {
    return NextResponse.json(
      { error: 'Title and content are required' }, 
      { status: 400 }
    );
  }

  // Process document into chunks with embeddings
  console.log('[TEST] Processing document into chunks...');
  const chunks = await processDocument(content, {
    chunkSize: 1000,
    overlap: 200,
    generateEmbeddings: true
  });

  console.log(`[TEST] Created ${chunks.length} chunks with embeddings`);

  // Create the document
  const document = await RagDocument.create({
    title,
    content,
    metadata: {
      category: 'Test',
      tags: ['test', 'rag'],
      author: 'test@example.com',
      chunkCount: chunks.length
    }
  });
  
  // Store chunks in separate collection
  const storedChunks = await Promise.all(chunks.map((chunk, index) => {
    return RagChunk.create({
      document_id: document._id,
      content: chunk.content,
      embedding: chunk.embedding,
      metadata: {
        ...chunk.metadata,
        sequence: index
      }
    });
  }));

  return NextResponse.json({
    message: 'Test document uploaded successfully',
    documentId: document._id,
    chunks: chunks.map(chunk => ({
      content: chunk.content.substring(0, 100) + '...',
      embeddingLength: chunk.embedding ? chunk.embedding.length : 0,
      metadata: chunk.metadata
    }))
  });
}

/**
 * Handle document query test
 * @param {string} question - The question to test
 * @returns {Promise<Response>} - Response with query results
 */
async function handleQuery(question) {
  console.log(`[TEST] Testing RAG query with question: "${question}"`);

  if (!question) {
    return NextResponse.json(
      { error: 'Question is required' },
      { status: 400 }
    );
  }

  // Get relevant chunks using RAG search
  console.log('[TEST] Searching for relevant chunks...');
  const { chunks, context } = await getRelevantChunks(question);

  // If no chunks found, return early
  if (chunks.length === 0) {
    return NextResponse.json({
      message: 'No relevant chunks found for the question',
      chunks: [],
      answer: null
    });
  }

  // Generate answer using OpenAI with retrieved context
  console.log('[TEST] Generating answer with context...');
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are a helpful MongoDB AI Lab Assistant. You help users with MongoDB-related questions and issues. Use the following context to inform your answer, but don't reference the context directly in your response:\n\n${context}`
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

  return NextResponse.json({
    message: 'RAG query test successful',
    question,
    chunks: chunks.map(chunk => ({
      documentId: chunk.documentId,
      title: chunk.title,
      content: chunk.chunk.content.substring(0, 100) + '...',
      score: chunk.score
    })),
    context: context.substring(0, 500) + '...',
    answer
  });
}

/**
 * Handle full RAG test (upload, query, then optionally delete)
 * @param {string} title - Document title
 * @param {string} content - Document content
 * @param {string} question - Question to test
 * @param {boolean} deleteAfter - Whether to delete the test document after testing
 * @returns {Promise<Response>} - Response with test results
 */
async function handleFullTest(title, content, question, deleteAfter) {
  console.log(`[TEST] Running full RAG test flow`);

  if (!title || !content || !question) {
    return NextResponse.json(
      { error: 'Title, content, and question are all required' },
      { status: 400 }
    );
  }

  // Step 1: Upload document
  console.log('[TEST] Step 1: Uploading test document...');
  const chunks = await processDocument(content, {
    chunkSize: 1000,
    overlap: 200,
    generateEmbeddings: true
  });

  const document = await RagDocument.create({
    title,
    content,
    metadata: {
      category: 'Test',
      tags: ['test', 'rag'],
      author: 'test@example.com',
      chunkCount: chunks.length
    }
  });
  
  // Store chunks in separate collection
  await Promise.all(chunks.map((chunk, index) => {
    return RagChunk.create({
      document_id: document._id,
      content: chunk.content,
      embedding: chunk.embedding,
      metadata: {
        ...chunk.metadata,
        sequence: index
      }
    });
  }));

  // Step 2: Query the document
  console.log('[TEST] Step 2: Querying with test question...');
  
  // Add a small delay to ensure documents are indexed properly
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { chunks: relevantChunks, context } = await getRelevantChunks(question);

  // Step 3: Generate answer
  console.log('[TEST] Step 3: Generating answer...');
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are a helpful MongoDB AI Lab Assistant. You help users with MongoDB-related questions and issues. Use the following context to inform your answer, but don't reference the context directly in your response:\n\n${context}`
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

  // Step 4: Delete test document if requested
  if (deleteAfter) {
    console.log('[TEST] Step 4: Cleaning up test document...');
    // Delete chunks first
    await RagChunk.deleteMany({ document_id: document._id });
    // Then delete the document
    await RagDocument.findByIdAndDelete(document._id);
  }

  return NextResponse.json({
    message: 'Full RAG test completed successfully',
    documentInfo: {
      id: document._id,
      title,
      chunkCount: chunks.length,
      deleted: deleteAfter
    },
    questionInfo: {
      question,
      relevantChunksCount: relevantChunks.length,
      topChunkScore: relevantChunks.length > 0 ? relevantChunks[0].score : null
    },
    chunks: relevantChunks.map(chunk => ({
      title: chunk.title,
      content: chunk.chunk.content.substring(0, 150) + '...',
      score: chunk.score
    })),
    answer
  });
} 
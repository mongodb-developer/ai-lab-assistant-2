import { processQuestion } from '../../lib/questionService';
import { connectToDatabase } from '@/lib/mongodb';
import ChatSession from '@/models/ChatSession';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const { question, sessionId, debug, userId } = await req.json();

    if (!question) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Connect to database
    const { conn } = await connectToDatabase();

    // Get or create session
    let session;
    if (sessionId) {
      session = await ChatSession.findOne({ sessionId });
      if (!session) {
        return new Response(JSON.stringify({ error: 'Invalid session ID' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      // Create new session
      session = await ChatSession.create({
        sessionId: uuidv4(),
        user_id: userId || 'anonymous',
        messages: []
      });
    }

    // Add user message to session
    session.addMessage({
      role: 'user',
      content: question
    });

    // Process question with context
    const result = await processQuestion(
      question, 
      session.getRecentMessages(), 
      debug,
      session.user_id,
      session.sessionId
    );
    console.log('Processed question result:', result); // Debug log

    // Parse source if it's a string
    let source = result.source;
    if (typeof source === 'string') {
      try {
        source = JSON.parse(source);
      } catch (e) {
        source = {
          type: 'unknown',
          label: '',
          description: '',
          confidence: '0%'
        };
      }
    }

    // Add assistant message to session with properly structured metadata
    const assistantMessage = {
      role: 'assistant',
      content: result.answer,
      metadata: {
        title: result.title || '',
        summary: result.summary || '',
        references: result.references || [],
        source: {
          type: source?.type || 'unknown',
          label: source?.label || '',
          description: source?.description || '',
          confidence: source?.confidence || '0%'
        },
        match_score: result.match_score,
        debug: result.debug || {}
      }
    };

    session.addMessage(assistantMessage);

    // Save session
    await session.save();

    // Return result with session ID and properly structured response
    const response = {
      answer: result.answer,
      title: result.title || '',
      summary: result.summary || '',
      references: result.references || [],
      source: source,
      match_score: result.match_score,
      debug: result.debug || {},
      sessionId: session.sessionId
    };

    console.log('Sending API response:', response); // Debug log

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing chat request:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 
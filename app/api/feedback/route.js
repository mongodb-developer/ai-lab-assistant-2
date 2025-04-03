import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { connectToDatabase } from '../../lib/mongodb';
import Feedback from '../../models/Feedback';
import { analyzeSentimentWithOpenAI } from '../../lib/sentimentAnalysis';

/**
 * POST handler for submitting feedback
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('Unauthorized feedback submission attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { 
      workshopId, 
      moduleId, 
      feedbackType, 
      ratings, 
      conceptConfidence, 
      freeText,
      messageId,
      chatSessionId
    } = data;
    
    // Connect to database
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    // Perform sentiment analysis on free text feedback
    let sentimentData = null;
    if (freeText) {
      try {
        sentimentData = await analyzeSentimentWithOpenAI(freeText);
        console.log('Sentiment analysis completed successfully:', sentimentData);
      } catch (sentimentError) {
        console.error('Sentiment analysis error:', sentimentError);
        // Continue without sentiment analysis
        sentimentData = {
          score: 0,
          magnitude: 0,
          dominant_emotion: 'neutral',
          debug: {
            error: sentimentError.message,
            stack: sentimentError.stack
          }
        };
      }
    }
    
    // Create new feedback document
    try {
      const feedback = new Feedback({
        user_id: session.user.id,
        workshop_id: workshopId || 'default',
        module_id: moduleId,
        trigger_type: feedbackType || 'chat',
        ratings: ratings || {},
        concept_confidence: conceptConfidence || {},
        sentiment_analysis: sentimentData,
        free_text: freeText,
        created_at: new Date()
      });
      
      // Add message reference if provided
      if (messageId && chatSessionId) {
        feedback.message_id = messageId;
        feedback.chat_session_id = chatSessionId;
      }
      
      await feedback.save();
      
      return NextResponse.json({ 
        message: 'Feedback submitted successfully',
        feedbackId: feedback._id.toString()
      });
    } catch (saveError) {
      console.error('Error saving feedback:', saveError);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

/**
 * GET handler for retrieving feedback (admin only)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('Unauthorized feedback retrieval attempt - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    if (!session.user.isAdmin) {
      console.log(`Unauthorized feedback retrieval attempt - user ${session.user.email} is not admin`);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Connect to database
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get('workshopId');
    const moduleId = searchParams.get('moduleId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const query = {};
    if (workshopId) query.workshop_id = workshopId;
    if (moduleId) query.module_id = moduleId;
    if (userId) query.user_id = userId;
    
    try {
      const feedback = await Feedback.find(query)
        .sort({ created_at: -1 })
        .limit(limit);
      
      return NextResponse.json(feedback);
    } catch (findError) {
      console.error('Error finding feedback:', findError);
      return NextResponse.json({ error: 'Failed to retrieve feedback' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
} 
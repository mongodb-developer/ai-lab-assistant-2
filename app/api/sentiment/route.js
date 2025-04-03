import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { connectToDatabase } from '../../lib/mongodb';
import Settings from '../../models/Settings';
import { analyzeSentiment } from '../../lib/sentimentAnalysis';

/**
 * POST /api/sentiment
 * Analyze sentiment of text
 */
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { text, includeDebug = false } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if sentiment analysis is enabled
    const settings = await Settings.findOne({});
    
    if (!settings || !settings.enableSentimentAnalysis) {
      return NextResponse.json(
        { error: 'Sentiment analysis is disabled' },
        { status: 403 }
      );
    }
    
    // Analyze sentiment
    const sentiment = await analyzeSentiment(text, settings.sentimentAnalysisThreshold);
    
    // Include or exclude debug information based on request
    const response = includeDebug ? sentiment : {
      score: sentiment.score,
      magnitude: sentiment.magnitude,
      dominant_emotion: sentiment.dominant_emotion
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
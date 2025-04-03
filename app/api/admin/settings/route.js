import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/mongodb';
import { Settings } from '../../../models/Settings';

// Default settings
const DEFAULT_SETTINGS = {
  // Feedback settings
  enableFeedbackCollection: true,
  feedbackPromptFrequency: 'after_each_chat',
  feedbackPromptMessage: 'Was this response helpful?',
  
  // Sentiment analysis settings
  enableSentimentAnalysis: true,
  sentimentAnalysisThreshold: 0.3,
  
  // Notification settings
  enableEmailNotifications: false,
  notificationEmail: '',
  notificationFrequency: 'daily'
};

/**
 * GET /api/admin/settings
 * Get admin settings
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get settings
    let settings = await Settings.findOne({});
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create(DEFAULT_SETTINGS);
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Update admin settings
 */
export async function PUT(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Update settings
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true }
    );
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
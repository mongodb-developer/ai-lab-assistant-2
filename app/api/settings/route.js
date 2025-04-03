import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';
import { connectToDatabase } from '../../lib/mongodb';
import Settings from '../../models/Settings';

/**
 * GET /api/settings
 * Get all application settings
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return default settings if database connection fails
      return NextResponse.json({
        sentimentAnalysisEnabled: true,
        feedbackCollectionEnabled: true,
        sentimentAnalysisThreshold: 0.3,
      });
    }
    
    // Get settings or create default settings if none exist
    let settings = await Settings.findOne();
    if (!settings) {
      try {
        settings = await Settings.create({
          sentimentAnalysisEnabled: true,
          feedbackCollectionEnabled: true,
          sentimentAnalysisThreshold: 0.3,
        });
      } catch (createError) {
        console.error('Error creating default settings:', createError);
        // Return default settings if creation fails
        return NextResponse.json({
          sentimentAnalysisEnabled: true,
          feedbackCollectionEnabled: true,
          sentimentAnalysisThreshold: 0.3,
        });
      }
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default settings on error
    return NextResponse.json({
      sentimentAnalysisEnabled: true,
      feedbackCollectionEnabled: true,
      sentimentAnalysisThreshold: 0.3,
    });
  }
}

/**
 * PUT /api/settings
 * Update application settings
 */
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow admins to update settings
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Update settings or create if none exist
    try {
      const settings = await Settings.findOneAndUpdate(
        {},
        {
          $set: {
            sentimentAnalysisEnabled: body.sentimentAnalysisEnabled ?? true,
            feedbackCollectionEnabled: body.feedbackCollectionEnabled ?? true,
            sentimentAnalysisThreshold: body.sentimentAnalysisThreshold ?? 0.3,
          },
        },
        { new: true, upsert: true }
      );
      
      return NextResponse.json(settings);
    } catch (updateError) {
      console.error('Error updating settings:', updateError);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in PUT /api/settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
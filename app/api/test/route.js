import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Question from '@/models/Question';

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
      error: error.message
    }, { status: 500 });
  }
} 
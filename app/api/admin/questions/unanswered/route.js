import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import UnansweredQuestion from '../../../../models/UnansweredQuestion';

export async function GET(request) {
  try {
    const { conn } = await connectToDatabase();
    
    // Get query parameters
    const url = new URL(request.url);
    const module = url.searchParams.get('module');
    const search = url.searchParams.get('search');

    // Build query
    const query = {};
    if (module) {
      query.module = module;
    }
    if (search) {
      query.question = { $regex: search, $options: 'i' };
    }

    // Fetch questions with sorting
    const questions = await UnansweredQuestion.find(query)
      .sort({ created_at: -1 }) // Most recent first
      .lean();

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching unanswered questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch questions' },
      { status: 500 }
    );
  }
} 
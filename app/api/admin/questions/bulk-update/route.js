import { NextResponse } from 'next/server';
import { bulkUpdateQuestions } from '../../../../lib/questionService';

export async function PUT(request) {
  try {
    const { questionIds, updates, collection = 'questions' } = await request.json();

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { error: 'No questions selected' },
        { status: 400 }
      );
    }

    // Validate required fields for marking as answered
    if (updates.status === 'answered' && (!updates.answer || !updates.title)) {
      return NextResponse.json(
        { error: 'Answer and title are required when marking as answered' },
        { status: 400 }
      );
    }

    const result = await bulkUpdateQuestions(questionIds, updates, collection);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update questions' },
      { status: 500 }
    );
  }
} 
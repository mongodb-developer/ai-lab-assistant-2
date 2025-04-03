import { NextResponse } from 'next/server';
import { bulkDeleteQuestions } from '../../../../lib/questionService';

export async function DELETE(request) {
  try {
    const { questionIds, collection = 'questions' } = await request.json();

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { error: 'No questions selected' },
        { status: 400 }
      );
    }

    const result = await bulkDeleteQuestions(questionIds, collection);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete questions' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Question from '@/models/Question';
import UnansweredQuestion from '@/models/UnansweredQuestion';

// POST /api/admin/questions/[id]/approve - Move an unanswered question to the questions collection
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    await connectToDatabase();

    // Find the unanswered question
    const unansweredQuestion = await UnansweredQuestion.findById(id);
    
    if (!unansweredQuestion) {
      return NextResponse.json(
        { error: 'Unanswered question not found' },
        { status: 404 }
      );
    }

    // Create a new question in the questions collection
    const newQuestion = {
      user_id: unansweredQuestion.user_id,
      user_name: unansweredQuestion.user_name,
      question: body.question || unansweredQuestion.question,
      answer: body.answer || unansweredQuestion.answer,
      title: body.title || '',
      summary: body.summary || '',
      module: body.module || unansweredQuestion.module,
      question_embedding: unansweredQuestion.question_embedding,
      answered: true,
      created_at: unansweredQuestion.created_at,
      updated_at: new Date()
    };

    // Add the question to the questions collection
    const approvedQuestion = await Question.create(newQuestion);

    // Delete the original unanswered question
    await UnansweredQuestion.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Question approved and moved successfully',
      question: approvedQuestion
    });

  } catch (error) {
    console.error('Error approving question:', error);
    return NextResponse.json(
      { 
        error: 'Failed to approve question',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
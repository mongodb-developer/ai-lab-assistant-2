import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Question from '../../../../models/Question';
import UnansweredQuestion from '../../../../models/UnansweredQuestion';
import mongoose from 'mongoose';
import { moveQuestionToAnswered } from '../../../../lib/questionService';

// GET /api/admin/questions/[id] - Get a single question
export async function GET(request, { params }) {
  try {
    const { id } = params;
    await connectToDatabase();

    // Try to find in both collections
    let question = null;
    
    // Check if this is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      // First check in the questions collection
      question = await Question.findById(id);
      
      // If not found, check in unanswered collection
      if (!question) {
        question = await UnansweredQuestion.findById(id);
      }
    }
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);

  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/questions/[id] - Update a question
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    // If the question is being marked as answered
    if (updates.status === 'answered') {
      // Move the question to the questions collection
      const movedQuestion = await moveQuestionToAnswered(id, updates);
      return NextResponse.json(movedQuestion);
    }

    // Otherwise, update the unanswered question
    const { conn } = await connectToDatabase();
    const question = await UnansweredQuestion.findByIdAndUpdate(
      id,
      { 
        ...updates,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update question' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/questions/[id] - Delete a question
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { conn } = await connectToDatabase();
    
    const question = await UnansweredQuestion.findByIdAndDelete(id);
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete question' },
      { status: 500 }
    );
  }
} 
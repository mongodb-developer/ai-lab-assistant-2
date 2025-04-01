import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Question from '@/models/Question';

// GET /api/admin/questions/[id] - Get a single question
export async function GET(request, { params }) {
  try {
    const { id } = params;
    await connectToDatabase();

    const question = await Question.findById(id);
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
    const body = await request.json();
    await connectToDatabase();

    const question = await Question.findByIdAndUpdate(
      id,
      { ...body, updated_at: new Date() },
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
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/questions/[id] - Delete a question
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await connectToDatabase();

    const question = await Question.findByIdAndDelete(id);

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
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
} 
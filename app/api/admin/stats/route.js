import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import RagDocument from '@/models/RagDocument';
import Question from '@/models/Question';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Get total documents
    const totalDocuments = await RagDocument.countDocuments();
    
    // Get total questions
    const totalQuestions = await Question.countDocuments();
    
    // Get total chunks across all documents
    const documents = await RagDocument.find({}, 'chunks');
    const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunks?.length || 0), 0);
    
    // Get unanswered questions count
    const unansweredQuestions = await Question.countDocuments({ 
      answer: { $exists: false } 
    });

    return NextResponse.json({
      total: {
        documents: totalDocuments,
        questions: totalQuestions,
        chunks: totalChunks,
        unansweredQuestions
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 
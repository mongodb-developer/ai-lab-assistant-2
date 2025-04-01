import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import Question from '../../../models/Question';
import UnansweredQuestion from '../../../models/UnansweredQuestion';

// GET /api/admin/questions - List all questions with pagination and filters
export async function GET(request) {
  try {
    // Connect to database first
    console.log('Connecting to database...');
    const { conn } = await connectToDatabase();
    if (!conn) {
      throw new Error('Failed to connect to database');
    }
    const dbName = conn.connection.db.databaseName;
    console.log('Connected to database:', dbName);

    // First check if we can access the collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const answered = searchParams.get('answered');
    const module = searchParams.get('module');
    const search = searchParams.get('search');
    const collection = searchParams.get('collection') || 'all'; // 'all', 'questions', or 'unanswered'

    // Build query
    const query = {};
    if (answered !== null && answered !== undefined && answered !== '') {
      query.answered = answered === 'true';
    }
    if (module) {
      query.module = module;
    }
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Executing query:', JSON.stringify(query));
    console.log('Using collection:', collection);

    let total = 0;
    let questions = [];

    // Fetch questions based on collection parameter
    if (collection === 'all' || collection === 'questions') {
      const answeredQuestions = await Question.find(query)
        .sort({ timestamp: -1 })
        .skip(collection === 'questions' ? (page - 1) * limit : 0)
        .limit(collection === 'questions' ? limit : 0)
        .lean()
        .exec();
      
      if (collection === 'questions') {
        total = await Question.countDocuments(query);
        questions = answeredQuestions;
      } else {
        questions = questions.concat(answeredQuestions);
      }
    }

    if (collection === 'all' || collection === 'unanswered') {
      const unansweredQuestions = await UnansweredQuestion.find(query)
        .sort({ timestamp: -1 })
        .skip(collection === 'unanswered' ? (page - 1) * limit : 0)
        .limit(collection === 'unanswered' ? limit : 0)
        .lean()
        .exec();
      
      if (collection === 'unanswered') {
        total = await UnansweredQuestion.countDocuments(query);
        questions = unansweredQuestions;
      } else {
        questions = questions.concat(unansweredQuestions);
      }
    }

    // If fetching all, sort combined results by timestamp
    if (collection === 'all') {
      questions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      total = questions.length;
      // Apply pagination after combining
      questions = questions.slice((page - 1) * limit, page * limit);
    }

    console.log('Found questions:', questions.length);

    // Log a sample document if any found
    if (questions.length > 0) {
      console.log('Sample document:', JSON.stringify(questions[0], null, 2));
    }

    return NextResponse.json({
      questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/admin/questions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch questions', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/questions - Create a new question
export async function POST(request) {
  try {
    // Connect to database first
    console.log('Connecting to database...');
    const { conn } = await connectToDatabase();
    if (!conn) {
      throw new Error('Failed to connect to database');
    }
    console.log('Connected to database:', conn.connection.db.databaseName);

    const body = await request.json();
    const collection = body.collection || 'unanswered'; // Default to unanswered_questions
    console.log('Creating question in collection:', collection);
    console.log('Question data:', body);

    let question;
    if (collection === 'questions') {
      question = await Question.create(body);
    } else {
      question = await UnansweredQuestion.create(body);
    }
    
    console.log('Created question:', question);

    return NextResponse.json(question);

  } catch (error) {
    console.error('Error in POST /api/admin/questions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create question', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 
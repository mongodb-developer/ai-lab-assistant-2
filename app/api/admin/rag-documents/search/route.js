import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { generateEmbedding } from '@/lib/embeddings';

export async function POST(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, filters = {}, limit = 10 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    // Connect to database
    const { db } = await connectToDatabase();

    // Build the search pipeline
    const searchPipeline = [
      {
        $search: {
          index: 'default',
          knnBeta: {
            vector: queryEmbedding,
            path: 'chunks.embedding',
            k: limit * 2, // Get more results than needed for filtering
          },
          filter: {
            compound: {
              must: Object.entries(filters).map(([key, value]) => ({
                equals: { [`metadata.${key}`]: value }
              }))
            }
          }
        }
      },
      {
        $unwind: '$chunks'
      },
      {
        $sort: {
          score: -1
        }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 1,
          title: 1,
          'metadata.category': 1,
          'metadata.tags': 1,
          'chunks.content': 1,
          'chunks.metadata.section': 1,
          score: { $meta: 'searchScore' }
        }
      }
    ];

    const results = await db.collection('ragdocuments').aggregate(searchPipeline).toArray();

    return NextResponse.json({
      results
    });

  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching documents' },
      { status: 500 }
    );
  }
} 
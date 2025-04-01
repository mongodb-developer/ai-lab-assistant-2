import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, requirements, attachmentUrls } = await request.json();
    
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const designReview = {
      title,
      description,
      requirements: requirements || '',
      attachment_urls: attachmentUrls || [],
      status: 'pending',
      user_id: session.user.id,
      user_name: session.user.name,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('design_reviews').insertOne(designReview);
    
    return NextResponse.json({
      message: 'Design review request submitted successfully',
      request_id: result.insertedId.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting design review:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    
    let query = {};
    
    // If not admin, only show user's own requests
    if (!session.user.isAdmin) {
      query.user_id = session.user.id;
    }
    
    const designReviews = await db.collection('design_reviews')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    // Convert ObjectIds to strings for JSON serialization
    const serializedReviews = designReviews.map(review => ({
      ...review,
      _id: review._id.toString(),
      created_at: review.created_at.toISOString(),
      updated_at: review.updated_at.toISOString()
    }));
    
    return NextResponse.json(serializedReviews);
  } catch (error) {
    console.error('Error fetching design reviews:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

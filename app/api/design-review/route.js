import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import DesignReview from '@/models/designReview';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Create new design review with user ID
    const designReview = new DesignReview({
      ...data,
      user_id: session.user.id,
      submitted_at: new Date()
    });
    
    await designReview.save();
    
    return NextResponse.json({
      message: 'Design review request submitted successfully',
      request_id: designReview._id.toString()
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

    await connectToDatabase();
    
    let query = {};
    
    // If not admin, only show user's own requests
    if (!session.user.isAdmin) {
      query.user_id = session.user.id;
    }
    
    const designReviews = await DesignReview.find(query)
      .sort({ submitted_at: -1 })
      .lean();
    
    return NextResponse.json(designReviews);
  } catch (error) {
    console.error('Error fetching design reviews:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updateData } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const designReview = await DesignReview.findById(id);
    
    if (!designReview) {
      return NextResponse.json({ error: 'Design review not found' }, { status: 404 });
    }

    // Only allow admins or the original submitter to update
    if (!session.user.isAdmin && designReview.user_id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the review
    Object.assign(designReview, updateData);
    await designReview.save();

    return NextResponse.json({
      message: 'Design review updated successfully',
      review: designReview
    });
  } catch (error) {
    console.error('Error updating design review:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const designReview = await DesignReview.findById(id);
    
    if (!designReview) {
      return NextResponse.json({ error: 'Design review not found' }, { status: 404 });
    }

    // Only allow admins or the original submitter to delete
    if (!session.user.isAdmin && designReview.user_id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await designReview.deleteOne();

    return NextResponse.json({
      message: 'Design review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting design review:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/admin/users/[id] - Get a single user
export async function GET(request, { params }) {
  try {
    // Connect to database first
    console.log('Connecting to database...');
    const mongoose = await connectToDatabase();
    console.log('Connected to database:', mongoose.connection.db.databaseName);

    const { id } = params;
    console.log('Fetching user:', id);

    const user = await User.findById(id).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Error in GET /api/admin/users/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Update a user
export async function PATCH(request, { params }) {
  try {
    // Connect to database first
    console.log('Connecting to database...');
    const mongoose = await connectToDatabase();
    console.log('Connected to database:', mongoose.connection.db.databaseName);

    const { id } = params;
    const updateData = await request.json();
    console.log('Updating user:', id, updateData);

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Updated user:', user);
    return NextResponse.json(user);

  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(request, { params }) {
  try {
    // Connect to database first
    console.log('Connecting to database...');
    const mongoose = await connectToDatabase();
    console.log('Connected to database:', mongoose.connection.db.databaseName);

    const { id } = params;
    console.log('Deleting user:', id);

    const user = await User.findByIdAndDelete(id).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Deleted user:', user);
    return NextResponse.json({ message: 'User deleted successfully', user });

  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete user', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 
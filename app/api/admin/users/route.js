import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/admin/users - List all users with pagination and filters
export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database first
    console.log('Connecting to database...');
    const { conn } = await connectToDatabase();
    
    if (!conn || !conn.connection?.readyState) {
      console.error('Database connection failed');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    console.log('Connected to database:', conn.connection.db.databaseName);
    console.log('Connection state:', conn.connection.readyState);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search');
    const isAdmin = searchParams.get('isAdmin');

    console.log('Query parameters:', { page, limit, search, isAdmin });

    // Build query
    const query = {};
    if (isAdmin !== null && isAdmin !== undefined && isAdmin !== '') {
      query.isAdmin = isAdmin === 'true';
    }
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    try {
      // Get total count for pagination
      const total = await User.countDocuments(query);
      console.log('Total users found:', total);

      // Get users with pagination
      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();

      console.log('Users retrieved:', users.length);
      console.log('First user (if any):', users[0] ? JSON.stringify(users[0], null, 2) : 'No users found');

      return NextResponse.json({
        users: users || [],
        pagination: {
          total: total || 0,
          page,
          limit,
          totalPages: Math.ceil((total || 0) / limit)
        }
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      return NextResponse.json(
        { 
          error: 'Database operation failed',
          details: dbError.message
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    console.error('Stack trace:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch users', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request) {
  try {
    // Connect to database first
    console.log('Connecting to database...');
    const mongoose = await connectToDatabase();
    console.log('Connected to database:', mongoose.connection.db.databaseName);

    const body = await request.json();
    console.log('Creating user:', body);

    const user = await User.create(body);
    console.log('Created user:', user);

    return NextResponse.json(user);

  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create user', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Update a user
export async function PUT(request) {
  try {
    // Connect to database first
    console.log('Connecting to database...');
    const mongoose = await connectToDatabase();
    console.log('Connected to database:', mongoose.connection.db.databaseName);

    const body = await request.json();
    const { id, ...updateData } = body;
    console.log('Updating user:', id, updateData);

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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
    console.error('Error in PUT /api/admin/users:', error);
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

// DELETE /api/admin/users - Delete a user
export async function DELETE(request) {
  try {
    // Connect to database first
    console.log('Connecting to database...');
    const mongoose = await connectToDatabase();
    console.log('Connected to database:', mongoose.connection.db.databaseName);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('Deleting user:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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
    console.error('Error in DELETE /api/admin/users:', error);
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
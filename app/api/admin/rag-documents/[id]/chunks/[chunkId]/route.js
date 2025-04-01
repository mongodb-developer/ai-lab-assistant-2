import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, chunkId } = params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(chunkId)) {
      return NextResponse.json(
        { error: 'Invalid document or chunk ID' },
        { status: 400 }
      );
    }

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const documents = db.collection('rag_documents');

    // Get document
    const document = await documents.findOne({
      _id: new ObjectId(id)
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Find and update the chunk
    const chunkIndex = document.chunks.findIndex(
      chunk => chunk._id.toString() === chunkId
    );

    if (chunkIndex === -1) {
      return NextResponse.json(
        { error: 'Chunk not found' },
        { status: 404 }
      );
    }

    // Update the chunk content
    document.chunks[chunkIndex].content = content.trim();
    document.chunks[chunkIndex].metadata.lastUpdated = new Date();

    // Update document
    await documents.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          chunks: document.chunks,
          'metadata.lastUpdated': new Date()
        }
      }
    );

    return NextResponse.json({ chunk: document.chunks[chunkIndex] });
  } catch (error) {
    console.error('Error updating chunk:', error);
    return NextResponse.json(
      { error: 'Failed to update chunk' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, chunkId } = params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(chunkId)) {
      return NextResponse.json(
        { error: 'Invalid document or chunk ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const documents = db.collection('rag_documents');

    // Get document
    const document = await documents.findOne({
      _id: new ObjectId(id)
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Remove the chunk
    const updatedChunks = document.chunks.filter(
      chunk => chunk._id.toString() !== chunkId
    );

    // Update document
    await documents.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          chunks: updatedChunks,
          'metadata.chunkCount': updatedChunks.length,
          'metadata.lastUpdated': new Date()
        }
      }
    );

    return NextResponse.json({ message: 'Chunk deleted successfully' });
  } catch (error) {
    console.error('Error deleting chunk:', error);
    return NextResponse.json(
      { error: 'Failed to delete chunk' },
      { status: 500 }
    );
  }
} 
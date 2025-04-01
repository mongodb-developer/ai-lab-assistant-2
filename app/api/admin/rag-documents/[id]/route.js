import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import RagDocument from '@/models/RagDocument';
import RagChunk from '@/models/RagChunk';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Find the document
    const document = await RagDocument.findById(id).lean();

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Find associated chunks
    const chunks = await RagChunk.find({ document_id: new ObjectId(id) })
      .sort({ 'metadata.sequence': 1 })
      .lean();
    
    // Add chunks to the document for backwards compatibility
    const fullDocument = {
      ...document,
      chunks
    };

    return NextResponse.json({ document: fullDocument });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    const { title, category, tags } = await request.json();
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const documents = db.collection('rag_documents');

    const update = {
      title: title.trim(),
      'metadata.lastUpdated': new Date()
    };

    if (category !== undefined) {
      update['metadata.category'] = category;
    }

    if (tags !== undefined) {
      update['metadata.tags'] = tags;
    }

    const result = await documents.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const updatedDocument = await documents.findOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
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

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Delete chunks first
    await RagChunk.deleteMany({ document_id: new ObjectId(id) });
    
    // Then delete document
    const result = await RagDocument.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Document and associated chunks deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 
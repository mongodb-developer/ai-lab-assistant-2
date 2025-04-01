import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/admin/rag-documents
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const documents = await db.collection('rag_documents')
      .find({})
      .sort({ 'metadata.lastUpdated': -1 })
      .toArray();

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching RAG documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/admin/rag-documents
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const category = formData.get('category');
    const tags = JSON.parse(formData.get('tags'));

    if (!file || !title) {
      return NextResponse.json(
        { error: 'File and title are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const documents = db.collection('rag_documents');

    // Read file content
    const buffer = await file.arrayBuffer();
    const content = new TextDecoder().decode(buffer);

    // Create document
    const document = {
      title,
      content,
      metadata: {
        category,
        tags,
        chunkCount: 0,
        lastUpdated: new Date(),
        fileType: file.type,
        fileName: file.name
      }
    };

    const result = await documents.insertOne(document);

    return NextResponse.json({
      message: 'Document created successfully',
      documentId: result.insertedId
    });
  } catch (error) {
    console.error('Error creating RAG document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/rag-documents
export async function PUT(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const data = await request.json();
    const { document_id, title, content, category, tags } = data;

    if (!document_id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Connect to database
    const { conn } = await connectToDatabase();

    // Find the document
    const document = await RagDocument.findById(document_id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update document fields
    if (title) document.title = title;
    if (content) document.content = content;
    if (category) document.metadata.category = category;
    if (tags) document.metadata.tags = tags;
    document.metadata.lastUpdated = new Date();

    // Save the document
    await document.save();

    return NextResponse.json({
      message: 'Document updated successfully',
      document
    });

  } catch (error) {
    console.error('Error updating RAG document:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the document' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/rag-documents
export async function DELETE(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get document ID from query parameters
    const { searchParams } = new URL(request.url);
    const document_id = searchParams.get('document_id');

    if (!document_id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Connect to database
    const { conn } = await connectToDatabase();

    // Find and delete the document
    const result = await RagDocument.findByIdAndDelete(document_id);
    if (!result) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Document deleted successfully',
      document_id
    });

  } catch (error) {
    console.error('Error deleting RAG document:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the document' },
      { status: 500 }
    );
  }
} 
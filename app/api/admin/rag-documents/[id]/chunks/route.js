import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import RagDocument from '@/models/RagDocument';
import RagChunk from '@/models/RagChunk';
import { generateEmbedding } from '@/lib/embeddings';
import { ObjectId } from 'mongodb';

// GET /api/admin/rag-documents/[id]/chunks
export async function GET(request, { params }) {
  try {
    // Check authentication first
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!session.user?.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    await connectToDatabase();

    console.log('Finding document with ID:', id);
    const document = await RagDocument.findById(id);

    if (!document) {
      console.log('Document not found with ID:', id);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Find chunks for this document
    const chunks = await RagChunk.find({ document_id: new ObjectId(id) })
      .sort({ 'metadata.sequence': 1 })
      .lean();

    console.log(`Successfully found document with ${chunks.length} chunks`);
    return NextResponse.json({ chunks });
  } catch (error) {
    console.error('Error fetching document chunks:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch chunks', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/rag-documents/[id]/chunks
export async function POST(request, { params }) {
  try {
    // Check authentication first
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!session.user?.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      );
    }

    const { chunkSize, overlap } = await request.json();
    if (!chunkSize || chunkSize < 100) {
      return NextResponse.json(
        { error: 'Invalid chunk size' },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    await connectToDatabase();

    // Get document
    console.log('Finding document with ID:', id);
    const document = await RagDocument.findById(id);

    if (!document) {
      console.log('Document not found with ID:', id);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (!document.content) {
      console.error('Document has no content');
      return NextResponse.json(
        { error: 'Document has no content to chunk' },
        { status: 400 }
      );
    }

    // Delete existing chunks first
    console.log('Deleting existing chunks...');
    await RagChunk.deleteMany({ document_id: new ObjectId(id) });

    // Split content into chunks
    console.log('Splitting content into chunks...');
    const content = document.content;
    const processedChunks = [];
    let startIndex = 0;

    while (startIndex < content.length) {
      const endIndex = Math.min(startIndex + chunkSize, content.length);
      const chunk = content.slice(startIndex, endIndex);

      // Find the last complete sentence or paragraph
      let lastBreak = chunk.lastIndexOf('. ');
      if (lastBreak === -1) {
        lastBreak = chunk.lastIndexOf('\n\n');
      }
      if (lastBreak === -1) {
        lastBreak = chunk.length;
      }

      processedChunks.push({
        content: chunk.slice(0, lastBreak + 1).trim(),
        startIndex,
        endIndex: startIndex + lastBreak + 1,
        sequence: processedChunks.length
      });

      startIndex += lastBreak + 1 - overlap;
    }

    // Generate embeddings and create chunk documents
    console.log('Generating embeddings and storing chunks...');
    const chunks = [];
    
    for (let i = 0; i < processedChunks.length; i++) {
      const pc = processedChunks[i];
      // Generate embedding
      const embedding = await generateEmbedding(pc.content);
      
      // Create chunk document
      const chunk = await RagChunk.create({
        document_id: document._id,
        content: pc.content,
        embedding,
        metadata: {
          startIndex: pc.startIndex,
          endIndex: pc.endIndex,
          section: `Chunk ${i+1}`,
          sequence: i
        }
      });
      
      chunks.push(chunk);
    }

    // Update document metadata
    console.log('Updating document metadata...');
    await RagDocument.findByIdAndUpdate(id, {
      $set: {
        'metadata.chunkCount': chunks.length,
        'metadata.lastUpdated': new Date()
      }
    });

    console.log(`Successfully created ${chunks.length} new chunks`);
    return NextResponse.json({ chunks });
  } catch (error) {
    console.error('Error creating document chunks:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create chunks', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/rag-documents/[id]/chunks
export async function DELETE(request, { params }) {
  try {
    // Check authentication first
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (!session.user?.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const chunkIndex = parseInt(searchParams.get('chunk_index'));

    if (typeof chunkIndex !== 'number' || isNaN(chunkIndex)) {
      return NextResponse.json(
        { error: 'Valid chunk_index is required' },
        { status: 400 }
      );
    }

    // Connect to database
    console.log('Connecting to database...');
    await connectToDatabase();

    // Find the document
    console.log('Finding document with ID:', id);
    const document = await RagDocument.findById(id);
    if (!document) {
      console.log('Document not found with ID:', id);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Find chunks for this document
    const chunks = await RagChunk.find({ 
      document_id: new ObjectId(id) 
    }).sort({ 'metadata.sequence': 1 });
    
    // Check if chunk index is valid
    if (chunkIndex < 0 || chunkIndex >= chunks.length) {
      return NextResponse.json(
        { error: 'Invalid chunk index' },
        { status: 400 }
      );
    }

    // Find the chunk to delete
    const chunkToDelete = chunks[chunkIndex];
    
    // Remove the chunk
    console.log('Removing chunk at index:', chunkIndex);
    await RagChunk.findByIdAndDelete(chunkToDelete._id);
    
    // Update remaining chunks' sequence numbers if needed
    if (chunkIndex < chunks.length - 1) {
      // Update sequence numbers for chunks after the deleted one
      for (let i = chunkIndex + 1; i < chunks.length; i++) {
        await RagChunk.findByIdAndUpdate(chunks[i]._id, {
          $set: { 'metadata.sequence': i - 1 }
        });
      }
    }
    
    // Update document metadata
    await RagDocument.findByIdAndUpdate(id, {
      $set: {
        'metadata.chunkCount': chunks.length - 1,
        'metadata.lastUpdated': new Date()
      }
    });

    console.log('Successfully removed chunk');
    return NextResponse.json({
      message: 'Chunk deleted successfully',
      chunk_index: chunkIndex
    });

  } catch (error) {
    console.error('Error deleting document chunk:', error);
    return NextResponse.json(
      { 
        error: 'An error occurred while deleting the chunk', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 
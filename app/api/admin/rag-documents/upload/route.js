import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import RagDocument from '@/models/RagDocument';
import RagChunk from '@/models/RagChunk';
import { processDocument } from '@/lib/documentChunker';
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';

export async function POST(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the form data
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

    // Connect to database
    const { conn } = await connectToDatabase();

    // Extract text content based on file type
    let content = '';
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    if (fileType === 'application/pdf') {
      const pdfDoc = await PDFDocument.load(buffer);
      for (const page of pdfDoc.getPages()) {
        content += await page.getText() + '\n';
      }
    } else if (
      fileType === 'text/plain' ||
      fileType === 'text/markdown' ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.mdx') ||
      fileType === 'application/markdown' ||
      fileType === 'text/x-markdown'
    ) {
      content = buffer.toString('utf-8');
    } else if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      content = result.value;
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Process the document into chunks with embeddings
    console.log('Processing document into chunks and generating embeddings...');
    const chunks = await processDocument(content, {
      chunkSize: 1000,
      overlap: 200,
      generateEmbeddings: true
    });
    
    console.log(`Created ${chunks.length} chunks with embeddings`);

    // Create the document first
    const document = await RagDocument.create({
      title,
      content,
      metadata: {
        category,
        tags,
        author: session.user.email,
        chunkCount: chunks.length
      }
    });
    
    // Then store chunks in a separate collection
    console.log('Storing chunks in database...');
    await Promise.all(chunks.map((chunk, index) => {
      return RagChunk.create({
        document_id: document._id,
        content: chunk.content,
        embedding: chunk.embedding,
        metadata: {
          ...chunk.metadata,
          sequence: index
        }
      });
    }));
    
    console.log(`Stored ${chunks.length} chunks in the database`);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
} 
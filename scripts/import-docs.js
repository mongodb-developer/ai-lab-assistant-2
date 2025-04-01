#!/usr/bin/env node

/**
 * Document Import Script for MongoDB AI Lab Assistant
 * 
 * This script recursively scans a directory for Markdown, text, or other document files
 * and imports them into the RAG system by:
 * 1. Creating a RagDocument record for each file
 * 2. Chunking the content with appropriate overlap
 * 3. Generating embeddings for each chunk
 * 4. Storing chunks in the RagChunk collection
 * 
 * Usage: 
 *   node import-docs.js --dir=/path/to/docs --category=Category [--tags=tag1,tag2]
 * 
 * Options:
 *   --dir       Directory path to scan (required)
 *   --category  Category for the documents (required)
 *   --tags      Comma-separated list of tags (optional)
 *   --chunk     Chunk size in characters (default: 1000)
 *   --overlap   Overlap size in characters (default: 200)
 *   --author    Author name for the documents (default: "System Import")
 *   --dryrun    Run without making any changes (default: false)
 */

// Import dependencies
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const { OpenAI } = require('openai');
const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');
const { program } = require('commander');

// Command line options
program
  .requiredOption('--dir <directory>', 'Directory path to scan')
  .requiredOption('--category <category>', 'Category for the documents')
  .option('--tags <tags>', 'Comma-separated list of tags', '')
  .option('--chunk <size>', 'Chunk size in characters', 1000)
  .option('--overlap <size>', 'Overlap size in characters', 200)
  .option('--author <name>', 'Author name for the documents', 'System Import')
  .option('--dryrun', 'Run without making any changes', false)
  .parse(process.argv);

const options = program.opts();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MongoDB connection info
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined');
  process.exit(1);
}

// OpenAI API key check
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is not defined');
  process.exit(1);
}

// Supported file extensions
const SUPPORTED_EXTENSIONS = [
  '.md', '.txt', '.markdown', '.pdf', '.doc', '.docx', '.mdx'
];

// Flag to track if we have at least one failure
let hasErrors = false;

// Main function
async function main() {
  console.log('MongoDB AI Lab Assistant - Document Import Script');
  console.log('===============================================');
  console.log(`Scanning directory: ${options.dir}`);
  console.log(`Category: ${options.category}`);
  console.log(`Tags: ${options.tags}`);
  console.log(`Chunk size: ${options.chunk} characters`);
  console.log(`Overlap: ${options.overlap} characters`);
  console.log(`Author: ${options.author}`);
  console.log(`Dry run: ${options.dryrun ? 'Yes' : 'No'}`);
  console.log('===============================================\n');

  // Validate directory
  if (!fs.existsSync(options.dir)) {
    console.error(`Error: Directory ${options.dir} does not exist`);
    process.exit(1);
  }

  // Connect to MongoDB
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const ragDocumentCollection = db.collection('rag_documents');
    const ragChunkCollection = db.collection('rag_chunks');

    // Scan directory recursively
    const files = findFiles(options.dir);
    console.log(`Found ${files.length} supported files\n`);

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`[${i+1}/${files.length}] Processing: ${file}`);
      
      try {
        await processFile(file, ragDocumentCollection, ragChunkCollection);
      } catch (error) {
        console.error(`  Error processing file: ${error.message}`);
        hasErrors = true;
      }
    }

  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    hasErrors = true;
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }

  if (hasErrors) {
    console.log('\nImport completed with some errors. Check the output above for details.');
    process.exit(1);
  } else {
    console.log('\nImport completed successfully!');
  }
}

/**
 * Recursively find all supported files in a directory
 * @param {string} dir - Directory to scan
 * @param {Array} fileList - Accumulator for files
 * @returns {Array} List of file paths
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * Process a single file
 * @param {string} filePath - Path to the file
 * @param {Collection} ragDocumentCollection - MongoDB collection for documents
 * @param {Collection} ragChunkCollection - MongoDB collection for chunks
 */
async function processFile(filePath, ragDocumentCollection, ragChunkCollection) {
  // Extract file info
  const fileExt = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);
  const relPath = path.relative(options.dir, filePath);
  const dirPath = path.dirname(relPath);
  
  // Use relative path parts as additional tags
  const pathTags = dirPath.split(path.sep)
    .filter(tag => tag && tag !== '.')
    .map(tag => tag.trim());
  
  // Combine with user-provided tags
  const userTags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
  const tags = [...new Set([...userTags, ...pathTags])];
  
  // Use filename as title (without extension)
  const title = path.basename(fileName, fileExt);
  
  console.log(`  Title: ${title}`);
  console.log(`  Category: ${options.category}`);
  console.log(`  Tags: ${tags.join(', ')}`);
  
  // Read and extract content based on file type
  const content = await extractContent(filePath, fileExt);
  console.log(`  Content length: ${content.length} characters`);
  
  if (options.dryrun) {
    console.log('  [DRY RUN] Document would be created');
    return;
  }
  
  // Create document
  const documentId = new ObjectId();
  
  const document = {
    _id: documentId,
    title,
    content,
    metadata: {
      category: options.category,
      tags,
      author: options.author,
      source: relPath,
      lastUpdated: new Date(),
      chunkCount: 0
    },
    created_at: new Date(),
    updated_at: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Create and insert document
  await ragDocumentCollection.insertOne(document);
  console.log(`  Document created with ID: ${documentId}`);
  
  // Process document into chunks with embeddings
  const chunks = await processDocument(content, {
    chunkSize: parseInt(options.chunk),
    overlap: parseInt(options.overlap)
  });
  
  console.log(`  Created ${chunks.length} chunks`);
  
  // Store chunks
  if (chunks.length > 0) {
    const chunkDocuments = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i].content);
      console.log(`  Generated embedding for chunk ${i+1}/${chunks.length}`);
      
      chunkDocuments.push({
        document_id: documentId,
        content: chunks[i].content,
        embedding,
        metadata: {
          startIndex: chunks[i].metadata.startIndex,
          endIndex: chunks[i].metadata.endIndex,
          section: chunks[i].metadata.section,
          sequence: i
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await ragChunkCollection.insertMany(chunkDocuments);
    console.log(`  Stored ${chunkDocuments.length} chunks in database`);
    
    // Update document with chunk count
    await ragDocumentCollection.updateOne(
      { _id: documentId },
      { $set: { 'metadata.chunkCount': chunks.length } }
    );
  }
}

/**
 * Extract content from a file based on its type
 * @param {string} filePath - Path to the file
 * @param {string} fileExt - File extension
 * @returns {Promise<string>} Extracted content
 */
async function extractContent(filePath, fileExt) {
  const buffer = fs.readFileSync(filePath);
  
  switch (fileExt.toLowerCase()) {
    case '.pdf':
      const pdfDoc = await PDFDocument.load(buffer);
      let pdfText = '';
      for (const page of pdfDoc.getPages()) {
        pdfText += await page.getText() + '\n';
      }
      return pdfText;
      
    case '.docx':
    case '.doc':
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
      
    case '.md':
    case '.markdown':
    case '.txt':
    default:
      return buffer.toString('utf-8');
  }
}

/**
 * Process document content into chunks
 * @param {string} content - Document content
 * @param {Object} options - Chunking options
 * @returns {Promise<Array>} Array of chunks with metadata
 */
async function processDocument(content, options = {}) {
  const {
    chunkSize = 1000,
    overlap = 200
  } = options;

  const chunks = [];
  let startIndex = 0;

  while (startIndex < content.length) {
    // Calculate the end index for this chunk
    let endIndex = startIndex + chunkSize;
    
    // If this isn't the last chunk, try to find a good break point
    if (endIndex < content.length) {
      // Look for the last period, question mark, or exclamation point
      const searchArea = content.slice(endIndex - overlap, endIndex);
      const lastSentenceEnd = Math.max(
        searchArea.lastIndexOf('. '),
        searchArea.lastIndexOf('? '),
        searchArea.lastIndexOf('! ')
      );

      if (lastSentenceEnd !== -1) {
        endIndex = endIndex - overlap + lastSentenceEnd + 1;
      }
    } else {
      endIndex = content.length;
    }

    // Extract the chunk content
    const chunkContent = content.slice(startIndex, endIndex).trim();

    // Only add non-empty chunks
    if (chunkContent) {
      chunks.push({
        content: chunkContent,
        metadata: {
          startIndex,
          endIndex,
          section: `Chunk ${chunks.length + 1}`
        }
      });
    }

    // Move to the next chunk, accounting for overlap
    startIndex = endIndex - (endIndex < content.length ? overlap : 0);
  }

  return chunks;
}

/**
 * Generate embedding for text using OpenAI API
 * @param {string} text - Text to encode
 * @returns {Promise<Array<number>>} Embedding vector
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error(`Error generating embedding: ${error.message}`);
    throw error;
  }
}

// Execute main function
main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
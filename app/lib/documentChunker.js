import { generateEmbedding } from './embeddings';

// Regular expressions for section detection
const SECTION_PATTERNS = [
  // Headers (Markdown/HTML style)
  /^#{1,6}\s+(.+)$/m,
  /^<h[1-6]>(.+)<\/h[1-6]>$/m,
  
  // Common section indicators
  /^(Chapter|Section|Part)\s+[\d.]+:?\s*(.+)$/i,
  
  // Numbered sections
  /^[\d.]+\s+(.+)$/m,
  
  // Uppercase lines (potential section headers)
  /^[A-Z][A-Z\s]{3,}[A-Z]$/m
];

// Configuration
const DEFAULT_CHUNK_SIZE = 1000; // characters
const MIN_CHUNK_SIZE = 100;
const OVERLAP_SIZE = 100;

/**
 * Detects section boundaries in text content
 * @param {string} content - The document content
 * @returns {Array<{start: number, end: number, title: string}>} - Array of section boundaries
 */
const detectSections = (content) => {
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;

  lines.forEach((line, index) => {
    // Check if line matches any section pattern
    for (const pattern of SECTION_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        // Close previous section if exists
        if (currentSection) {
          currentSection.end = index - 1;
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          start: index,
          title: match[1] || match[2] || match[0].trim(),
          end: lines.length - 1 // Will be updated when next section is found
        };
        break;
      }
    }
  });

  // Add final section if exists
  if (currentSection) {
    sections.push(currentSection);
  }

  // If no sections detected, create a single section
  if (sections.length === 0) {
    sections.push({
      start: 0,
      end: lines.length - 1,
      title: 'Main Content'
    });
  }

  return sections;
};

/**
 * Creates chunks from a section of text
 * @param {string} text - The section text
 * @param {string} sectionTitle - The section title
 * @returns {Promise<Array>} - Array of chunks with embeddings
 */
const createChunksFromSection = async (text, sectionTitle) => {
  const chunks = [];
  let startChar = 0;

  while (startChar < text.length) {
    // Determine chunk size
    let endChar = startChar + DEFAULT_CHUNK_SIZE;
    
    // If we're near the end, just include the rest
    if (endChar >= text.length) {
      endChar = text.length;
    } else {
      // Try to find a natural break point (sentence or paragraph)
      const nextBreak = text.slice(endChar - 50, endChar + 50)
        .search(/[.!?]\s+|\n\n/);
      
      if (nextBreak !== -1) {
        endChar = endChar - 50 + nextBreak + 1;
      }
    }

    // Extract chunk content
    const chunkContent = text.slice(startChar, endChar).trim();

    // Only create chunk if it meets minimum size
    if (chunkContent.length >= MIN_CHUNK_SIZE) {
      // Generate embedding for the chunk
      const embedding = await generateEmbedding(chunkContent);

      chunks.push({
        content: chunkContent,
        embedding,
        metadata: {
          section: sectionTitle,
          startIndex: startChar,
          endIndex: endChar
        }
      });
    }

    // Move to next chunk, accounting for overlap
    startChar = endChar - OVERLAP_SIZE;
  }

  return chunks;
};

/**
 * Process a document into chunks
 * @param {string} content - The document content to chunk
 * @param {Object} options - Chunking options
 * @param {number} options.chunkSize - The size of each chunk (default: 1000)
 * @param {number} options.overlap - The overlap between chunks (default: 200)
 * @param {boolean} options.generateEmbeddings - Whether to generate embeddings (default: true)
 * @returns {Promise<Array>} An array of chunks with their metadata and embeddings
 */
export async function processDocument(content, options = {}) {
  const {
    chunkSize = 1000,
    overlap = 200,
    generateEmbeddings = true
  } = options;

  const chunks = [];
  let startIndex = 0;

  while (startIndex < content.length) {
    // Calculate the end index for this chunk
    let endIndex = startIndex + chunkSize;
    
    // If this isn't the last chunk, try to find a good break point
    if (endIndex < content.length) {
      // Look for the last period, question mark, or exclamation point within the overlap window
      const searchArea = content.slice(endIndex - overlap, endIndex);
      const lastSentenceEnd = Math.max(
        searchArea.lastIndexOf('.'),
        searchArea.lastIndexOf('?'),
        searchArea.lastIndexOf('!')
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
      const chunk = {
        content: chunkContent,
        metadata: {
          startIndex,
          endIndex,
          section: `Chunk ${chunks.length + 1}`
        }
      };
      
      // Generate embedding if requested
      if (generateEmbeddings) {
        try {
          const embedding = await generateEmbedding(chunkContent);
          chunk.embedding = embedding;
        } catch (error) {
          console.error(`Error generating embedding for chunk ${chunks.length + 1}:`, error);
          // Continue without embedding if there's an error
        }
      }
      
      chunks.push(chunk);
    }

    // Move to the next chunk, accounting for overlap
    startIndex = endIndex - (endIndex < content.length ? overlap : 0);
  }

  return chunks;
}

/**
 * Validates document input
 * @param {Object} data - The document data
 * @returns {Object} - Validation result
 */
export function validateDocument(data) {
  if (!data.title || typeof data.title !== 'string') {
    return { success: false, error: 'Title is required and must be a string' };
  }

  if (!data.content || typeof data.content !== 'string') {
    return { success: false, error: 'Content is required and must be a string' };
  }

  if (data.category && typeof data.category !== 'string') {
    return { success: false, error: 'Category must be a string' };
  }

  if (data.tags && !Array.isArray(data.tags)) {
    return { success: false, error: 'Tags must be an array' };
  }

  return { success: true };
} 
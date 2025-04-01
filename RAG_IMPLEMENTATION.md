# RAG Implementation Plan

## Overview
This document outlines the plan for implementing an enhanced RAG (Retrieval Augmented Generation) system in the MongoDB AI Lab Assistant. The current system uses vector search to find similar questions and falls back to LLM responses for new questions. This enhancement will implement a more traditional RAG setup where documents from a dedicated collection are used to provide context for LLM responses.

## Current System
- User asks a question
- System encodes question and uses vector search to find similar questions
- If similar question found: return stored answer
- If no match: store in unanswered_questions and query LLM directly

## Enhanced System
- Maintain current question matching functionality
- Add RAG document collection for knowledge base
- Implement admin interface for document management
- Use retrieved documents as context for LLM responses

## Implementation Plan

### 1. Database Schema Updates

#### 1.1 RAG Documents Collection
```javascript
{
  title: String,
  content: String,
  chunks: [{
    content: String,
    embedding: [Number],
    metadata: {
      startIndex: Number,
      endIndex: Number,
      section: String
    }
  }],
  metadata: {
    category: String,
    tags: [String],
    author: String,
    lastUpdated: Date
  },
  created_at: Date,
  updated_at: Date
}
```

#### 1.2 RAG Queries Collection
```javascript
{
  question: String,
  question_embedding: [Number],
  retrieved_chunks: [{
    document_id: ObjectId,
    chunk_index: Number,
    relevance_score: Number
  }],
  response: String,
  created_at: Date
}
```

### 2. Admin Interface Components

#### 2.1 New Pages
- `/app/admin/rag-documents/page.js` - Document management
- `/app/admin/rag-documents/[id]/page.js` - Individual document view/edit
- `/app/admin/rag-documents/upload/page.js` - Document upload interface

#### 2.2 New Components
- `DocumentUploader.js` - Handles markdown file uploads
- `DocumentChunker.js` - Displays and manages document chunks
- `DocumentList.js` - Lists all RAG documents with search/filter
- `ChunkPreview.js` - Shows chunk content and embedding info

### 3. Backend API Routes

#### 3.1 New API Routes
- `/api/admin/rag-documents/route.js` - CRUD operations for RAG documents
- `/api/admin/rag-documents/upload/route.js` - Handles document uploads
- `/api/admin/rag-documents/[id]/chunks/route.js` - Manages document chunks

#### 3.2 Utility Functions
- `documentChunker.js` - Splits documents into chunks
- `chunkEmbedder.js` - Generates embeddings for chunks
- `ragSearch.js` - Performs vector search on chunks

### 4. RAG Integration

#### 4.1 Question Processing Flow Updates
- Modify `questionService.js` to include RAG search
- Add chunk retrieval and context building
- Enhance LLM prompt with retrieved context

#### 4.2 New Utility Functions
- `contextBuilder.js` - Builds context from retrieved chunks
- `promptBuilder.js` - Constructs enhanced prompts with context

## Implementation Checklist

### Phase 1: Database Setup
- [ ] Create new MongoDB collections
- [ ] Set up vector search indexes
- [ ] Create Mongoose schemas
- [ ] Add database utility functions

### Phase 2: Admin Interface
- [ ] Create document management pages
- [ ] Implement document upload component
- [ ] Build document list view
- [ ] Add chunk management interface
- [ ] Implement document editing

### Phase 3: Backend API
- [ ] Create document upload endpoint
- [ ] Implement document CRUD operations
- [ ] Add chunk management endpoints
- [ ] Create vector search utilities
- [ ] Add document processing pipeline

### Phase 4: RAG Integration
- [ ] Modify question processing flow
- [ ] Implement chunk retrieval
- [ ] Add context building
- [ ] Enhance LLM prompts
- [ ] Add response tracking

### Phase 5: Testing & Optimization
- [ ] Add unit tests
- [ ] Implement integration tests
- [ ] Add performance monitoring
- [ ] Optimize chunk sizes
- [ ] Fine-tune similarity thresholds

## Technical Considerations

### 1. Chunking Strategy
- Use overlap between chunks for better context
- Maintain semantic boundaries
- Keep chunks within token limits

### 2. Vector Search
- Use MongoDB Atlas Vector Search
- Implement hybrid search (vector + text)
- Add relevance scoring

### 3. Performance
- Cache embeddings
- Batch process documents
- Implement pagination for large documents

### 4. Security
- Validate file uploads
- Implement rate limiting
- Add access control

### 5. Authentication Implementation
#### 5.1 Auth Configuration (`app/lib/auth.js`)
```javascript
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Development admin user
        if (credentials.email === 'admin@example.com' && 
            credentials.password === 'admin123') {
          return {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            isAdmin: true
          };
        }
        // Add production auth logic here
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
}
```

#### 5.2 Required Environment Variables
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

#### 5.3 Development Credentials
```
Email: admin@example.com
Password: admin123
```

#### 5.4 Auth Implementation Notes
- JWT-based authentication
- Admin role checking in protected routes
- Custom sign-in page support
- Session persistence
- Production-ready structure (needs real user database integration)

## Next Steps
1. Review and approve implementation plan
2. Set up development environment
3. Begin with Phase 1: Database Setup
4. Regular progress reviews and adjustments

## Notes
- Keep existing question matching functionality
- Ensure backward compatibility
- Document all new features and APIs
- Maintain consistent code style and patterns
- Implement proper security measures for admin routes
- Add proper error handling and logging
# MongoDB AI Lab Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org)
[![Next.js Version](https://img.shields.io/badge/next.js-14.1.0-black)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![GitHub issues](https://img.shields.io/github/issues/mongodb-developer/ai-lab-assistant-2)](https://github.com/mongodb-developer/ai-lab-assistant-2/issues)
[![GitHub stars](https://img.shields.io/github/stars/mongodb-developer/ai-lab-assistant-2)](https://github.com/mongodb-developer/ai-lab-assistant-2/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/mongodb-developer/ai-lab-assistant-2)](https://github.com/mongodb-developer/ai-lab-assistant-2/commits/main)

![AI LAB Assistant](/public/mascot-banner.png)

This AI Lab Assistant is specifically designed to support MongoDB Developer Days workshops. It's a Next.js application that provides AI-powered assistance for MongoDB questions and design reviews, featuring Retrieval-Augmented Generation (RAG) for accurate, context-aware responses. The assistant helps workshop participants by providing contextual help and guidance for various MongoDB workshops and labs.

## Related MongoDB Developer Days Workshops

This AI Lab Assistant supports the following workshops:

- [Introduction to MongoDB](https://mongodb-developer.github.io/intro-lab/) - Get started with MongoDB basics
- [Building AI Applications with RAG](https://mongodb-developer.github.io/ai-rag-lab/) - Learn how to build AI applications using RAG architecture
- [Atlas Search](https://mongodb-developer.github.io/search-lab/) - Master MongoDB Atlas Search capabilities
- [Atlas Vector Search](https://mongodb-developer.github.io/vector-search-lab/) - Deep dive into vector search implementation
- [SQL to MongoDB Query API](https://mongodb-developer.github.io/sql-to-query-api-lab) - Learn how to transition from SQL to MongoDB queries

## What is RAG?

Retrieval-Augmented Generation (RAG) is an AI architecture that enhances Large Language Models (LLMs) by providing them with relevant context from a curated knowledge base. Here's how our implementation works:

1. **Document Processing**: Documents are split into chunks and converted into vector embeddings using OpenAI's embedding model
2. **Vector Search**: When a question is asked, we find the most relevant document chunks using MongoDB Atlas Vector Search
3. **Context-Enhanced Generation**: The relevant context is provided to the LLM along with the user's question to generate accurate, contextual responses

## Features

- **AI-powered Q&A with RAG**:
  - Vector search for accurate information retrieval
  - Support for multiple document formats (PDF, Markdown, Word)
  - Real-time document processing and embedding generation
- **Design Review System**:
  - Submit architecture designs for AI-powered review
  - Get detailed feedback and recommendations
- **Admin Dashboard**:
  - Upload and manage RAG documents
  - Monitor user questions and feedback
  - Manage design review submissions
- **User Authentication**: Secure access with Google OAuth
- **Modern UI**: Built with Material UI design system

## Tech Stack

- **Frontend**: React.js with Next.js App Router
- **UI Library**: Material UI
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Atlas Vector Search
- **AI Integration**: 
  - OpenAI API for embeddings and chat completion
  - Vector search for semantic document retrieval
- **Document Processing**:
  - PDF parsing with pdf-lib
  - Word document processing with mammoth
  - Markdown support
- **Deployment**: Vercel

## Building Your Own RAG Chatbot

### 1. Set Up MongoDB Atlas

1. Create a MongoDB Atlas cluster
2. Enable Atlas Vector Search
3. Create a vector search index on your documents collection

### 2. Document Processing

Check out `scripts/import-docs.js` for our document processing pipeline:
```javascript
// Example document processing
const chunks = await processDocument(content, {
  chunkSize: 1000,
  overlap: 200,
  generateEmbeddings: true
});
```

### 3. Vector Search Implementation

See `lib/vectorSearch.js` for vector search implementation:
```javascript
// Example vector search query
const results = await collection.aggregate([
  {
    $vectorSearch: {
      index: "default",
      path: "embedding",
      queryVector: embedding,
      numCandidates: 100,
      limit: 5
    }
  }
]);
```

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB Atlas account with Vector Search enabled
- OpenAI API key
- Google OAuth credentials

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/mongodb-ai-lab-assistant.git
cd mongodb-ai-lab-assistant
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration values
```

Required environment variables:
```
MONGODB_URI=your_mongodb_uri
OPENAI_API_KEY=your_openai_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Admin Authentication
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_secure_password
```

### Authentication and Admin Access

The application implements a secure authentication system:

1. **Admin Authentication**: 
   - Admin routes under `/admin/*` are protected by middleware and server-side checks
   - Only users who sign in with the credentials matching `ADMIN_EMAIL` and `ADMIN_PASSWORD` can access the admin area
   - Double protection: middleware checks the JWT token, and server-side checks occur in the admin layout

2. **Authentication Flow**:
   - Users attempt to access admin routes
   - If not authenticated, they're redirected to the sign-in page
   - After successful authentication with admin credentials, they receive a JWT token with `isAdmin: true`
   - The token is verified on subsequent requests

3. **Environment Variables for Auth**:
   - `NEXTAUTH_SECRET`: Required for secure JWT encryption
   - `NEXTAUTH_URL`: Your application's base URL
   - `ADMIN_EMAIL`: Email for admin access
   - `ADMIN_PASSWORD`: Password for admin access

When deploying to Vercel, ensure all these environment variables are properly configured in your Vercel project settings.

4. Run the development server
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Developer Days Resources

This project was created for MongoDB Developer Days to demonstrate:
- Building intelligent chatbots with MongoDB
- Implementing RAG architecture
- Using Atlas Vector Search
- Creating secure, scalable Next.js applications

For more resources:
- [MongoDB Developer Center](https://www.mongodb.com/developer/)
- [Atlas Vector Search Documentation](https://www.mongodb.com/docs/atlas/atlas-search/)
- [Next.js Documentation](https://nextjs.org/docs)

## Deployment on Vercel

1. Create a Vercel account if you don't have one
2. Install the Vercel CLI
```bash
npm install -g vercel
```

3. Deploy to Vercel
```bash
vercel
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

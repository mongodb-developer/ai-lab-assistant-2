#!/bin/bash

# Create the base directory structure
mkdir -p app/api/auth
mkdir -p app/api/chat
mkdir -p app/api/admin
mkdir -p app/api/design-review
mkdir -p app/\(auth\)/login
mkdir -p app/\(auth\)/profile
mkdir -p app/admin/questions
mkdir -p app/admin/users
mkdir -p app/admin/statistics
mkdir -p app/admin/design-reviews
mkdir -p app/chat
mkdir -p app/about
mkdir -p app/design-review
mkdir -p app/components/ui
mkdir -p app/components/layout
mkdir -p app/components/chat
mkdir -p app/components/admin
mkdir -p app/lib
mkdir -p app/hooks
mkdir -p app/context
mkdir -p app/public
mkdir -p app/theme

# Create API routes
cat > app/api/auth/\[...nextauth\]/route.js << 'EOL'
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.isAdmin = user.isAdmin || false;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin || false;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
EOL

cat > app/api/chat/route.js << 'EOL'
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { generateEmbedding, searchSimilarQuestions, generatePotentialAnswer } from '@/lib/openai';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question, module, force_new_conversation } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);
    
    // Search for similar questions
    const similarQuestions = await searchSimilarQuestions(db, questionEmbedding, question, module);
    
    let response;
    
    if (similarQuestions && similarQuestions.length > 0) {
      const bestMatch = similarQuestions[0];
      response = {
        question: bestMatch.question,
        answer: bestMatch.answer,
        score: bestMatch.combined_score,
        title: bestMatch.title || '',
        summary: bestMatch.summary || '',
        references: bestMatch.references || '',
        source: 'database',
        match_score: bestMatch.combined_score,
      };
    } else {
      // Generate a new answer
      const answer = await generatePotentialAnswer(question);
      response = {
        question,
        answer: answer.answer,
        title: answer.title || '',
        summary: answer.summary || '',
        references: answer.references || '',
        source: 'LLM',
      };
      
      // Store the unanswered question
      await db.collection('unanswered_questions').insertOne({
        user_id: session.user.id,
        user_name: session.user.name,
        question,
        timestamp: new Date(),
        answered: false,
        module,
        ...answer
      });
    }
    
    // Store the conversation
    const conversationId = await storeConversation(db, session.user.id, question, response.answer);
    response.conversation_id = conversationId;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

async function storeConversation(db, userId, question, answer) {
  // Get active conversation or create a new one
  let conversation = await db.collection('conversations').findOne({
    user_id: userId,
    status: 'active'
  });
  
  if (!conversation) {
    const result = await db.collection('conversations').insertOne({
      user_id: userId,
      status: 'active',
      created_at: new Date(),
      last_updated: new Date(),
      messages: []
    });
    conversation = { _id: result.insertedId, messages: [] };
  }
  
  // Add messages to the conversation
  await db.collection('conversations').updateOne(
    { _id: conversation._id },
    { 
      $push: { 
        messages: [
          { role: 'user', content: question, timestamp: new Date() },
          { role: 'assistant', content: answer, timestamp: new Date() }
        ]
      },
      $set: { last_updated: new Date() }
    }
  );
  
  return conversation._id.toString();
}
EOL

cat > app/api/admin/questions/route.js << 'EOL'
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { generateEmbedding } from '@/lib/openai';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const total = await db.collection('documents').countDocuments({});
    const questions = await db.collection('documents')
      .find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray();
    
    return NextResponse.json({
      questions: questions.map(q => ({...q, _id: q._id.toString()})),
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage)
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    if (!data || !data.question || !data.answer) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { question, answer, title, summary, references } = data;
    
    // Generate embeddings
    const questionEmbedding = await generateEmbedding(question);
    const answerEmbedding = await generateEmbedding(answer);
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const document = {
      question,
      answer,
      title: title || '',
      summary: summary || '',
      references: references || '',
      question_embedding: questionEmbedding,
      answer_embedding: answerEmbedding,
      created_at: new Date(),
      updated_at: new Date(),
      schema_version: 2,
      created_by: 'admin'
    };
    
    const result = await db.collection('documents').insertOne(document);
    
    return NextResponse.json({
      message: 'Question added successfully',
      question_id: result.insertedId.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding question:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}
EOL

cat > app/api/admin/users/route.js << 'EOL'
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const users = await db.collection('users').find({}).toArray();
    
    // Convert ObjectIds to strings for JSON serialization
    const serializedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString(),
      last_login: user.last_login ? user.last_login.toISOString() : null
    }));
    
    return NextResponse.json(serializedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id, ...data } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}
EOL

# Create library utility files
cat > app/lib/mongodb.js << 'EOL'
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
EOL

cat > app/lib/openai.js << 'EOL'
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function searchSimilarQuestions(db, questionEmbedding, queryText, module) {
  const similarityThreshold = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.8');
  
  // Vector search pipeline
  const vectorSearchPipeline = [
    {
      '$vectorSearch': {
        'index': 'question_index',
        'path': 'question_embedding',
        'queryVector': questionEmbedding,
        'numCandidates': 100,
        'limit': 10
      }
    },
    {
      '$project': {
        'question': 1,
        'answer': 1,
        'title': 1,
        'summary': 1,
        'references': 1,
        'module': 1,
        'vector_score': {'$meta': 'vectorSearchScore'},
      }
    }
  ];

  // Text search pipeline
  const textSearchPipeline = [
    {
      '$search': {
        'index': 'default',
        'text': {
          'query': queryText.toLowerCase(),
          'path': ['question', 'answer', 'title'],
          'fuzzy': {'maxEdits': 2}
        }
      }
    },
    {
      '$project': {
        'question': 1,
        'answer': 1,
        'title': 1,
        'summary': 1,
        'references': 1,
        'module': 1,
        'text_score': {'$meta': 'searchScore'},
      }
    }
  ];

  // Apply module filter if specified
  if (module && module.toLowerCase() !== "select a module") {
    const moduleFilter = {'$match': {'module': module}};
    vectorSearchPipeline.splice(1, 0, moduleFilter);
    textSearchPipeline.splice(1, 0, moduleFilter);
  }

  const vectorResults = await db.collection('documents').aggregate(vectorSearchPipeline).toArray();
  const textResults = await db.collection('documents').aggregate(textSearchPipeline).toArray();

  // Combine and process results
  const allResults = [...vectorResults, ...textResults];
  
  for (const result of allResults) {
    result.combined_score = (result.vector_score || 0) * 0.7 + (result.text_score || 0) * 0.3;
    // Convert ObjectId to string
    result._id = result._id.toString();
  }

  // Remove duplicates and sort
  const seen = new Set();
  const uniqueResults = [];
  
  for (const result of allResults.sort((a, b) => b.combined_score - a.combined_score)) {
    const questionLower = result.question.toLowerCase();
    if (!seen.has(questionLower)) {
      seen.add(questionLower);
      uniqueResults.push(result);
    }
  }

  // Filter results by similarity threshold
  return uniqueResults
    .filter(r => r.combined_score >= similarityThreshold)
    .slice(0, 5);
}

export async function generatePotentialAnswer(question) {
  try {
    const context = "Context: MongoDB Developer Days, MongoDB Atlas, MongoDB Aggregation Pipelines, and MongoDB Atlas Search";
    const prompt = `${context}\n\nPlease provide a detailed answer for the following question related to MongoDB:\n\n${question}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an assistant that provides detailed answers about MongoDB, focusing on accuracy and clarity."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const answer = response.choices[0].message.content.trim();
    
    // Generate title
    const titleResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an assistant that provides concise and descriptive titles."
        },
        {
          role: "user",
          content: `${context}\n\nPlease provide a concise and descriptive title for the following answer:\n\n${answer}`
        }
      ]
    });
    const title = titleResponse.choices[0].message.content.trim();
    
    // Generate summary
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an assistant that provides summaries."
        },
        {
          role: "user",
          content: `${context}\n\nPlease summarize the following text:\n\n${answer}`
        }
      ]
    });
    const summary = summaryResponse.choices[0].message.content.trim();
    
    // Generate references
    const referencesResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an assistant that provides relevant references."
        },
        {
          role: "user",
          content: `${context}\n\nPlease provide relevant references for the following answer from the MongoDB documentation:\n\n${answer}`
        }
      ]
    });
    const references = referencesResponse.choices[0].message.content.trim() || "No specific references provided. Please refer to the MongoDB Documentation at https://www.mongodb.com/docs/";
    
    return {
      answer,
      title,
      summary,
      references
    };
  } catch (error) {
    console.error('Error generating potential answer:', error);
    throw error;
  }
}
EOL

cat > app/lib/auth.js << 'EOL'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (!session.user.isAdmin) {
    redirect("/");
  }
  return session;
}
EOL

# Create Chat components
cat > app/components/chat/ChatInterface.js << 'EOL'
import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Paper, Typography, CircularProgress, Autocomplete } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MessageList from './MessageList';
import SampleQuestions from './SampleQuestions';
import ModuleSelect from './ModuleSelect';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showSamples, setShowSamples] = useState(true);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setShowSamples(false);
    setIsLoading(true);
    
    // Add user message to the chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: userMessage,
          module: selectedModule?.value || '',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Add assistant message to the chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer,
        metadata: {
          title: data.title,
          summary: data.summary,
          references: data.references,
          source: data.source,
        }
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.',
        error: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSampleQuestionClick = (question) => {
    setInput(question);
    handleSubmit({ preventDefault: () => {} });
  };
  
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', pt: 8, pb: 2 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          mx: 2, 
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {showSamples ? (
            <SampleQuestions onQuestionClick={handleSampleQuestionClick} />
          ) : (
            <MessageList messages={messages} />
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex', 
            gap: 1 
          }}
        >
          <ModuleSelect 
            value={selectedModule}
            onChange={(event, newValue) => setSelectedModule(newValue)}
          />
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            size="medium"
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={isLoading || !input.trim()} 
            endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
EOL

cat > app/components/chat/MessageList.js << 'EOL'
import { Box, Paper, Typography, Divider } from '@mui/material';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
import { useTheme } from '@mui/material/styles';

export default function MessageList({ messages }) {
  const theme = useTheme();
  
  if (!messages || messages.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body1" color="text.secondary">
          No messages yet. Start a conversation!
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {messages.map((message, index) => (
        <Paper
          key={index}
          elevation={1}
          sx={{
            p: 2,
            maxWidth: '90%',
            alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: message.role === 'user' 
              ? theme.palette.primary.light 
              : message.error 
                ? theme.palette.error.light 
                : theme.palette.background.paper,
            color: message.role === 'user' 
              ? theme.palette.primary.contrastText 
              : message.error 
                ? theme.palette.error.contrastText 
                : theme.palette.text.primary,
            position: 'relative',
            borderRadius: 2,
          }}
        >
          {message.role === 'assistant' && message.metadata?.title && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {message.metadata.title}
              </Typography>
              <Divider sx={{ my: 1 }} />
            </>
          )}
          
          <Typography 
            component="div"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(marked.parse(message.content))
            }}
          />
          
          {message.role === 'assistant' && message.metadata?.references && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                <strong>References:</strong>
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                component="div"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(marked.parse(message.metadata.references))
                }}
                sx={{ fontSize: '0.8rem' }}
              />
            </>
          )}
          
          {message.role === 'assistant' && message.metadata?.source && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Source: {message.metadata.source}
            </Typography>
          )}
        </Paper>
      ))}
    </Box>
  );
}
EOL

cat > app/components/chat/SampleQuestions.js << 'EOL'
import { Box, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import FolderIcon from '@mui/icons-material/Folder';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import CodeIcon from '@mui/icons-material/Code';

const sampleQuestions = [
  {
    category: 'System Workflow',
    icon: <AutoGraphIcon />,
    question: 'How does the chat system process my questions?',
    buttonText: 'Show me the workflow'
  },
  {
    category: 'Data Modeling',
    icon: <StorageIcon />,
    question: "What's the best way to model a one-to-many relationship in MongoDB?",
    buttonText: 'Ask this question'
  },
  {
    category: 'Aggregation Framework',
    icon: <CodeIcon />,
    question: 'Can you explain the $lookup stage in aggregation pipelines?',
    buttonText: 'Ask this question'
  },
  {
    category: 'Atlas Search',
    icon: <SearchIcon />,
    question: 'How do I create a text index for full-text search in Atlas?',
    buttonText: 'Ask this question'
  },
  {
    category: 'Atlas Vector Search',
    icon: <AutoGraphIcon />,
    question: 'What are the steps to implement semantic search using Atlas Vector Search?',
    buttonText: 'Ask this question'
  },
  {
    category: 'Command Help',
    icon: <FolderIcon />,
    question: 'Get help with your workshop setup using \'/\' commands...',
    buttonText: 'Help'
  }
];

export default function SampleQuestions({ onQuestionClick }) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        Sample Questions to Get Started
      </Typography>
      
      <Grid container spacing={3}>
        {sampleQuestions.map((sample, index) => (
          <Grid item xs={12} sm={6} md={4} key={

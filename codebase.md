# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

# app/(auth)/login/page.js

```js
'use client';

import { useEffect } from 'react';
import { Container, Box, Button, Typography, Paper, Divider } from '@mui/material';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GoogleIcon from '@mui/icons-material/Google';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'authenticated') {
    return null;
  }
  
  return (
    <Container maxWidth="sm" sx={{ mt: 12, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Welcome to MongoDB AI Lab Assistant
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please sign in to continue
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Sign in with Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

```

# app/(auth)/profile/page.js

```js
'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Divider, Grid, Chip, CircularProgress, Tab, Tabs } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [designReviews, setDesignReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    if (status === 'authenticated') {
      fetchDesignReviews();
    }
  }, [status, router]);
  
  const fetchDesignReviews = async () => {
    try {
      const response = await fetch('/api/design-review');
      if (response.ok) {
        const data = await response.json();
        setDesignReviews(data);
      }
    } catch (error) {
      console.error('Error fetching design reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return null;
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ ml: 2 }}>
            <Typography variant="h4" gutterBottom>
              {session.user.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {session.user.email}
            </Typography>
            {session.user.isAdmin && (
              <Chip 
                label="Admin" 
                color="primary" 
                size="small" 
                sx={{ mt: 1 }} 
              />
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="profile tabs"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Design Reviews" />
              <Tab label="Chat History" />
              <Tab label="Account Settings" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : designReviews.length > 0 ? (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {designReviews.map((review) => (
                  <Grid item xs={12} key={review._id}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        borderLeft: '4px solid', 
                        borderColor: 
                          review.status === 'completed' ? 'success.main' : 
                          review.status === 'in_progress' ? 'info.main' : 
                          'warning.main' 
                      }}
                    >
                      <Typography variant="h6">{review.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Submitted on {new Date(review.created_at).toLocaleDateString()}
                      </Typography>
                      <Chip 
                        label={review.status.replace('_', ' ')} 
                        color={
                          review.status === 'completed' ? 'success' : 
                          review.status === 'in_progress' ? 'info' : 
                          'warning'
                        }
                        size="small"
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  You haven't submitted any design reviews yet.
                </Typography>
              </Box>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Chat history feature coming soon.
              </Typography>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Account settings feature coming soon.
              </Typography>
            </Box>
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

```

# app/admin/page.js

```js
'use client';

import { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AdminMenu from '@/components/admin/AdminMenu';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    unansweredQuestions: 0,
    designReviews: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated' && !session.user.isAdmin) {
      router.push('/');
      return;
    }
    
    if (status === 'authenticated' && session.user.isAdmin) {
      fetchStats();
    }
  }, [status, session, router]);
  
  const fetchStats = async () => {
    try {
      // This would be an actual API call in a real application
      // Mock data for now
      setTimeout(() => {
        setStats({
          totalQuestions: 248,
          totalUsers: 56,
          unansweredQuestions: 12,
          designReviews: 8
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };
  
  if (status === 'loading' || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!session || !session.user.isAdmin) {
    return null;
  }
  
  return (
    <Container maxWidth="xl" sx={{ mt: 12, mb: 6 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <AdminMenu />
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h4" color="primary" gutterBottom>
              Admin Dashboard
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <QuestionAnswerIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">{stats.totalQuestions}</Typography>
                    <Typography variant="body2">Total Questions</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">{stats.totalUsers}</Typography>
                    <Typography variant="body2">Registered Users</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <QuestionAnswerIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">{stats.unansweredQuestions}</Typography>
                    <Typography variant="body2">Unanswered</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <DesignServicesIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">{stats.designReviews}</Typography>
                    <Typography variant="body2">Design Reviews</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Recent Activity" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="New question submitted" 
                          secondary="How do I set up an Atlas Vector Search index?" 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Design review requested" 
                          secondary="Multi-tenant SaaS application schema design" 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="New user registered" 
                          secondary="john.doe@example.com" 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Popular Questions" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="What's the best way to model one-to-many relationships?" 
                          secondary="50 occurrences" 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="How do I set up MongoDB Atlas Search?" 
                          secondary="42 occurrences" 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="What are the benefits of using MongoDB Atlas?" 
                          secondary="38 occurrences" 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

```

# app/api/design-review/route.js

```js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, requirements, attachmentUrls } = await request.json();
    
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const designReview = {
      title,
      description,
      requirements: requirements || '',
      attachment_urls: attachmentUrls || [],
      status: 'pending',
      user_id: session.user.id,
      user_name: session.user.name,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('design_reviews').insertOne(designReview);
    
    return NextResponse.json({
      message: 'Design review request submitted successfully',
      request_id: result.insertedId.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting design review:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    let query = {};
    
    // If not admin, only show user's own requests
    if (!session.user.isAdmin) {
      query.user_id = session.user.id;
    }
    
    const designReviews = await db.collection('design_reviews')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    // Convert ObjectIds to strings for JSON serialization
    const serializedReviews = designReviews.map(review => ({
      ...review,
      _id: review._id.toString(),
      created_at: review.created_at.toISOString(),
      updated_at: review.updated_at.toISOString()
    }));
    
    return NextResponse.json(serializedReviews);
  } catch (error) {
    console.error('Error fetching design reviews:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

```

# app/chat/page.js

```js
'use client';

import { useEffect } from 'react';
import { Container } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return null;
  }
  
  return (
    <Container maxWidth="xl" disableGutters sx={{ height: '100vh' }}>
      <ChatInterface />
    </Container>
  );
}

```

# app/components/admin/AdminMenu.js

```js
'use client';

import { useState } from 'react';
import { 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton, 
  Collapse, 
  Divider,
  Typography
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PeopleIcon from '@mui/icons-material/People';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminMenu() {
  const pathname = usePathname();
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  
  const handleQuestionsClick = () => {
    setQuestionsOpen(!questionsOpen);
  };
  
  const handleUsersClick = () => {
    setUsersOpen(!usersOpen);
  };
  
  return (
    <Paper elevation={2} sx={{ borderRadius: 2 }}>
      <List component="nav" aria-label="admin navigation">
        <Typography 
          variant="h6" 
          sx={{ 
            py: 2, 
            px: 3, 
            borderBottom: '1px solid', 
            borderColor: 'divider', 
            color: 'primary.main' 
          }}
        >
          Admin Panel
        </Typography>
        
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            href="/admin" 
            selected={pathname === '/admin'}
          >
            <ListItemIcon>
              <DashboardIcon color={pathname === '/admin' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton onClick={handleQuestionsClick}>
            <ListItemIcon>
              <QuestionAnswerIcon color={pathname.includes('/admin/questions') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Questions" />
            {questionsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        
        <Collapse in={questionsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton 
              sx={{ pl: 4 }} 
              component={Link} 
              href="/admin/questions" 
              selected={pathname === '/admin/questions'}
            >
              <ListItemText primary="Browse Questions" />
            </ListItemButton>
            <ListItemButton 
              sx={{ pl: 4 }} 
              component={Link} 
              href="/admin/questions/unanswered" 
              selected={pathname === '/admin/questions/unanswered'}
            >
              <ListItemText primary="Unanswered Questions" />
            </ListItemButton>
          </List>
        </Collapse>
        
        <ListItem disablePadding>
          <ListItemButton onClick={handleUsersClick}>
            <ListItemIcon>
              <PeopleIcon color={pathname.includes('/admin/users') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Users" />
            {usersOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        
        <Collapse in={usersOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton 
              sx={{ pl: 4 }} 
              component={Link} 
              href="/admin/users" 
              selected={pathname === '/admin/users'}
            >
              <ListItemText primary="Browse Users" />
            </ListItemButton>
            <ListItemButton 
              sx={{ pl: 4 }} 
              component={Link} 
              href="/admin/users/new" 
              selected={pathname === '/admin/users/new'}
            >
              <ListItemText primary="Add Admin User" />
            </ListItemButton>
          </List>
        </Collapse>
        
        <Divider />
        
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            href="/admin/statistics" 
            selected={pathname === '/admin/statistics'}
          >
            <ListItemIcon>
              <EqualizerIcon color={pathname === '/admin/statistics' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Statistics" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            href="/admin/design-reviews" 
            selected={pathname === '/admin/design-reviews'}
          >
            <ListItemIcon>
              <DesignServicesIcon color={pathname === '/admin/design-reviews' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Design Reviews" />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  );
}

```

# app/components/chat/ChatInterface.js

```js
// app/components/chat/ChatInterface.js
import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  CircularProgress, 
  Divider,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SampleQuestions from './SampleQuestions';
import ModuleSelect from './ModuleSelect';
import MessageList from './MessageList';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * ChatInterface component - Main interface for the MongoDB AI Lab Assistant
 * 
 * Features:
 * - Question input and submission
 * - Module selection for domain-specific questions
 * - Message history display with Markdown support
 * - Sample questions for getting started
 * - Feedback mechanism
 * - Conversation history (mocked)
 */
export default function ChatInterface() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showSamples, setShowSamples] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [feedbackSent, setFeedbackSent] = useState({});
  
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Load conversation history
  useEffect(() => {
    if (session) {
      fetchConversationHistory();
    }
  }, [session]);
  
  const fetchConversationHistory = async () => {
    try {
      // This would be an actual API call in the real implementation
      // Mocked for now
      setConversationHistory([
        { id: '1', title: 'MongoDB Aggregation Pipeline', date: '2023-11-27' },
        { id: '2', title: 'Atlas Vector Search Setup', date: '2023-11-25' },
        { id: '3', title: 'Schema Design Best Practices', date: '2023-11-20' },
      ]);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  };
  
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
        id: Date.now().toString(),
        role: 'assistant', 
        content: data.answer,
        metadata: {
          title: data.title,
          summary: data.summary,
          references: data.references,
          source: data.source,
          match_score: data.match_score
        }
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(),
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
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleCopyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };
  
  const handleFeedback = async (messageId, isPositive) => {
    // Prevent multiple feedback on the same message
    if (feedbackSent[messageId]) return;
    
    try {
      // This would be an actual API call in the real implementation
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ messageId, isPositive }),
      // });
      
      // Update state to show feedback was sent
      setFeedbackSent(prev => ({ ...prev, [messageId]: isPositive ? 'positive' : 'negative' }));
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };
  
  const renderConversationHistory = () => (
    <Paper elevation={3} sx={{ 
      position: 'absolute', 
      top: 70, 
      right: 20, 
      width: 300, 
      maxHeight: 400,
      overflowY: 'auto',
      p: 2,
      zIndex: 100
    }}>
      <Typography variant="h6" gutterBottom>Recent Conversations</Typography>
      <Divider sx={{ mb: 2 }} />
      {conversationHistory.length > 0 ? (
        conversationHistory.map(convo => (
          <Box key={convo.id} sx={{ mb: 2, p: 1, '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, cursor: 'pointer' }}>
            <Typography variant="body2" fontWeight="bold">{convo.title}</Typography>
            <Typography variant="caption" color="text.secondary">{convo.date}</Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">No conversation history</Typography>
      )}
    </Paper>
  );
  
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', pt: 8, pb: 2, position: 'relative' }}>
      {/* Main Chat Container */}
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
        {/* Chat Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'primary.light',
          color: 'white'
        }}>
          <Typography variant="h6">MongoDB AI Lab Assistant</Typography>
          <Tooltip title="View conversation history">
            <IconButton color="inherit" onClick={() => setShowSamples(false)}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Messages Area */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'background.default' }}>
          {showSamples ? (
            <SampleQuestions onQuestionClick={handleSampleQuestionClick} />
          ) : (
            <MessageList 
              messages={messages} 
              onCopy={handleCopyToClipboard}
              onFeedback={handleFeedback}
              feedbackSent={feedbackSent}
            />
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Input Area */}
        <Box 
          component="form" 
          onSubmit={handleSubmit}
          sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex', 
            gap: 1,
            bgcolor: 'background.paper'
          }}
        >
          <ModuleSelect 
            value={selectedModule}
            onChange={(event, newValue) => setSelectedModule(newValue)}
          />
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about MongoDB..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            size="medium"
            multiline
            maxRows={4}
            sx={{ bgcolor: 'white' }}
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={isLoading || !input.trim()} 
            endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            sx={{ alignSelf: 'flex-end' }}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
```

# app/components/chat/MessageList.js

```js
// app/components/chat/MessageList.js
import { Box, Paper, Typography, Divider, IconButton, Tooltip, Chip } from '@mui/material';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
import { useTheme } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import BookmarkIcon from '@mui/icons-material/Bookmark';

/**
 * MessageList component - Displays chat messages with Markdown support
 * 
 * Features:
 * - Markdown rendering for messages
 * - Syntax highlighting for code blocks
 * - Message metadata display (title, references, etc.)
 * - Copy to clipboard functionality
 * - Feedback mechanisms (thumbs up/down)
 * - Different styling for user vs assistant messages
 */
export default function MessageList({ messages, onCopy, onFeedback, feedbackSent }) {
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
          key={message.id || index}
          elevation={1}
          sx={{
            p: 2,
            maxWidth: message.role === 'user' ? '80%' : '90%',
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
            '&:hover .message-actions': {
              opacity: 1,
            },
          }}
        >
          {/* Message Header (Assistant messages only) */}
          {message.role === 'assistant' && message.metadata?.title && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {message.metadata.title}
                </Typography>
                
                {message.metadata?.source && (
                  <Chip 
                    label={message.metadata.source} 
                    size="small" 
                    color={message.metadata.source === 'database' ? 'success' : 'primary'} 
                    variant="outlined"
                  />
                )}
              </Box>
              <Divider sx={{ my: 1 }} />
            </>
          )}
          
          {/* Message Content - With Markdown Support */}
          <Typography 
            component="div"
            sx={{ 
              '& pre': { 
                backgroundColor: theme.palette.grey[100], 
                p: 1.5, 
                borderRadius: 1,
                overflow: 'auto'
              },
              '& code': { 
                backgroundColor: theme.palette.grey[100], 
                px: 0.5, 
                borderRadius: 0.5,
                fontFamily: 'monospace'
              },
              '& a': { 
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                }
              },
              '& p': { my: 1 },
              '& ul, & ol': { pl: 2 }
            }}
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(marked.parse(message.content))
            }}
          />
          
          {/* Message Actions */}
          {message.role === 'assistant' && !message.error && (
            <Box 
              className="message-actions"
              sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                mt: 1,
                opacity: 0,
                transition: 'opacity 0.2s ease-in-out',
              }}
            >
              <Tooltip title="Copy to clipboard">
                <IconButton 
                  size="small" 
                  onClick={() => onCopy(message.content)}
                  color="inherit"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Save to bookmarks">
                <IconButton 
                  size="small"
                  color="inherit"
                >
                  <BookmarkIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Helpful">
                <IconButton 
                  size="small"
                  onClick={() => onFeedback(message.id, true)}
                  color={feedbackSent[message.id] === 'positive' ? 'primary' : 'inherit'}
                  disabled={feedbackSent[message.id] !== undefined}
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Not helpful">
                <IconButton 
                  size="small"
                  onClick={() => onFeedback(message.id, false)}
                  color={feedbackSent[message.id] === 'negative' ? 'error' : 'inherit'}
                  disabled={feedbackSent[message.id] !== undefined}
                >
                  <ThumbDownIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          
          {/* References Section */}
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
                sx={{ 
                  fontSize: '0.8rem',
                  '& a': {
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }
                }}
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(marked.parse(message.metadata.references))
                }}
              />
            </>
          )}
          
          {/* Match Score - Only for database matches */}
          {message.role === 'assistant' && message.metadata?.match_score && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Match confidence: {Math.round(message.metadata.match_score * 100)}%
            </Typography>
          )}
        </Paper>
      ))}
    </Box>
  );
}
```

# app/components/chat/ModuleSelect.js

```js
import { Autocomplete, TextField } from '@mui/material';

const modules = [
  { label: 'MongoDB Basics', value: 'basics' },
  { label: 'MongoDB Atlas', value: 'atlas' },
  { label: 'Aggregation Framework', value: 'aggregation' },
  { label: 'Data Modeling', value: 'data_modeling' },
  { label: 'Indexing & Performance', value: 'indexing' },
  { label: 'Atlas Search', value: 'atlas_search' },
  { label: 'Atlas Vector Search', value: 'vector_search' },
  { label: 'Schema Design', value: 'schema_design' },
  { label: 'Realm/App Services', value: 'realm' }
];

export default function ModuleSelect({ value, onChange }) {
  return (
    <Autocomplete
      sx={{ width: 250 }}
      options={modules}
      value={value}
      onChange={onChange}
      renderInput={(params) => (
        <TextField 
          {...params} 
          label="Select Module" 
          variant="outlined" 
          size="medium"
        />
      )}
    />
  );
}

```

# app/components/layout/Header.js

```js
'use client';

import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Avatar, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import InfoIcon from '@mui/icons-material/Info';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleSignOut = () => {
    handleClose();
    signOut({ callbackUrl: '/' });
  };
  
  const navItems = [
    { text: 'Chat', href: '/chat', icon: <QuestionAnswerIcon /> },
    { text: 'Design Review', href: '/design-review', icon: <DesignServicesIcon /> },
    { text: 'About', href: '/about', icon: <InfoIcon /> },
  ];
  
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { sm: 'flex', md: 'none' } }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component={Link} href="/" sx={{ 
            flexGrow: 1, 
            textDecoration: 'none',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}>
            MongoDB AI Lab Assistant
          </Typography>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                href={item.href}
                color="inherit"
                sx={{ 
                  mx: 1,
                  borderBottom: pathname === item.href ? '2px solid white' : 'none',
                  borderRadius: 0,
                  paddingBottom: '4px'
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
          
          {session ? (
            <Box sx={{ ml: 2 }}>
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {session.user.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem component={Link} href="/profile" onClick={handleClose}>
                  <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                  Profile
                </MenuItem>
                
                {session.user.isAdmin && (
                  <MenuItem component={Link} href="/admin" onClick={handleClose}>
                    <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
                    Admin Dashboard
                  </MenuItem>
                )}
                
                <Divider />
                
                <MenuItem onClick={handleSignOut}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button color="inherit" component={Link} href="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={handleDrawerToggle}
        >
          <List>
            {navItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                component={Link} 
                href={item.href}
                selected={pathname === item.href}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

```

# app/context/AuthProvider.js

```js
'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}

```

# app/design-review/page.js

```js
'use client';

import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  Grid,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DesignReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    attachmentUrls: []
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/design-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit design review request');
      }
      
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        attachmentUrls: []
      });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    router.push('/login');
    return null;
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Request a Design Review
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Submit your MongoDB schema, architecture, or query patterns for an AI-powered review.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={4}
                variant="outlined"
                helperText="Describe what you're trying to accomplish with your design"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Requirements & Constraints"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                helperText="List any specific requirements, constraints, or concerns"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Note: File upload functionality will be implemented in a future update.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit for Review'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Design review request submitted successfully!
        </Alert>
      </Snackbar>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
}

```

# app/favicon.ico

This is a binary file of the type: Binary

# app/globals.css

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
}

```

# app/layout.js

```js
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme/theme';
import Header from '@/components/layout/Header';
import AuthProvider from '@/context/AuthProvider';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MongoDB AI Lab Assistant',
  description: 'An AI-powered assistant for MongoDB knowledge and design reviews',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header />
            <main>{children}</main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

```

# app/page.js

```js
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 6 }}>
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography 
            component="h1" 
            variant="h2" 
            color="primary.main"
            fontWeight="bold"
            gutterBottom
          >
            MongoDB AI Lab Assistant
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            An AI-powered assistant that helps you with MongoDB queries, architecture decisions, 
            and design reviews. Leverage the power of AI to accelerate your MongoDB development.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button 
              component={Link}
              href="/chat"
              variant="contained" 
              size="large"
              color="primary"
            >
              Ask a Question
            </Button>
            <Button 
              component={Link}
              href="/design-review"
              variant="outlined" 
              size="large"
              color="primary"
            >
              Request Design Review
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              width: '100%', 
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100'
            }}
          >
            <Typography variant="body1" color="text.secondary">
              MongoDB Logo Placeholder
            </Typography>
            {/* Replace with actual MongoDB logo */}
            {/* <Image src="/mongodb-logo.png" alt="MongoDB Logo" width={400} height={250} /> */}
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>AI-Powered Answers</Typography>
              <Typography variant="body2">
                Get instant answers to your MongoDB questions using our AI-powered search and OpenAI integration.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Design Reviews</Typography>
              <Typography variant="body2">
                Submit your MongoDB schema designs and architecture plans for expert AI-assisted review.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Knowledge Base</Typography>
              <Typography variant="body2">
                Access a growing knowledge base of MongoDB best practices, patterns, and solutions.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

```

# app/page.module.css

```css
.page {
  --gray-rgb: 0, 0, 0;
  --gray-alpha-200: rgba(var(--gray-rgb), 0.08);
  --gray-alpha-100: rgba(var(--gray-rgb), 0.05);

  --button-primary-hover: #383838;
  --button-secondary-hover: #f2f2f2;

  display: grid;
  grid-template-rows: 20px 1fr 20px;
  align-items: center;
  justify-items: center;
  min-height: 100svh;
  padding: 80px;
  gap: 64px;
  font-family: var(--font-geist-sans);
}

@media (prefers-color-scheme: dark) {
  .page {
    --gray-rgb: 255, 255, 255;
    --gray-alpha-200: rgba(var(--gray-rgb), 0.145);
    --gray-alpha-100: rgba(var(--gray-rgb), 0.06);

    --button-primary-hover: #ccc;
    --button-secondary-hover: #1a1a1a;
  }
}

.main {
  display: flex;
  flex-direction: column;
  gap: 32px;
  grid-row-start: 2;
}

.main ol {
  font-family: var(--font-geist-mono);
  padding-left: 0;
  margin: 0;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: -0.01em;
  list-style-position: inside;
}

.main li:not(:last-of-type) {
  margin-bottom: 8px;
}

.main code {
  font-family: inherit;
  background: var(--gray-alpha-100);
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
}

.ctas {
  display: flex;
  gap: 16px;
}

.ctas a {
  appearance: none;
  border-radius: 128px;
  height: 48px;
  padding: 0 20px;
  border: none;
  border: 1px solid transparent;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
}

a.primary {
  background: var(--foreground);
  color: var(--background);
  gap: 8px;
}

a.secondary {
  border-color: var(--gray-alpha-200);
  min-width: 158px;
}

.footer {
  grid-row-start: 3;
  display: flex;
  gap: 24px;
}

.footer a {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer img {
  flex-shrink: 0;
}

/* Enable hover only on non-touch devices */
@media (hover: hover) and (pointer: fine) {
  a.primary:hover {
    background: var(--button-primary-hover);
    border-color: transparent;
  }

  a.secondary:hover {
    background: var(--button-secondary-hover);
    border-color: transparent;
  }

  .footer a:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
}

@media (max-width: 600px) {
  .page {
    padding: 32px;
    padding-bottom: 80px;
  }

  .main {
    align-items: center;
  }

  .main ol {
    text-align: center;
  }

  .ctas {
    flex-direction: column;
  }

  .ctas a {
    font-size: 14px;
    height: 40px;
    padding: 0 16px;
  }

  a.secondary {
    min-width: auto;
  }

  .footer {
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }
}

@media (prefers-color-scheme: dark) {
  .logo {
    filter: invert();
  }
}

```

# app/theme/theme.js

```js
'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00684A', // MongoDB Green
      light: '#4CAF50',
      dark: '#005240',
      contrastText: '#fff',
    },
    secondary: {
      main: '#3D5AFE', // Bright Blue
      light: '#8187FF',
      dark: '#0031CA',
      contrastText: '#fff',
    },
    error: {
      main: '#FF4436',
    },
    warning: {
      main: '#FFC017',
    },
    info: {
      main: '#13AA52',
    },
    success: {
      main: '#00ED64',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#00684A', // MongoDB Green
        },
      },
    },
  },
});

export default theme;

```

# jsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}

```

# MIGRATION.md

```md
# MongoDB AI Lab Assistant: Migration Guide from Flask to Next.js

This guide will help you migrate your existing MongoDB AI Lab Assistant from a Flask-based Python application to a modern React/Next.js application with MongoDB integration. The new setup provides improved performance, better user experience, and easier deployment on Vercel.

## Why Migrate to Next.js?

- **Modern UI**: React with Material UI provides a responsive and intuitive user interface
- **Enhanced Performance**: Server-side rendering and API routes improve performance and SEO
- **Simplified Deployment**: Vercel provides seamless deployment with automatic CI/CD
- **Better Developer Experience**: Hot module reloading, component-based architecture, and improved testing

## 1. Architecture Comparison

### Current Architecture (Flask)
- **Backend**: Python Flask with MongoDB integration
- **Frontend**: Jinja2 templates with some JavaScript
- **Deployment**: Google Cloud App Engine
- **Authentication**: Custom authentication or OAuth
- **AI Integration**: OpenAI API (embeddings and question answering)

### New Architecture (Next.js)
- **Backend**: Next.js API routes with MongoDB integration
- **Frontend**: React components with Material UI
- **Deployment**: Vercel (optimized for Next.js)
- **Authentication**: NextAuth.js with Google OAuth
- **AI Integration**: Same OpenAI API functionalities

## 2. Migration Strategy

### 2.1 Data Migration

No direct data changes are required as we're keeping MongoDB as the database. The application will continue using the same database collections and schema.

#### MongoDB Schema Overview:
\`\`\`
- users: User accounts and authentication data
- documents: Main collection for questions and answers with vector embeddings
- conversations: Chat history between users and the system
- unanswered_questions: Questions that couldn't be answered from the database
- design_reviews: Design review requests and responses
\`\`\`

### 2.2 API Endpoint Mapping

| Flask Route | Next.js API Route |
|-------------|-------------------|
| `/auth/login` | `/api/auth/[...nextauth]/route.js` |
| `/chat/question` | `/api/chat/route.js` |
| `/admin/questions` | `/api/admin/questions/route.js` |
| `/admin/users` | `/api/admin/users/route.js` |
| `/design-review` | `/api/design-review/route.js` |

### 2.3 Functionality Migration

#### Authentication
- Replace Flask authentication with NextAuth.js
- Implement Google OAuth for simplified login
- Maintain admin role capabilities

#### Chat Functionality
- Migrate vector search logic to Next.js API routes
- Keep the core OpenAI integration code with minimal changes
- Enhance UI with React components for better interactivity

#### Admin Features
- Create React-based admin dashboard
- Implement question management interface
- Add user management capabilities

#### Design Review System
- Build React form for design review submission
- Create admin interface for review management
- Maintain the review workflow and email notifications

## 3. Implementation Steps

### 3.1 Project Setup

Run the provided setup script to create the initial project structure:

\`\`\`bash
bash setup_script.sh
\`\`\`

This creates the Next.js application with all necessary directories, components, and configuration files.

### 3.2 Environment Configuration

Configure your environment variables in `.env.local`:

\`\`\`
# MongoDB Connection
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
MONGODB_DB=ai_lab_assistant

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=generate-a-random-secret
NEXTAUTH_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Application Settings
SIMILARITY_THRESHOLD=0.91
\`\`\`

### 3.3 MongoDB Vector Search Setup

Ensure your MongoDB Atlas cluster is configured with Vector Search capability:

1. Create a vector search index on your `documents` collection
2. Index configuration for question embeddings:
   \`\`\`json
   {
     "fields": [
       {
         "type": "vector",
         "path": "question_embedding",
         "numDimensions": 1536,
         "similarity": "cosine"
       }
     ]
   }
   \`\`\`

### 3.4 Development and Testing

1. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Test each feature thoroughly:
   - User authentication
   - Question answering
   - Vector search functionality
   - Admin dashboard features
   - Design review workflow

3. Compare results with your Flask application to ensure consistency

### 3.5 Deployment on Vercel

1. Push your code to a GitHub repository

2. Connect to Vercel:
   - Create a Vercel account if you don't have one
   - Import your repository
   - Configure environment variables in Vercel dashboard
   - Deploy the application

3. Set up custom domain if needed

## 4. Ongoing Maintenance

### 4.1 Monitoring

- Set up Vercel Analytics for front-end performance monitoring
- Configure MongoDB Atlas monitoring for database performance
- Implement error tracking with a service like Sentry

### 4.2 Updates and Improvements

- Regular dependency updates
- New feature development using React components
- Performance optimizations
- UI/UX improvements

## 5. Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Material UI Documentation](https://mui.com/material-ui/getting-started/overview/)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [Vercel Documentation](https://vercel.com/docs)

## 6. Troubleshooting Common Issues

### MongoDB Connection Issues
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check connection string in environment variables
- Verify network connectivity

### Authentication Problems
- Check Google OAuth configuration
- Verify NextAuth.js setup and callbacks
- Ensure NEXTAUTH_SECRET is properly set

### Vector Search Not Working
- Confirm vector search index is properly created
- Verify embedding dimensions match (1536 for OpenAI embeddings)
- Check similarity threshold configuration

### Deployment Issues
- Verify all environment variables are set in Vercel
- Check build logs for any errors
- Ensure Node.js version compatibility

```

# next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig

```

# next.config.mjs

```mjs
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

```

# package.json

```json
{
  "name": "mongodb-ai-lab-assistant",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@emotion/cache": "^11.11.0",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@fontsource/roboto": "^5.0.8",
    "@mui/icons-material": "^5.14.19",
    "@mui/material": "^5.14.19",
    "@next-auth/mongodb-adapter": "^1.1.3",
    "axios": "^1.6.2",
    "dompurify": "^3.0.6",
    "isomorphic-dompurify": "^1.9.0",
    "marked": "^10.0.0",
    "mongodb": "^5.9.1",
    "mongoose": "^8.0.2",
    "next": "14.0.3",
    "next-auth": "^4.24.5",
    "openai": "^4.20.1",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "eslint": "^8",
    "eslint-config-next": "14.0.3"
  }
}

```

# public/file.svg

This is a file of the type: SVG Image

# public/globe.svg

This is a file of the type: SVG Image

# public/next.svg

This is a file of the type: SVG Image

# public/vercel.svg

This is a file of the type: SVG Image

# public/window.svg

This is a file of the type: SVG Image

# README.md

```md
# MongoDB AI Lab Assistant

A Next.js application that provides AI-powered assistance for MongoDB questions and design reviews.

## Features

- AI-powered Q&A with vector search for MongoDB questions
- Design review submission and management
- User authentication with Google OAuth
- Admin dashboard for content management
- Material UI design system

## Tech Stack

- **Frontend**: React.js with Next.js App Router
- **UI Library**: Material UI
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Atlas Vector Search
- **AI Integration**: OpenAI API for embeddings and answers
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB Atlas account
- OpenAI API key
- Google OAuth credentials

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/mongodb-ai-lab-assistant.git
cd mongodb-ai-lab-assistant
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.local.example .env.local
# Edit .env.local with your configuration values
\`\`\`

4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

5. Open http://localhost:3000 in your browser

## Deployment on Vercel

1. Create a Vercel account if you don't have one
2. Install the Vercel CLI
\`\`\`bash
npm install -g vercel
\`\`\`

3. Deploy to Vercel
\`\`\`bash
vercel
\`\`\`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

```

# script.sh

```sh
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

```

# setup.sh

```sh
#!/bin/bash

# This script sets up a complete Next.js application structure for a MongoDB AI Lab Assistant
# Previously created directories and files are maintained in the script

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

# --- API Routes ---

# Previous API Routes remain the same (auth, chat, admin routes)

# New API routes for design reviews
cat > app/api/design-review/route.js << 'EOL'
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, requirements, attachmentUrls } = await request.json();
    
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const designReview = {
      title,
      description,
      requirements: requirements || '',
      attachment_urls: attachmentUrls || [],
      status: 'pending',
      user_id: session.user.id,
      user_name: session.user.name,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const result = await db.collection('design_reviews').insertOne(designReview);
    
    return NextResponse.json({
      message: 'Design review request submitted successfully',
      request_id: result.insertedId.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting design review:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    let query = {};
    
    // If not admin, only show user's own requests
    if (!session.user.isAdmin) {
      query.user_id = session.user.id;
    }
    
    const designReviews = await db.collection('design_reviews')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();
    
    // Convert ObjectIds to strings for JSON serialization
    const serializedReviews = designReviews.map(review => ({
      ...review,
      _id: review._id.toString(),
      created_at: review.created_at.toISOString(),
      updated_at: review.updated_at.toISOString()
    }));
    
    return NextResponse.json(serializedReviews);
  } catch (error) {
    console.error('Error fetching design reviews:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}
EOL

# --- Add Main Page Components ---

# Root layout
cat > app/layout.js << 'EOL'
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme/theme';
import Header from '@/components/layout/Header';
import AuthProvider from '@/context/AuthProvider';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MongoDB AI Lab Assistant',
  description: 'An AI-powered assistant for MongoDB knowledge and design reviews',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Header />
            <main>{children}</main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
EOL

# Home page
cat > app/page.js << 'EOL'
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 6 }}>
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography 
            component="h1" 
            variant="h2" 
            color="primary.main"
            fontWeight="bold"
            gutterBottom
          >
            MongoDB AI Lab Assistant
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            An AI-powered assistant that helps you with MongoDB queries, architecture decisions, 
            and design reviews. Leverage the power of AI to accelerate your MongoDB development.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button 
              component={Link}
              href="/chat"
              variant="contained" 
              size="large"
              color="primary"
            >
              Ask a Question
            </Button>
            <Button 
              component={Link}
              href="/design-review"
              variant="outlined" 
              size="large"
              color="primary"
            >
              Request Design Review
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              width: '100%', 
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100'
            }}
          >
            <Typography variant="body1" color="text.secondary">
              MongoDB Logo Placeholder
            </Typography>
            {/* Replace with actual MongoDB logo */}
            {/* <Image src="/mongodb-logo.png" alt="MongoDB Logo" width={400} height={250} /> */}
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>AI-Powered Answers</Typography>
              <Typography variant="body2">
                Get instant answers to your MongoDB questions using our AI-powered search and OpenAI integration.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Design Reviews</Typography>
              <Typography variant="body2">
                Submit your MongoDB schema designs and architecture plans for expert AI-assisted review.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Knowledge Base</Typography>
              <Typography variant="body2">
                Access a growing knowledge base of MongoDB best practices, patterns, and solutions.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
EOL

# Chat page
cat > app/chat/page.js << 'EOL'
'use client';

import { useEffect } from 'react';
import { Container } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return null;
  }
  
  return (
    <Container maxWidth="xl" disableGutters sx={{ height: '100vh' }}>
      <ChatInterface />
    </Container>
  );
}
EOL

# Design Review page
cat > app/design-review/page.js << 'EOL'
'use client';

import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  Grid,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DesignReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    attachmentUrls: []
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/design-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit design review request');
      }
      
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        attachmentUrls: []
      });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    router.push('/login');
    return null;
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Request a Design Review
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Submit your MongoDB schema, architecture, or query patterns for an AI-powered review.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={4}
                variant="outlined"
                helperText="Describe what you're trying to accomplish with your design"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Requirements & Constraints"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                helperText="List any specific requirements, constraints, or concerns"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Note: File upload functionality will be implemented in a future update.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit for Review'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Design review request submitted successfully!
        </Alert>
      </Snackbar>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
}
EOL

# --- Additional Components ---

# Create missing chat components
cat > app/components/chat/ModuleSelect.js << 'EOL'
import { Autocomplete, TextField } from '@mui/material';

const modules = [
  { label: 'MongoDB Basics', value: 'basics' },
  { label: 'MongoDB Atlas', value: 'atlas' },
  { label: 'Aggregation Framework', value: 'aggregation' },
  { label: 'Data Modeling', value: 'data_modeling' },
  { label: 'Indexing & Performance', value: 'indexing' },
  { label: 'Atlas Search', value: 'atlas_search' },
  { label: 'Atlas Vector Search', value: 'vector_search' },
  { label: 'Schema Design', value: 'schema_design' },
  { label: 'Realm/App Services', value: 'realm' }
];

export default function ModuleSelect({ value, onChange }) {
  return (
    <Autocomplete
      sx={{ width: 250 }}
      options={modules}
      value={value}
      onChange={onChange}
      renderInput={(params) => (
        <TextField 
          {...params} 
          label="Select Module" 
          variant="outlined" 
          size="medium"
        />
      )}
    />
  );
}
EOL

# Create Layout components
cat > app/components/layout/Header.js << 'EOL'
'use client';

import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Avatar, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import InfoIcon from '@mui/icons-material/Info';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleSignOut = () => {
    handleClose();
    signOut({ callbackUrl: '/' });
  };
  
  const navItems = [
    { text: 'Chat', href: '/chat', icon: <QuestionAnswerIcon /> },
    { text: 'Design Review', href: '/design-review', icon: <DesignServicesIcon /> },
    { text: 'About', href: '/about', icon: <InfoIcon /> },
  ];
  
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { sm: 'flex', md: 'none' } }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component={Link} href="/" sx={{ 
            flexGrow: 1, 
            textDecoration: 'none',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}>
            MongoDB AI Lab Assistant
          </Typography>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                href={item.href}
                color="inherit"
                sx={{ 
                  mx: 1,
                  borderBottom: pathname === item.href ? '2px solid white' : 'none',
                  borderRadius: 0,
                  paddingBottom: '4px'
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
          
          {session ? (
            <Box sx={{ ml: 2 }}>
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {session.user.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem component={Link} href="/profile" onClick={handleClose}>
                  <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                  Profile
                </MenuItem>
                
                {session.user.isAdmin && (
                  <MenuItem component={Link} href="/admin" onClick={handleClose}>
                    <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
                    Admin Dashboard
                  </MenuItem>
                )}
                
                <Divider />
                
                <MenuItem onClick={handleSignOut}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button color="inherit" component={Link} href="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={handleDrawerToggle}
        >
          <List>
            {navItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                component={Link} 
                href={item.href}
                selected={pathname === item.href}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
EOL

# Create context providers
cat > app/context/AuthProvider.js << 'EOL'
'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
EOL

# Create theme
cat > app/theme/theme.js << 'EOL'
'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00684A', // MongoDB Green
      light: '#4CAF50',
      dark: '#005240',
      contrastText: '#fff',
    },
    secondary: {
      main: '#3D5AFE', // Bright Blue
      light: '#8187FF',
      dark: '#0031CA',
      contrastText: '#fff',
    },
    error: {
      main: '#FF4436',
    },
    warning: {
      main: '#FFC017',
    },
    info: {
      main: '#13AA52',
    },
    success: {
      main: '#00ED64',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#00684A', // MongoDB Green
        },
      },
    },
  },
});

export default theme;
EOL

# Create Login page
cat > app/\(auth\)/login/page.js << 'EOL'
'use client';

import { useEffect } from 'react';
import { Container, Box, Button, Typography, Paper, Divider } from '@mui/material';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GoogleIcon from '@mui/icons-material/Google';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'authenticated') {
    return null;
  }
  
  return (
    <Container maxWidth="sm" sx={{ mt: 12, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Welcome to MongoDB AI Lab Assistant
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Please sign in to continue
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Sign in with Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
EOL

# Create Profile page
cat > app/\(auth\)/profile/page.js << 'EOL'
'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Divider, Grid, Chip, CircularProgress, Tab, Tabs } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [designReviews, setDesignReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    if (status === 'authenticated') {
      fetchDesignReviews();
    }
  }, [status, router]);
  
  const fetchDesignReviews = async () => {
    try {
      const response = await fetch('/api/design-review');
      if (response.ok) {
        const data = await response.json();
        setDesignReviews(data);
      }
    } catch (error) {
      console.error('Error fetching design reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return null;
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ ml: 2 }}>
            <Typography variant="h4" gutterBottom>
              {session.user.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {session.user.email}
            </Typography>
            {session.user.isAdmin && (
              <Chip 
                label="Admin" 
                color="primary" 
                size="small" 
                sx={{ mt: 1 }} 
              />
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="profile tabs"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Design Reviews" />
              <Tab label="Chat History" />
              <Tab label="Account Settings" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : designReviews.length > 0 ? (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {designReviews.map((review) => (
                  <Grid item xs={12} key={review._id}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        borderLeft: '4px solid', 
                        borderColor: 
                          review.status === 'completed' ? 'success.main' : 
                          review.status === 'in_progress' ? 'info.main' : 
                          'warning.main' 
                      }}
                    >
                      <Typography variant="h6">{review.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Submitted on {new Date(review.created_at).toLocaleDateString()}
                      </Typography>
                      <Chip 
                        label={review.status.replace('_', ' ')} 
                        color={
                          review.status === 'completed' ? 'success' : 
                          review.status === 'in_progress' ? 'info' : 
                          'warning'
                        }
                        size="small"
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  You haven't submitted any design reviews yet.
                </Typography>
              </Box>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Chat history feature coming soon.
              </Typography>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Account settings feature coming soon.
              </Typography>
            </Box>
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}
EOL

# --- Admin Pages ---

# Admin dashboard page
cat > app/admin/page.js << 'EOL'
'use client';

import { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AdminMenu from '@/components/admin/AdminMenu';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    unansweredQuestions: 0,
    designReviews: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated' && !session.user.isAdmin) {
      router.push('/');
      return;
    }
    
    if (status === 'authenticated' && session.user.isAdmin) {
      fetchStats();
    }
  }, [status, session, router]);
  
  const fetchStats = async () => {
    try {
      // This would be an actual API call in a real application
      // Mock data for now
      setTimeout(() => {
        setStats({
          totalQuestions: 248,
          totalUsers: 56,
          unansweredQuestions: 12,
          designReviews: 8
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };
  
  if (status === 'loading' || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!session || !session.user.isAdmin) {
    return null;
  }
  
  return (
    <Container maxWidth="xl" sx={{ mt: 12, mb: 6 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <AdminMenu />
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h4" color="primary" gutterBottom>
              Admin Dashboard
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <QuestionAnswerIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">{stats.totalQuestions}</Typography>
                    <Typography variant="body2">Total Questions</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">{stats.totalUsers}</Typography>
                    <Typography variant="body2">Registered Users</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <QuestionAnswerIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">{stats.unansweredQuestions}</Typography>
                    <Typography variant="body2">Unanswered</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <DesignServicesIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5">{stats.designReviews}</Typography>
                    <Typography variant="body2">Design Reviews</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Recent Activity" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="New question submitted" 
                          secondary="How do I set up an Atlas Vector Search index?" 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="Design review requested" 
                          secondary="Multi-tenant SaaS application schema design" 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="New user registered" 
                          secondary="john.doe@example.com" 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Popular Questions" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="What's the best way to model one-to-many relationships?" 
                          secondary="50 occurrences" 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="How do I set up MongoDB Atlas Search?" 
                          secondary="42 occurrences" 
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="What are the benefits of using MongoDB Atlas?" 
                          secondary="38 occurrences" 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
EOL

# Admin Menu Component
cat > app/components/admin/AdminMenu.js << 'EOL'
'use client';

import { useState } from 'react';
import { 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton, 
  Collapse, 
  Divider,
  Typography
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PeopleIcon from '@mui/icons-material/People';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminMenu() {
  const pathname = usePathname();
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  
  const handleQuestionsClick = () => {
    setQuestionsOpen(!questionsOpen);
  };
  
  const handleUsersClick = () => {
    setUsersOpen(!usersOpen);
  };
  
  return (
    <Paper elevation={2} sx={{ borderRadius: 2 }}>
      <List component="nav" aria-label="admin navigation">
        <Typography 
          variant="h6" 
          sx={{ 
            py: 2, 
            px: 3, 
            borderBottom: '1px solid', 
            borderColor: 'divider', 
            color: 'primary.main' 
          }}
        >
          Admin Panel
        </Typography>
        
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            href="/admin" 
            selected={pathname === '/admin'}
          >
            <ListItemIcon>
              <DashboardIcon color={pathname === '/admin' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton onClick={handleQuestionsClick}>
            <ListItemIcon>
              <QuestionAnswerIcon color={pathname.includes('/admin/questions') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Questions" />
            {questionsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        
        <Collapse in={questionsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton 
              sx={{ pl: 4 }} 
              component={Link} 
              href="/admin/questions" 
              selected={pathname === '/admin/questions'}
            >
              <ListItemText primary="Browse Questions" />
            </ListItemButton>
            <ListItemButton 
              sx={{ pl: 4 }} 
              component={Link} 
              href="/admin/questions/unanswered" 
              selected={pathname === '/admin/questions/unanswered'}
            >
              <ListItemText primary="Unanswered Questions" />
            </ListItemButton>
          </List>
        </Collapse>
        
        <ListItem disablePadding>
          <ListItemButton onClick={handleUsersClick}>
            <ListItemIcon>
              <PeopleIcon color={pathname.includes('/admin/users') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Users" />
            {usersOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        
        <Collapse in={usersOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton 
              sx={{ pl: 4 }} 
              component={Link} 
              href="/admin/users" 
              selected={pathname === '/admin/users'}
            >
              <ListItemText primary="Browse Users" />
            </ListItemButton>
            <ListItemButton 
              sx={{ pl: 4 }} 
              component={Link} 
              href="/admin/users/new" 
              selected={pathname === '/admin/users/new'}
            >
              <ListItemText primary="Add Admin User" />
            </ListItemButton>
          </List>
        </Collapse>
        
        <Divider />
        
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            href="/admin/statistics" 
            selected={pathname === '/admin/statistics'}
          >
            <ListItemIcon>
              <EqualizerIcon color={pathname === '/admin/statistics' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Statistics" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton 
            component={Link} 
            href="/admin/design-reviews" 
            selected={pathname === '/admin/design-reviews'}
          >
            <ListItemIcon>
              <DesignServicesIcon color={pathname === '/admin/design-reviews' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Design Reviews" />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  );
}
EOL

# --- Project Root Files ---

# package.json
cat > package.json << 'EOL'
{
  "name": "mongodb-ai-lab-assistant",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@emotion/cache": "^11.11.0",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@fontsource/roboto": "^5.0.8",
    "@mui/icons-material": "^5.14.19",
    "@mui/material": "^5.14.19",
    "@next-auth/mongodb-adapter": "^1.1.3",
    "axios": "^1.6.2",
    "dompurify": "^3.0.6",
    "isomorphic-dompurify": "^1.9.0",
    "marked": "^10.0.0",
    "mongodb": "^5.9.1",
    "mongoose": "^8.0.2",
    "next": "14.0.3",
    "next-auth": "^4.24.5",
    "openai": "^4.20.1",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "eslint": "^8",
    "eslint-config-next": "14.0.3"
  }
}
EOL

# .env.local template
cat > .env.local.example << 'EOL'
# Next.js Environment
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/dbname?retryWrites=true&w=majority
MONGODB_DB=ai_lab_assistant

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=generate-a-secure-random-string
NEXTAUTH_URL=http://localhost:3000

# Application Settings
SIMILARITY_THRESHOLD=0.91
EOL

# .gitignore
cat > .gitignore << 'EOL'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOL

# next.config.js
cat > next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
}

module.exports = nextConfig
EOL

# Create vercel.json
cat > vercel.json << 'EOL'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "MONGODB_DB": "@mongodb-db",
    "OPENAI_API_KEY": "@openai-api-key",
    "GOOGLE_CLIENT_ID": "@google-client-id",
    "GOOGLE_CLIENT_SECRET": "@google-client-secret",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "NEXTAUTH_URL": "@nextauth-url",
    "SIMILARITY_THRESHOLD": "@similarity-threshold"
  }
}
EOL

# README.md
cat > README.md << 'EOL'
# MongoDB AI Lab Assistant

A Next.js application that provides AI-powered assistance for MongoDB questions and design reviews.

## Features

- AI-powered Q&A with vector search for MongoDB questions
- Design review submission and management
- User authentication with Google OAuth
- Admin dashboard for content management
- Material UI design system

## Tech Stack

- **Frontend**: React.js with Next.js App Router
- **UI Library**: Material UI
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Atlas Vector Search
- **AI Integration**: OpenAI API for embeddings and answers
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB Atlas account
- OpenAI API key
- Google OAuth credentials

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/mongodb-ai-lab-assistant.git
cd mongodb-ai-lab-assistant
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.local.example .env.local
# Edit .env.local with your configuration values
\`\`\`

4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

5. Open http://localhost:3000 in your browser

## Deployment on Vercel

1. Create a Vercel account if you don't have one
2. Install the Vercel CLI
\`\`\`bash
npm install -g vercel
\`\`\`

3. Deploy to Vercel
\`\`\`bash
vercel
\`\`\`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
EOL

echo "Setup completed! Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Configure .env.local with your credentials"
echo "3. Run 'npm run dev' to start the development server"

```

# vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "MONGODB_DB": "@mongodb-db",
    "OPENAI_API_KEY": "@openai-api-key",
    "GOOGLE_CLIENT_ID": "@google-client-id",
    "GOOGLE_CLIENT_SECRET": "@google-client-secret",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "NEXTAUTH_URL": "@nextauth-url",
    "SIMILARITY_THRESHOLD": "@similarity-threshold"
  }
}

```


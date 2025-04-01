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

4. Run the development server
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
EOL

echo "Setup completed! Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Configure .env.local with your credentials"
echo "3. Run 'npm run dev' to start the development server"

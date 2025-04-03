'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  Divider, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  useTheme,
  Collapse,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Feedback as FeedbackIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  QuestionAnswer as QuestionAnswerIcon,
  People as PeopleIcon,
  Equalizer as EqualizerIcon,
  DesignServices as DesignServicesIcon,
  MenuBook as MenuBookIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const drawerWidth = 240;

/**
 * Admin layout component with navigation drawer
 */
export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // State for collapsible menu sections
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [ragOpen, setRagOpen] = useState(false);
  
  // Check authentication on component mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin');
    } else if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/');
    }
  }, [status, session, router]);
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleQuestionsClick = () => {
    setQuestionsOpen(!questionsOpen);
  };
  
  const handleUsersClick = () => {
    setUsersOpen(!usersOpen);
  };
  
  const handleRagClick = () => {
    setRagOpen(!ragOpen);
  };
  
  const handleSignIn = () => {
    router.push('/auth/signin?callbackUrl=/admin');
  };
  
  // Main menu items
  const mainMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Feedback', icon: <FeedbackIcon />, path: '/admin/feedback' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' }
  ];
  
  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Show authentication error if not authenticated or not admin
  if (status === 'unauthenticated' || (status === 'authenticated' && !session?.user?.isAdmin)) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 5 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {status === 'unauthenticated' 
            ? 'You need to sign in to access the admin dashboard' 
            : 'You do not have permission to access the admin dashboard'}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<LoginIcon />}
          onClick={handleSignIn}
        >
          Sign In
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ marginRight: 5 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            AI Lab Assistant Admin
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          ...(open && {
            width: drawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
          }),
          ...(!open && {
            width: theme.spacing(7),
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            boxSizing: 'border-box',
            overflowX: 'hidden',
          }),
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {/* Main menu items */}
            {mainMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <Link href={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ListItemButton
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      backgroundColor: pathname === item.path ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{ opacity: open ? 1 : 0 }} 
                    />
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
            
            {/* Questions section */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={handleQuestionsClick}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <QuestionAnswerIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Questions" 
                  sx={{ opacity: open ? 1 : 0 }} 
                />
                {open && (questionsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
              </ListItemButton>
            </ListItem>
            
            <Collapse in={open && questionsOpen} timeout="auto" unmountOnExit>
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
            
            {/* Users section */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={handleUsersClick}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Users" 
                  sx={{ opacity: open ? 1 : 0 }} 
                />
                {open && (usersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
              </ListItemButton>
            </ListItem>
            
            <Collapse in={open && usersOpen} timeout="auto" unmountOnExit>
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
            
            {/* RAG Documents section */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={handleRagClick}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <MenuBookIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="RAG Documents" 
                  sx={{ opacity: open ? 1 : 0 }} 
                />
                {open && (ragOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
              </ListItemButton>
            </ListItem>
            
            <Collapse in={open && ragOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton 
                  sx={{ pl: 4 }} 
                  component={Link} 
                  href="/admin/rag-documents"
                  selected={pathname === '/admin/rag-documents'}
                >
                  <ListItemText primary="Browse Documents" />
                </ListItemButton>
                <ListItemButton 
                  sx={{ pl: 4 }} 
                  component={Link} 
                  href="/admin/rag-documents/upload"
                  selected={pathname === '/admin/rag-documents/upload'}
                >
                  <ListItemText primary="Upload Document" />
                </ListItemButton>
                <ListItemButton 
                  sx={{ pl: 4 }} 
                  component={Link} 
                  href="/admin/rag-documents/search"
                  selected={pathname === '/admin/rag-documents/search'}
                >
                  <ListItemText primary="Semantic Search" />
                </ListItemButton>
              </List>
            </Collapse>
            
            <Divider />
            
            {/* Additional menu items */}
            <ListItem disablePadding sx={{ display: 'block' }}>
              <Link href="/admin/statistics" style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    backgroundColor: pathname === '/admin/statistics' ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    <EqualizerIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Statistics" 
                    sx={{ opacity: open ? 1 : 0 }} 
                  />
                </ListItemButton>
              </Link>
            </ListItem>
            
            <ListItem disablePadding sx={{ display: 'block' }}>
              <Link href="/admin/design-reviews" style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    backgroundColor: pathname === '/admin/design-reviews' ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    <DesignServicesIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Design Reviews" 
                    sx={{ opacity: open ? 1 : 0 }} 
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          </List>
          <Divider />
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
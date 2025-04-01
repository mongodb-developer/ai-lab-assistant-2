'use client';

import { useState } from 'react';
import { 
  Box,
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
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminMenu() {
  const pathname = usePathname();
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [ragOpen, setRagOpen] = useState(false);
  
  const handleQuestionsClick = () => {
    setQuestionsOpen(!questionsOpen);
  };
  
  const handleUsersClick = () => {
    setUsersOpen(!usersOpen);
  };

  const handleRagClick = () => {
    setRagOpen(!ragOpen);
  };
  
  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        position: 'fixed',
        height: '100vh',
        pt: { xs: '64px', sm: '72px' }, // Account for header height
        borderRight: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        overflowY: 'auto'
      }}
    >
      <List component="nav" aria-label="admin navigation">
        <Typography 
          variant="h6" 
          sx={{ 
            py: 2, 
            px: 3, 
            borderBottom: '1px solid', 
            borderColor: 'divider', 
            color: 'primary.main',
            backgroundColor: 'background.paper',
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

        <ListItem disablePadding>
          <ListItemButton onClick={handleRagClick}>
            <ListItemIcon>
              <MenuBookIcon color={pathname.includes('/admin/rag-documents') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="RAG Documents" />
            {ragOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        
        <Collapse in={ragOpen} timeout="auto" unmountOnExit>
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
    </Box>
  );
}

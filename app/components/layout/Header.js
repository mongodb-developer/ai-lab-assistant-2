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
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Mock session for development
const mockSession = {
  user: {
    email: 'dev@example.com',
    name: 'Developer',
    image: null
  }
};

export default function Header() {
  const session = useAuth();
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
    // Mock sign out for development
    console.log('Signing out...');
    handleClose();
  };

  const menuItems = [
    { text: 'Chat', icon: <QuestionAnswerIcon />, path: '/chat' },
    { text: 'About', icon: <InfoIcon />, path: '/about' },
  ];

  const isActive = (path) => pathname === path;

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="primary"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <SmartToyIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 500
            }}
          >
            MongoDB AI Lab Assistant
          </Typography>
        </Box>
        
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          {menuItems.map((item) => (
            <Button
              key={item.text}
              component={Link}
              href={item.path}
              color="primary"
              startIcon={item.icon}
              sx={{
                mx: 1,
                borderBottom: isActive(item.path) ? '2px solid' : 'none',
                borderColor: isActive(item.path) ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0, 104, 74, 0.04)',
                },
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={handleMenu}
            color="primary"
            size="large"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 104, 74, 0.04)',
              },
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {session?.user?.name?.[0] || <AccountCircleIcon />}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={session?.user?.name || 'Developer'} />
            </MenuItem>
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

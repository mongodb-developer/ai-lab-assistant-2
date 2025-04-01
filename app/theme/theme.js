'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00684A', // MongoDB Green
      light: '#00ED64',
      dark: '#023430',
      contrastText: '#fff',
    },
    secondary: {
      main: '#0C2440', // MongoDB Dark Blue
      light: '#1C63B7',
      dark: '#0A1F35',
      contrastText: '#fff',
    },
    error: {
      main: '#E8424C',
      light: '#FF6B6B',
      dark: '#D32F2F',
    },
    warning: {
      main: '#FFC017',
      light: '#FFD54F',
      dark: '#FFA000',
    },
    info: {
      main: '#016BF8', // MongoDB Blue
      light: '#1C63B7',
      dark: '#0049B0',
    },
    success: {
      main: '#00ED64',
      light: '#4CAF50',
      dark: '#00C853',
    },
    background: {
      default: '#F9FBFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C2D38',
      secondary: '#5C6C75',
    },
  },
  typography: {
    fontFamily: [
      'Euclid Circular A',
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
          borderRadius: 6,
          padding: '6px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1C2D38',
          boxShadow: 'none',
          borderBottom: '1px solid #E8EDEB',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E8EDEB',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme;

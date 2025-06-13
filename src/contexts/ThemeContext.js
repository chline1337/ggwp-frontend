import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Golf-themed color palettes
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Golf green
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6F00', // Orange accent
      light: '#FF8F00',
      dark: '#E65100',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#388E3C', // Darker green
      light: '#66BB6A',
      dark: '#2E7D32',
    },
    background: {
      default: '#F8F9FA', // Light earth tone
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50', // Dark earth tone
      secondary: '#5D6D7E',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.5,
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
          borderRadius: 8,
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        elevation1: {
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        },
        elevation3: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4CAF50', // Brighter green for dark mode
      light: '#81C784',
      dark: '#2E7D32',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF8F00', // Brighter orange for dark mode
      light: '#FFB74D',
      dark: '#F57C00',
      contrastText: '#000000',
    },
    success: {
      main: '#66BB6A',
      light: '#81C784',
      dark: '#4CAF50',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.5,
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
          borderRadius: 8,
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        },
        elevation1: {
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        },
        elevation2: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        },
        elevation3: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
          borderRadius: 12,
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
          borderBottom: '1px solid #333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
});

export const CustomThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // Fall back to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const contextValue = {
    isDarkMode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}; 
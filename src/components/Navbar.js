import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { AdminOnly } from '../components/common/RoleBasedComponent';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  EmojiEvents as TournamentIcon,
  Event as EventIcon,
  Group as TeamIcon,
  Person as ProfileIcon,
  Add as CreateIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Speed as TrackmaniaIcon
} from '@mui/icons-material';

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navigationItems = [
    ...(isAuthenticated ? [
      { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
      { label: 'Tournaments', path: '/tournaments', icon: <TournamentIcon /> },
      { label: 'Events', path: '/events', icon: <EventIcon /> },
      { label: 'Teams', path: '/teams', icon: <TeamIcon /> },
      { label: 'Trackmania', path: '/trackmania', icon: <TrackmaniaIcon /> },
      { label: 'Profile', path: '/profile', icon: <ProfileIcon /> },
      { label: 'Create Event', path: '/create-event', icon: <CreateIcon /> }
    ] : [])
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          OC-LANgenthal
        </Typography>
        {isAuthenticated && user && (
          <Box 
            component={Link}
            to="/profile"
            onClick={handleDrawerToggle}
            sx={{ 
              mt: 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              p: 1,
              borderRadius: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'primary.light'
              }
            }}
          >
            <Avatar 
              sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}
              src={user.avatar ? `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}${user.avatar}` : null}
            >
              {user.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {user.username}
            </Typography>
            {user.role === 'admin' && (
              <Chip label="Admin" size="small" color="error" />
            )}
          </Box>
        )}
      </Box>
      
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActivePath(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        
        <AdminOnly>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation('/admin')}
              selected={isActivePath('/admin')}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'error.main',
                  color: 'error.contrastText',
                  '&:hover': {
                    backgroundColor: 'error.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'error.contrastText',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AdminIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Admin Panel" 
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </ListItem>
        </AdminOnly>

        {isAuthenticated && (
          <>
            <ListItem disablePadding sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 1 }}>
              <ListItemButton onClick={() => handleNavigation('/settings')}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
        
        {/* Theme Toggle for All Users */}
        <ListItem disablePadding sx={{ mt: !isAuthenticated ? 2 : 0, borderTop: !isAuthenticated ? 1 : 0, borderColor: 'divider', pt: !isAuthenticated ? 1 : 0 }}>
          <ListItemButton onClick={toggleTheme}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText primary={isDarkMode ? 'Light Mode' : 'Dark Mode'} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={2}
        sx={{ 
          bgcolor: 'background.paper',
          borderBottom: 2,
          borderColor: 'primary.light',
          boxShadow: '0 2px 8px rgba(46, 125, 50, 0.1)'
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              mr: 4,
              '&:hover': {
                color: 'primary.dark'
              }
            }}
          >
            OC-LANgenthal
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  variant={isActivePath(item.path) ? 'contained' : 'outlined'}
                  color={isActivePath(item.path) ? 'primary' : 'primary'}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: isActivePath(item.path) ? 'primary.main' : 'primary.light',
                    color: isActivePath(item.path) ? 'primary.contrastText' : 'primary.main',
                    backgroundColor: isActivePath(item.path) ? 'primary.main' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
              
              <AdminOnly>
                <Button
                  component={Link}
                  to="/admin"
                  startIcon={<AdminIcon />}
                  variant={isActivePath('/admin') ? 'contained' : 'outlined'}
                  color="error"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    ml: 1
                  }}
                >
                  Admin Panel
                </Button>
              </AdminOnly>
            </Box>
          )}

          {/* Desktop User Actions */}
          {!isMobile && isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                <IconButton
                  onClick={toggleTheme}
                  color="primary"
                  sx={{
                    border: 1,
                    borderColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              {user && (
                <Box 
                  component={Link}
                  to="/profile"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    textDecoration: 'none',
                    color: 'inherit',
                    p: 1,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Avatar 
                    sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                    src={user.avatar ? `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}${user.avatar}` : null}
                  >
                    {user.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" color="text.primary">
                    {user.username}
                  </Typography>
                  {user.role === 'admin' && (
                    <Chip label="Admin" size="small" color="error" />
                  )}
                </Box>
              )}
              <Button
                component={Link}
                to="/settings"
                startIcon={<SettingsIcon />}
                variant="outlined"
                color="primary"
                sx={{ 
                  textTransform: 'none',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    borderColor: 'primary.main'
                  }
                }}
              >
                Settings
              </Button>
              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                variant="outlined"
                color="primary"
                sx={{ 
                  textTransform: 'none',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    borderColor: 'primary.main'
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          )}

          {/* Desktop Theme Toggle for Non-Authenticated Users */}
          {!isMobile && !isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                <IconButton
                  onClick={toggleTheme}
                  color="primary"
                  sx={{
                    border: 1,
                    borderColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                <IconButton
                  onClick={toggleTheme}
                  color="primary"
                  sx={{
                    border: 1,
                    borderColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              <IconButton
                color="primary"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{
                  border: 1,
                  borderColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
            bgcolor: 'background.paper'
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;
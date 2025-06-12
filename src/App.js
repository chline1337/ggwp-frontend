import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
    Container,
    Box,
    Typography,
    Button,
    Grid,
    Card,
    Avatar
} from '@mui/material';
import {
    EmojiEvents,
    Group,
    Event
} from '@mui/icons-material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import Protected from './components/Protected';
import Profile from './components/profile/Profile';
import ProfileSettings from './components/profile/ProfileSettings';
import TeamCreate from './components/team/TeamCreate';
import Teams from './components/team/Teams';
import TeamDetail from './components/team/TeamDetail';
import TeamEdit from './components/team/TeamEdit';
import TournamentCreate from './components/tournament/TournamentCreate';
import TournamentList from './components/tournament/TournamentList';
import TournamentDetail from './components/tournament/TournamentDetail';
import TournamentEdit from './components/tournament/TournamentEdit';
import EventDetail from './components/event/EventDetail';
import EventList from './components/event/EventList';
import EventCreate from './components/event/EventCreate';
import EventEdit from './components/event/EventEdit';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRoute from './components/routes/AdminRoute';
import './App.css';

// Create golf-themed theme following frontend rules
const theme = createTheme({
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

// Protected Route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '200px' 
            }}>
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check admin role requirement
    if (adminOnly && user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

// Home Route Redirect component
const HomeRedirect = () => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '200px' 
            }}>
                Loading...
            </div>
        );
    }
    
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    minHeight: '70vh',
                    justifyContent: 'center'
                }}
            >
                {/* Hero Section */}
                <Box sx={{ mb: 6 }}>
                    <Typography
                        variant="h1"
                        component="h1"
                        sx={{
                            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #2E7D32, #4CAF50, #FF6F00)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            mb: 3,
                            letterSpacing: '-0.02em'
                        }}
                    >
                        Welcome to OC-LANgenthal
                    </Typography>
                    <Typography
                        variant="h5"
                        color="text.secondary"
                        sx={{
                            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                            fontWeight: 400,
                            maxWidth: '600px',
                            mx: 'auto',
                            lineHeight: 1.6
                        }}
                    >
                        Join the ultimate esports experience. Compete in tournaments, 
                        create teams, and connect with the gaming community.
                    </Typography>
                </Box>

                {/* Action Buttons */}
                <Box
                    sx={{
                        display: 'flex',
                        gap: 3,
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        mb: 6
                    }}
                >
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        size="large"
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            borderRadius: 2,
                            minWidth: { xs: '200px', sm: 'auto' },
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 4
                            }
                        }}
                    >
                        Login
                    </Button>
                    <Button
                        component={Link}
                        to="/signup"
                        variant="outlined"
                        size="large"
                        color="secondary"
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            borderRadius: 2,
                            minWidth: { xs: '200px', sm: 'auto' },
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 4,
                                backgroundColor: 'secondary.main',
                                color: 'secondary.contrastText'
                            }
                        }}
                    >
                        Sign Up
                    </Button>
                </Box>

                {/* Feature Cards */}
                <Grid container spacing={4} sx={{ maxWidth: '900px', mx: 'auto' }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                height: '100%',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6
                                }
                            }}
                        >
                            <Avatar
                                sx={{
                                    bgcolor: 'primary.main',
                                    width: 56,
                                    height: 56,
                                    mx: 'auto',
                                    mb: 2
                                }}
                            >
                                <EmojiEvents />
                            </Avatar>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Tournaments
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Compete in exciting tournaments and climb the leaderboards
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                height: '100%',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6
                                }
                            }}
                        >
                            <Avatar
                                sx={{
                                    bgcolor: 'secondary.main',
                                    width: 56,
                                    height: 56,
                                    mx: 'auto',
                                    mb: 2
                                }}
                            >
                                <Group />
                            </Avatar>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Teams
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Create or join teams and collaborate with fellow gamers
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                height: '100%',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6
                                }
                            }}
                        >
                            <Avatar
                                sx={{
                                    bgcolor: 'success.main',
                                    width: 56,
                                    height: 56,
                                    mx: 'auto',
                                    mb: 2
                                }}
                            >
                                <Event />
                            </Avatar>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Events
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Discover and participate in gaming events near you
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

function App() {

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                        <Navbar />
                        <Box component="main" sx={{ flexGrow: 1 }}>
                            <Routes>
                                <Route path="/" element={<HomeRedirect />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/protected" element={<Protected />} />
                                <Route path="/profile" element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                } />
                                <Route path="/settings" element={
                                    <ProtectedRoute>
                                        <ProfileSettings />
                                    </ProtectedRoute>
                                } />
                                <Route path="/team-create" element={<TeamCreate />} />
                                <Route path="/teams" element={<Teams />} />
                                <Route path="/teams/:teamId" element={<TeamDetail />} />
                                <Route path="/teams/:teamId/edit" element={
                                    <ProtectedRoute>
                                        <TeamEdit />
                                    </ProtectedRoute>
                                } />
                                <Route path="/tournament-create" element={<TournamentCreate />} />
                                <Route path="/tournaments" element={<TournamentList />} />
                                <Route path="/tournaments/:id" element={<TournamentDetail />} />
                                <Route path="/tournaments/:id/edit" element={
                                    <ProtectedRoute>
                                        <TournamentEdit />
                                    </ProtectedRoute>
                                } />
                                <Route path="/events" element={<EventList />} />
                                <Route path="/events/:eventId" element={<EventDetail />} />
                                <Route path="/events/:eventId/edit" element={
                                    <ProtectedRoute>
                                        <EventEdit />
                                    </ProtectedRoute>
                                } />
                                <Route path="/create-event" element={
                                    <ProtectedRoute>
                                        <EventCreate />
                                    </ProtectedRoute>
                                } />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/admin"
                                    element={
                                        <AdminRoute>
                                            <AdminDashboard />
                                        </AdminRoute>
                                    }
                                />
                            </Routes>
                        </Box>
                    </Box>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
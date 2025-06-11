import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import Protected from './components/Protected';
import Profile from './components/profile/Profile';
import TeamCreate from './components/team/TeamCreate';
import Teams from './components/team/Teams';
import TournamentCreate from './components/tournament/TournamentCreate';
import TournamentList from './components/tournament/TournamentList';
import TournamentDetail from './components/tournament/TournamentDetail';
import EventDetail from './components/event/EventDetail';
import EventList from './components/event/EventList';
import EventCreate from './components/event/EventCreate';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminRoute from './components/routes/AdminRoute';
import './App.css';
import './styles.css';

// Create theme
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2E7D32', // Golf green
            light: '#4CAF50',
            dark: '#1B5E20',
        },
        secondary: {
            main: '#FF6F00', // Orange
            light: '#FF8F00',
            dark: '#E65100',
        },
        background: {
            default: '#F5F5F5',
            paper: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
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
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
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
const HomeRedirect = ({ isLoggedIn }) => {
    if (isLoggedIn) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="home-container">
            <h1>Welcome to Esports Platform</h1>
            <p>Join the ultimate esports experience today!</p>
            <div className="home-buttons">
                <Link to="/login">Login</Link>
                <Link to="/signup" className="signup">Sign Up</Link>
            </div>
        </div>
    );
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setIsLoggedIn(!!token);
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <div className="app-container">
                        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                        <div className="container">
                            <Routes>
                                <Route path="/" element={
                                    <HomeRedirect isLoggedIn={isLoggedIn} />
                                } />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/protected" element={<Protected />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/team-create" element={<TeamCreate />} />
                                <Route path="/teams" element={<Teams />} />
                                <Route path="/tournament-create" element={<TournamentCreate />} />
                                <Route path="/tournaments" element={<TournamentList />} />
                                <Route path="/tournaments/:id" element={<TournamentDetail />} />
                                <Route path="/events" element={<EventList />} />
                                <Route path="/events/:eventId" element={<EventDetail isLoggedIn={isLoggedIn} />} />
                                <Route path="/create-event" element={<EventCreate isLoggedIn={isLoggedIn} />} />
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
                        </div>
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
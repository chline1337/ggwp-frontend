import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Login from './components/Login';
import Protected from './components/Protected';
import Profile from './components/Profile';
import TeamCreate from './components/TeamCreate';
import Teams from './components/Teams';
import TournamentCreate from './components/TournamentCreate';
import TournamentList from './components/TournamentList';
import TournamentDetail from './components/TournamentDetail';
import './App.css';
import './styles.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <div className="container">
                    <Routes>
                        <Route path="/" element={
                            <div className="home-container">
                                <h1>Welcome to Esports Platform</h1>
                                <p>Join the ultimate esports experience today!</p>
                                {!isLoggedIn && (
                                    <div className="home-buttons">
                                        <Link to="/login">Login</Link>
                                        <Link to="/signup" className="signup">Sign Up</Link>
                                    </div>
                                )}
                            </div>
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
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
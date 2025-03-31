import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Login from './components/Login';
import Protected from './components/Protected';
import Profile from './components/profile/Profile';
import TeamCreate from './components/team/TeamCreate';
import Teams from './components/team/Teams';
import TournamentCreate from './components/tournament/TournamentCreate';
import TournamentList from './components/tournament/TournamentList';
import TournamentDetail from './components/tournament/TournamentDetail';
import EventDetail from './components/event/EventDetail';
import EventList from './components/event/EventList';
import EventCreate from './components/event/EventCreate'; // Add this
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
                <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} /> {/* Update prop */}
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
                        <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} /> {/* Update prop */}
                        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} /> {/* Update prop */}
                        <Route path="/protected" element={<Protected />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/team-create" element={<TeamCreate />} />
                        <Route path="/teams" element={<Teams />} />
                        <Route path="/tournament-create" element={<TournamentCreate />} />
                        <Route path="/tournaments" element={<TournamentList />} />
                        <Route path="/tournaments/:id" element={<TournamentDetail />} />
                        <Route path="/events" element={<EventList />} />
                        <Route path="/events/:eventId" element={<EventDetail isLoggedIn={isLoggedIn} />} /> {/* Update prop */}
                        <Route path="/create-event" element={<EventCreate isLoggedIn={isLoggedIn} />} /> {/* Add this */}
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
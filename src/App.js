import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Protected from './components/Protected';
import Profile from './components/Profile';
import TeamCreate from './components/TeamCreate';
import Teams from './components/Teams';
import TournamentCreate from './components/TournamentCreate';
import Tournaments from './components/Tournaments';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <h1>Esports Platform MVP</h1>
                <Routes>
                    <Route path="/" element={<p>Welcome! <a href="/signup">Sign Up</a> or <a href="/login">Login</a></p>} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/protected" element={<Protected />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/team-create" element={<TeamCreate />} />
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/tournament-create" element={<TournamentCreate />} />
                    <Route path="/tournaments" element={<Tournaments />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
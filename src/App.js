import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Protected from './components/Protected';
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
                </Routes>
            </div>
        </Router>
    );
}

export default App;
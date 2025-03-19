import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if token exists in localStorage to determine login status
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token); // !! converts to boolean (true if token exists)
    }, []); // Empty dependency array runs once on mount

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setIsLoggedIn(false); // Update state on logout
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Esports</Link>
            </div>
            <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
                <li><Link to="/tournaments">Tournaments</Link></li>
                <li><Link to="/teams">Teams</Link></li>
                <li><Link to="/profile">Profile</Link></li>

            </ul>
            <div className={`navbar-logout ${isOpen ? 'active' : ''}`}>
                {isLoggedIn && (
                    <button onClick={handleLogout}>Logout</button>
                )}
            </div>
            <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>☰</div>
        </nav>
    );
}

export default Navbar;
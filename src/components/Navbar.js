import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminOnly } from '../components/common/RoleBasedComponent';
import './Navbar.css';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Esports</Link>
            </div>
            <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
                {isAuthenticated && <li><Link to="/dashboard">Dashboard</Link></li>}
                <AdminOnly>
                    <li>
                        <Link to="/admin" style={{ color: '#f44336', fontWeight: 'bold' }}>
                            Admin Panel
                        </Link>
                    </li>
                </AdminOnly>
                <li><Link to="/tournaments">Tournaments</Link></li>
                <li><Link to="/events">Events</Link></li>
                <li><Link to="/teams">Teams</Link></li>
                {isAuthenticated && <li><Link to="/profile">Profile</Link></li>}
                {isAuthenticated && <li><Link to="/create-event">Create Event</Link></li>}
            </ul>
            <div className={`navbar-logout ${isOpen ? 'active' : ''}`}>
                {isAuthenticated && (
                    <button onClick={handleLogout}>Logout</button>
                )}
            </div>
            <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>☰</div>
        </nav>
    );
}

export default Navbar;
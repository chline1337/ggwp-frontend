// src/components/profile/ProfileButtons.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileButtons() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <div className="profile-buttons">
            <button onClick={() => navigate('/teams')}>My Teams</button>
            <button onClick={() => navigate('/tournaments')}>Tournaments</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default ProfileButtons;
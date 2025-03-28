// src/components/profile/ProfileInfo.js
import React from 'react';

function ProfileInfo({ username, email }) {
    return (
        <div className="profile-info">
            <p>Username: {username}</p>
            <p>Email: {email}</p>
        </div>
    );
}

export default ProfileInfo;
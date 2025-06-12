// src/components/profile/ProfileInfo.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitch, faTwitter, faDiscord } from '@fortawesome/free-brands-svg-icons';

function ProfileInfo({ username, email, avatar, bio, socialLinks }) {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
    const avatarUrl = avatar ? `${baseUrl}${avatar}` : null;

    const platformIcons = {
        twitch: faTwitch,
        twitter: faTwitter,
        discord: faDiscord,
    };

    return (
        <div className="profile-info">
            {avatarUrl && <img src={avatarUrl} alt="Profile Avatar" className="profile-avatar" />}
            <p>Username: {username}</p>
            <p>Email: {email}</p>
            {bio && <p className="profile-bio">{bio}</p>}
            {socialLinks && socialLinks.length > 0 && (
                <div className="social-links">
                    {socialLinks.map((link, index) => (
                        <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={platformIcons[link.platform]} className="social-icon" />
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProfileInfo;
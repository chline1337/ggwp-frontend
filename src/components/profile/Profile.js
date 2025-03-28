// src/components/profile/Profile.js
import React from 'react';
import useProfileActions from '../../hooks/useProfileActions';
import ProfileInfo from './ProfileInfo';
import GameAccounts from './GameAccounts';
import AddGameForm from './AddGameForm';
import ProfileButtons from './ProfileButtons';
import './Profile.css';

function Profile() {
    const { user, loading, addGameAccount, removeGameAccount } = useProfileActions();

    if (loading) return <p>Loading...</p>;
    if (!user) return null;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>Profile</h2>
                <ProfileInfo username={user.username} email={user.email} />
                <GameAccounts gameAccounts={user.gameAccounts} removeGameAccount={removeGameAccount} />
                <AddGameForm addGameAccount={addGameAccount} />
                <ProfileButtons />
            </div>
        </div>
    );
}

export default Profile;
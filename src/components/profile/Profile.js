// src/components/profile/Profile.js
import React from 'react';
import useProfileActions from '../../hooks/useProfileActions';
import useTeamActions from '../../hooks/useTeamActions';
import ProfileInfo from './ProfileInfo';
import GameAccounts from './GameAccounts';
import AddGameForm from './AddGameForm';
import ProfileButtons from './ProfileButtons';
import TeamAffiliations from './TeamAffiliations';
import ProfileSettings from './ProfileSettings';
import './Profile.css';

function Profile() {
    const { user, loading, addGameAccount, removeGameAccount, updateProfile, uploadAvatar } = useProfileActions();
    const { teams } = useTeamActions();

    if (loading) return <p>Loading...</p>;
    if (!user) return null;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>Profile</h2>
                <ProfileInfo
                    username={user.username}
                    email={user.email}
                    avatar={user.avatar}
                    bio={user.bio}
                    socialLinks={user.socialLinks}
                />
                <GameAccounts gameAccounts={user.gameAccounts} removeGameAccount={removeGameAccount} />
                <AddGameForm addGameAccount={addGameAccount} />
                <TeamAffiliations teams={teams} />
                <ProfileSettings uploadAvatar={uploadAvatar} updateProfile={updateProfile} />
                <ProfileButtons />
            </div>
        </div>
    );
}

export default Profile;
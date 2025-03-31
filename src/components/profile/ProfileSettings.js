// src/components/profile/ProfileSettings.js
import React, { useState } from 'react';

function ProfileSettings({ uploadAvatar, updateProfile }) {
    const [file, setFile] = useState(null);
    const [socialLinks, setSocialLinks] = useState({
        twitch: '',
        twitter: '',
        discord: '',
    });

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSocialChange = (e) => {
        setSocialLinks({ ...socialLinks, [e.target.name]: e.target.value });
    };

    const handleAvatarSubmit = (e) => {
        e.preventDefault();
        if (file) uploadAvatar(file);
    };

    const handleSocialSubmit = (e) => {
        e.preventDefault();
        const updatedLinks = Object.entries(socialLinks)
            .filter(([_, url]) => url.trim() !== '')
            .map(([platform, url]) => ({ platform, url }));
        if (updatedLinks.length > 0) updateProfile({ socialLinks: updatedLinks });
    };

    return (
        <div className="profile-settings-form">
            <h3>Profile Settings</h3>
            <form onSubmit={handleAvatarSubmit}>
                <div className="form-input-group">
                    <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleFileChange}
                    />
                </div>
                <button type="submit" disabled={!file}>Upload Avatar</button>
            </form>
            <form onSubmit={handleSocialSubmit}>
                <div className="form-input-group">
                    <input
                        type="text"
                        name="twitch"
                        placeholder="Twitch URL"
                        value={socialLinks.twitch}
                        onChange={handleSocialChange}
                    />
                </div>
                <div className="form-input-group">
                    <input
                        type="text"
                        name="twitter"
                        placeholder="Twitter URL"
                        value={socialLinks.twitter}
                        onChange={handleSocialChange}
                    />
                </div>
                <div className="form-input-group">
                    <input
                        type="text"
                        name="discord"
                        placeholder="Discord Invite URL"
                        value={socialLinks.discord}
                        onChange={handleSocialChange}
                    />
                </div>
                <button type="submit">Update Social Links</button>
            </form>
        </div>
    );
}

export default ProfileSettings;
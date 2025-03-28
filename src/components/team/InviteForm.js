// src/components/team/InviteForm.js
import React, { useState } from 'react';

function InviteForm({ teamId, sendInvite }) {
    const [username, setUsername] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        sendInvite(teamId, username);
        setUsername('');
    };

    return (
        <form className="invite-form" onSubmit={handleSubmit}>
            <input
                type="text"
                name="username"
                placeholder="Invite Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input type="hidden" name="teamId" value={teamId} />
            <button type="submit">Invite</button>
        </form>
    );
}

export default InviteForm;
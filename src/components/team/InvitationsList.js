// src/components/team/InvitationsList.js
import React from 'react';

function InvitationsList({ invitations, currentUserId, teamId, respondToInvite }) {
    return (
        <div className="team-invitations">
            <h4>Pending Invitations</h4>
            <ul>
                {invitations.map((inv, index) => (
                    <li key={index}>
                        {inv.user.username}
                        {inv.user._id.toString() === currentUserId && (
                            <>
                                <button onClick={() => respondToInvite(teamId, true)}>Accept</button>
                                <button onClick={() => respondToInvite(teamId, false)}>Decline</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default InvitationsList;
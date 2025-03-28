// src/components/team/TeamCard.js
import React from 'react';
import InviteForm from './InviteForm';
import InvitationsList from './InvitationsList';

function TeamCard({ team, currentUserId, sendInvite, respondToInvite, deleteTeam }) {
    const isCaptain = team.captain._id.toString() === currentUserId;

    return (
        <div className="team-card">
            <h3>{team.name}</h3>
            <p>{team.description}</p>
            <p>Captain: {team.captain.username}</p>
            <div className="team-members">
                <h4>Members</h4>
                <ul>
                    {team.members.map((member, index) => (
                        <li key={index}>{member.user.username} ({member.role})</li>
                    ))}
                </ul>
            </div>
            {isCaptain && (
                <>
                    <InviteForm teamId={team._id} sendInvite={sendInvite} />
                    <button onClick={() => deleteTeam(team._id)}>Delete Team</button>
                </>
            )}
            <InvitationsList
                invitations={team.invitations}
                currentUserId={currentUserId}
                teamId={team._id}
                respondToInvite={respondToInvite}
            />
        </div>
    );
}

export default TeamCard;
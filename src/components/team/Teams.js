// src/components/team/Teams.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useTeamActions from '../../hooks/useTeamActions';
import TeamCard from './TeamCard';
import './Teams.css';

function Teams() {
    const { teams, loading, sendInvite, respondToInvite, deleteTeam } = useTeamActions();
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('userId');

    if (loading) return <p>Loading...</p>;

    return (
        <div className="teams-container">
            <button className="create-team-btn" onClick={() => navigate('/team-create')}>
                Create New Team
            </button>
            {teams.length === 0 ? (
                <p>No teams available.</p>
            ) : (
                teams.map((team) => (
                    <TeamCard
                        key={team._id}
                        team={team}
                        currentUserId={currentUserId}
                        sendInvite={sendInvite}
                        respondToInvite={respondToInvite}
                        deleteTeam={deleteTeam}
                    />
                ))
            )}
        </div>
    );
}

export default Teams;
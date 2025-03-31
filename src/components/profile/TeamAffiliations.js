// src/components/profile/TeamAffiliations.js
import React from 'react';
import { Link } from 'react-router-dom';

function TeamAffiliations({ teams }) {
    return (
        <div className="team-affiliations">
            <h3>Team Affiliations</h3>
            {teams.length === 0 ? (
                <p>No teams yet.</p>
            ) : (
                <ul>
                    {teams.map((team) => (
                        <li key={team._id}>
                            <Link to={`/teams/${team._id}`}>{team.name}</Link> {/* Hypothetical team page */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default TeamAffiliations;
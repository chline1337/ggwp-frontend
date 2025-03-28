// src/components/tournament/TournamentCard.js
import React from 'react';
import { Link } from 'react-router-dom';

function TournamentCard({ tournament }) {
    return (
        <Link to={`/tournaments/${tournament._id}`} className="tournament-card-link">
            <div className="tournament-card">
                <h3>{tournament.name}</h3>
                <p>Game: {tournament.game}</p>
                <p>Format: {tournament.format.replace('_', ' ')}</p>
                <p>Type: {tournament.participantType}</p>
                <p>Status: {tournament.status}</p>
            </div>
        </Link>
    );
}

export default TournamentCard;
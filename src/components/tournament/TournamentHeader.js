// src/components/tournament/TournamentHeader.js
import React from 'react';

function TournamentHeader({ tournament }) {
    return (
        <>
            <h3>{tournament.name} ({tournament.game})</h3>
            <p>Format: {tournament.format.replace('_', ' ')} | Type: {tournament.participantType}</p>
            <p>Organizer: {tournament.organizer.username} | Status: {tournament.status}</p>
        </>
    );
}

export default TournamentHeader;
// src/components/tournament/TournamentCreate.js
import React from 'react';
import useTournamentActions from '../../hooks/useTournamentActions';
import TournamentCreateForm from './TournamentCreateForm';
import './TournamentDetail.css'; // Shared styles

function TournamentCreate() {
    const { createTournament } = useTournamentActions();

    return (
        <div className="tournament-create-container">
            <TournamentCreateForm createTournament={createTournament} />
        </div>
    );
}

export default TournamentCreate;
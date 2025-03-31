// src/components/tournament/TournamentCreate.js
import React, { useState } from 'react';
import useTournamentActions from '../../hooks/useTournamentActions';
import useTeamActions from '../../hooks/useTeamActions'; // Import team actions
import TournamentCreateForm from './TournamentCreateForm';
import './TournamentDetail.css';

function TournamentCreate() {
    const { createTournament } = useTournamentActions();
    const { allTeams } = useTeamActions(); // Fetch all teams
    const [selectedTeams, setSelectedTeams] = useState([]); // Track pre-added teams

    const handleCreateTournament = (formData) => {
        // Add selected teams to participants if team-based tournament
        if (formData.participantType === 'team') {
            formData.participants = selectedTeams;
        }
        createTournament(formData);
    };

    return (
        <div className="tournament-create-container">
            <TournamentCreateForm
                createTournament={handleCreateTournament}
                allTeams={allTeams}
                selectedTeams={selectedTeams}
                setSelectedTeams={setSelectedTeams}
            />
        </div>
    );
}

export default TournamentCreate;
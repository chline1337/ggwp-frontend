// src/components/tournament/AddTeamForm.js
import React, { useState } from 'react';
import axios from 'axios';

function AddTeamForm({ tournamentId, allTeams, refreshTournament }) {
    const [selectedTeamId, setSelectedTeamId] = useState('');

    const addTeamToTournament = async () => {
        if (!selectedTeamId) {
            alert('Please select a team');
            return;
        }
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/signup`, {
                tournamentId,
                teamId: selectedTeamId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Team added successfully');
            setSelectedTeamId('');
            refreshTournament();
        } catch (err) {
            alert(err.response?.data.msg || 'Failed to add team');
        }
    };

    return (
        <div className="add-team-form">
            <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="team-select"
            >
                <option value="">Select a team</option>
                {allTeams.map((team) => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                ))}
            </select>
            <button onClick={addTeamToTournament}>Add Team</button>
        </div>
    );
}

export default AddTeamForm;
// src/components/tournament/TournamentCreateForm.js
import React, { useState } from 'react';

function TournamentCreateForm({ createTournament }) {
    const [formData, setFormData] = useState({
        name: '',
        game: '',
        format: 'single_elimination',
        participantType: 'user',
        maxParticipants: '4',
        groups: '',
        groupSize: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createTournament(formData);
    };

    return (
        <form className="tournament-create-form" onSubmit={handleSubmit}>
            <h2>Create Tournament</h2>
            <div className="form-input-group">
                <input
                    type="text"
                    name="name"
                    placeholder="Tournament Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-input-group">
                <input
                    type="text"
                    name="game"
                    placeholder="Game"
                    value={formData.game}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-input-group">
                <select name="format" value={formData.format} onChange={handleChange}>
                    <option value="single_elimination">Single Elimination</option>
                    <option value="group_stage">Group Stage</option>
                </select>
            </div>
            <div className="form-input-group">
                <select name="participantType" value={formData.participantType} onChange={handleChange}>
                    <option value="user">Individual</option>
                    <option value="team">Team</option>
                </select>
            </div>
            {formData.format === 'single_elimination' && (
                <div className="form-input-group">
                    <select
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        required
                    >
                        <option value="4">4 Players/Teams</option>
                        <option value="8">8 Players/Teams</option>
                        <option value="16">16 Players/Teams</option>
                        <option value="32">32 Players/Teams</option>
                        <option value="64">64 Players/Teams</option>
                    </select>
                </div>
            )}
            {formData.format === 'group_stage' && (
                <>
                    <div className="form-input-group">
                        <input
                            type="number"
                            name="groups"
                            placeholder="Number of Groups"
                            value={formData.groups}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-input-group">
                        <input
                            type="number"
                            name="groupSize"
                            placeholder="Group Size"
                            value={formData.groupSize}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </>
            )}
            <button type="submit">Create</button>
        </form>
    );
}

export default TournamentCreateForm;
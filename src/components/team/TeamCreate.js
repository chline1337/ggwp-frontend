// src/components/team/TeamCreate.js
import React, { useState } from 'react';
import useTeamActions from '../../hooks/useTeamActions';
import './TeamCreate.css';

function TeamCreate() {
    const { createTeam } = useTeamActions();
    const [formData, setFormData] = useState({ name: '', description: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createTeam(formData);
    };

    return (
        <div className="team-create-container">
            <form className="team-create-form" onSubmit={handleSubmit}>
                <h2>Create Team</h2>
                <div className="form-input-group">
                    <input
                        type="text"
                        name="name"
                        placeholder="Team Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-input-group">
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Create</button>
            </form>
        </div>
    );
}

export default TeamCreate;
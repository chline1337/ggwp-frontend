import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TournamentCreate() {
    const [formData, setFormData] = useState({
        name: '', game: '', format: 'single_elimination', participantType: 'user',
        maxParticipants: '', groups: '', groupSize: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/create`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Tournament created');
            navigate('/tournaments');
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    return (
        <div>
            <h2>Create Tournament</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Tournament Name" onChange={handleChange} required />
                <input type="text" name="game" placeholder="Game" onChange={handleChange} required />
                <select name="format" onChange={handleChange}>
                    <option value="single_elimination">Single Elimination</option>
                    <option value="group_stage">Group Stage</option>
                </select>
                <select name="participantType" onChange={handleChange}>
                    <option value="user">Individual</option>
                    <option value="team">Team</option>
                </select>
                {formData.format === 'single_elimination' && (
                    <input type="number" name="maxParticipants" placeholder="Max Participants" onChange={handleChange} required />
                )}
                {formData.format === 'group_stage' && (
                    <>
                        <input type="number" name="groups" placeholder="Number of Groups" onChange={handleChange} required />
                        <input type="number" name="groupSize" placeholder="Group Size" onChange={handleChange} required />
                    </>
                )}
                <button type="submit">Create</button>
            </form>
        </div>
    );
}

export default TournamentCreate;
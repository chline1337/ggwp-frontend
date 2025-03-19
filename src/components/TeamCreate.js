import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './TeamCreate.css';

function TeamCreate() {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/team/create`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Team created successfully');
            navigate('/teams');
        } catch (err) {
            alert(err.response.data.msg);
        }
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
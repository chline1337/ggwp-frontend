import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EventCreate.css';

const EventCreate = ({ isLoggedIn }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        location: '',
        maxParticipants: '',
        rows: '',
        columns: ''
    });
    const navigate = useNavigate();

    if (!isLoggedIn) {
        navigate('/login');
        return null;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${process.env.REACT_APP_API_URL}/api/event/create`, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => navigate(`/events/${response.data._id}`))
            .catch(error => alert('Error creating event: ' + error.response.data.msg));
    };

    return (
        <div className="event-create-container">
            <h2>Create a Lan-Party</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Event Name" onChange={handleChange} required />
                <textarea name="description" placeholder="Description" onChange={handleChange} />
                <input name="date" type="datetime-local" onChange={handleChange} required />
                <input name="location" placeholder="Location" onChange={handleChange} required />
                <input name="maxParticipants" type="number" placeholder="Max Participants" onChange={handleChange} required />
                <input name="rows" type="number" placeholder="Seatplan Rows" onChange={handleChange} required />
                <input name="columns" type="number" placeholder="Seatplan Columns" onChange={handleChange} required />
                <button type="submit">Create Event</button>
            </form>
        </div>
    );
};

export default EventCreate;
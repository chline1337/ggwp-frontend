import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './EventList.css';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/event`);
            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Failed to load events. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    if (loading) return <div>Loading events...</div>;
    if (error) return <div>{error}</div>;
    if (events.length === 0) return <div>No upcoming events found. <button onClick={fetchEvents}>Refresh</button></div>;

    return (
        <div className="event-list-container">
            <h2>Upcoming Lan-Parties</h2>
            <button onClick={fetchEvents}>Refresh Events</button>
            <div className="event-list">
                {events.map(event => (
                    <div key={event._id} className="event-card" onClick={() => navigate(`/events/${event._id}`)}>
                        <h3>{event.name}</h3>
                        <p>{event.description}</p>
                        <p>Date: {new Date(event.date).toLocaleString()}</p>
                        <p>Location: {event.location}</p>
                        <p>Participants: {event.participants.length}/{event.maxParticipants}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventList;
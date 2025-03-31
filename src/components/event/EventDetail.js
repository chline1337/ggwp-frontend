import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AddUserForm from './AddUserForm';
import './EventDetail.css';

const EventDetail = ({ isLoggedIn }) => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const currentUserId = localStorage.getItem('userId');
    const isSignedUp = event && event.participants.some(p => p._id === currentUserId);
    const isOrganizer = event && event.createdBy && event.createdBy._id === currentUserId;

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const eventResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/event/${eventId}`);
                setEvent(eventResponse.data);
            } catch (error) {
                console.error('Error fetching event:', error);
                setError('Failed to load event. It may not exist or there was a server error.');
            }
        };

        const fetchUsers = async () => {
            try {
                const usersResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/user`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setUsers(usersResponse.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchEvent();
        if (isLoggedIn) fetchUsers();
    }, [eventId, isLoggedIn]);

    const refreshEvent = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/event/${eventId}`);
            setEvent(response.data);
        } catch (error) {
            console.error('Error refreshing event:', error);
        }
    };

    const handleSignup = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/api/event/${eventId}/signup`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(() => setEvent(prev => ({ ...prev, participants: [...prev.participants, { _id: currentUserId }] })))
            .catch(error => alert(error.response.data.msg));
    };

    if (error) return <div>{error}</div>;
    if (!event) return <div>Loading...</div>;

    return (
        <div className="event-detail-container">
            <h2>{event.name}</h2>
            <p>{event.description}</p>
            <p>Date: {new Date(event.date).toLocaleString()}</p>
            <p>Location: {event.location}</p>
            {isLoggedIn && !isSignedUp && (
                <button onClick={handleSignup}>Sign Up</button>
            )}
            {isOrganizer && event.status === 'upcoming' && (
                <AddUserForm eventId={eventId} users={users} refreshEvent={refreshEvent} />
            )}
            {isSignedUp && <Seatplan event={event} refreshEvent={refreshEvent} />}
        </div>
    );
};

const Seatplan = ({ event, refreshEvent }) => {
    const [seatplan, setSeatplan] = useState(event.seatplan);
    const currentUserId = localStorage.getItem('userId');
    const userSeat = seatplan.assignments.find(a => a.user._id === currentUserId);

    const handleSeatSelect = (row, column) => {
        axios.post(`${process.env.REACT_APP_API_URL}/api/event/${event._id}/select-seat`, { row, column }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(() => {
                setSeatplan(prev => ({
                    ...prev,
                    assignments: [...prev.assignments, { row, column, user: { _id: currentUserId } }]
                }));
                alert('Seat selected!');
            })
            .catch(error => alert(error.response.data.msg));
    };

    const handleUnclaimSeat = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/api/event/${event._id}/unclaim-seat`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(() => {
                setSeatplan(prev => ({
                    ...prev,
                    assignments: prev.assignments.filter(a => a.user._id !== currentUserId)
                }));
                alert('Seat unclaimed!');
            })
            .catch(error => alert(error.response.data.msg));
    };

    const seatGrid = Array.from({ length: seatplan.rows }, () => Array(seatplan.columns).fill(false));
    seatplan.assignments.forEach(a => {
        seatGrid[a.row - 1][a.column - 1] = true;
    });

    return (
        <div className="seatplan">
            <h3>Select Your Seat</h3>
            {userSeat && (
                <div>
                    <p>Your current seat: {userSeat.row}-{userSeat.column}</p>
                    <button onClick={handleUnclaimSeat}>Unclaim Seat</button>
                </div>
            )}
            {seatGrid.map((row, rowIndex) => (
                <div key={rowIndex} className="seat-row">
                    {row.map((isTaken, colIndex) => (
                        <button
                            key={colIndex}
                            className={`seat ${isTaken ? 'taken' : 'available'}`}
                            onClick={() => !isTaken && handleSeatSelect(rowIndex + 1, colIndex + 1)}
                            disabled={isTaken}
                        >
                            {rowIndex + 1}-{colIndex + 1}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default EventDetail;
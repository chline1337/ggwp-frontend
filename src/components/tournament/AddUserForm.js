// src/components/tournament/AddUserForm.js
import React, { useState } from 'react';
import axios from 'axios';

function AddUserForm({ tournamentId, users, refreshTournament }) {
    const [selectedUserId, setSelectedUserId] = useState('');

    const addUserToTournament = async () => {
        if (!selectedUserId) {
            alert('Please select a user');
            return;
        }
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/tournament/signup`, {
                tournamentId,
                userId: selectedUserId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('User added successfully');
            setSelectedUserId('');
            refreshTournament();
        } catch (err) {
            alert(err.response?.data.msg || 'Failed to add user');
        }
    };

    return (
        <div className="add-user-form">
            <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="user-select"
            >
                <option value="">Select a user</option>
                {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.username}</option>
                ))}
            </select>
            <button onClick={addUserToTournament}>Add User</button>
        </div>
    );
}

export default AddUserForm;
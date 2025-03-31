import React, { useState } from 'react';
import axios from 'axios';

const AddUserForm = ({ eventId, users, refreshEvent }) => {
    const [selectedUser, setSelectedUser] = useState('');

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!selectedUser) return alert('Please select a user');
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/event/${eventId}/add-user`,
                { userId: selectedUser },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setSelectedUser('');
            refreshEvent(); // Refresh event data after adding
        } catch (error) {
            alert(error.response.data.msg);
        }
    };

    return (
        <form onSubmit={handleAddUser} className="add-user-form">
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">Select a user</option>
                {users.map(user => (
                    <option key={user._id} value={user._id}>{user.username}</option>
                ))}
            </select>
            <button type="submit">Add User</button>
        </form>
    );
};

export default AddUserForm;